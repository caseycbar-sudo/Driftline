/**
 * Driftline billing rules.
 *
 * - Weekly meal prep: when the chef completes a visit, the customer's saved card
 *   is charged the package price plus the grocery receipt, if they've agreed to
 *   autopay. Otherwise the charge waits (status "pending") and runs as soon as
 *   they save a card, or Casey sends a pay link instead. A grocery total above
 *   GROCERY_REVIEW_CENTS waits (status "review") for Casey to approve it.
 * - Private dinners and catering: Casey sends a Square pay link for the amount
 *   in his proposal; it's marked paid when Square tells us (webhook) or when he
 *   taps "Check payment".
 */
import { getEvent } from "../db/schedule";
import { getPricing } from "../db/pricing";
import {
  claimPayment,
  createPayLinkRow,
  getBillingProfile,
  getPayment,
  getVisitCharge,
  listPaymentsForEvent,
  listPendingVisitCharges,
  setBillingEnvironment,
  updatePayment,
  upsertVisitCharge,
  type BillingProfile,
  type PaymentRow,
} from "../db/payments";
import { findPackage, dollars } from "./pricing-core";
import { GROCERY_REVIEW_CENTS, LIVE_SQUARE_PAYMENT, nextVisitChargeKey } from "./billing-core";
import {
  chargeCard,
  createPaymentLink,
  deletePaymentLink,
  findPaymentsByReference,
  retrieveCard,
  retrieveCustomer,
  retrieveOrder,
  retrievePayment,
  squareConfig,
  type SquarePayment,
} from "./square";
import { escapeHtml, ownerEmails, publicSiteUrl, sendEmail } from "./notify";
import { prettyVisitDate } from "./visit-emails";

export type ChargeOutcome =
  | { outcome: "paid"; amountCents: number; message: string }
  | { outcome: "failed"; message: string }
  | { outcome: "awaiting-card"; message: string }
  | { outcome: "not-autopay"; message: string }
  | { outcome: "already"; message: string }
  | { outcome: "held"; message: string }
  | { outcome: "error"; message: string };

/**
 * The customer's billing profile, but only when its Square customer and card
 * belong to the Square in use. Ids made in sandbox mean nothing in production
 * (and the reverse), so a profile from the other environment counts as no card.
 * Profiles saved before the environment was recorded are checked with Square
 * once and then stamped.
 */
export async function billingProfileFor(email: string): Promise<BillingProfile | null> {
  const profile = await getBillingProfile(email);
  const config = squareConfig();
  if (!profile || !config) return profile;
  if (profile.environment === config.environment) return profile;
  if (profile.environment) return null;
  const known = profile.cardId
    ? await retrieveCard(profile.cardId).then((r) => r.ok && r.data.card.enabled !== false)
    : await retrieveCustomer(profile.squareCustomerId).then((r) => r.ok);
  if (!known) return null;
  await setBillingEnvironment(profile.email, config.environment);
  return { ...profile, environment: config.environment };
}

/** Hide rows recorded against the other Square (test charges after go-live, or the reverse). */
export function forCurrentSquare<T extends { environment: string }>(rows: T[]): T[] {
  const environment = squareConfig()?.environment;
  return environment ? rows.filter((r) => !r.environment || r.environment === environment) : rows;
}

/** Work out what a completed meal prep visit costs and record it; charge the card if we can. */
export async function chargeCompletedVisit(eventId: number): Promise<ChargeOutcome> {
  const event = await getEvent(eventId);
  if (!event || event.status !== "completed") return { outcome: "error", message: "Visit isn't completed." };
  if (event.serviceType !== "meal_prep") return { outcome: "not-autopay", message: "Casey bills dinners and events with a pay link." };
  if (!event.customerEmail) return { outcome: "not-autopay", message: "No customer account on this visit. Casey will bill it." };

  const pricing = await getPricing();
  const packageCents = event.priceCents || findPackage(pricing, event.packageName)?.priceCents || 0;
  // The chef brings spices, oil, salt and pepper; that flat kit charge rides with the visit.
  const kitCents = packageCents ? Math.max(0, pricing.pantryKitCents || 0) : 0;
  const serviceCents = packageCents + kitCents;
  if (!serviceCents) return { outcome: "not-autopay", message: "No price set for this visit. Casey will bill it." };

  const held = event.groceryCents > GROCERY_REVIEW_CENTS;
  const payment = await upsertVisitCharge({
    scheduleEventId: event.id,
    customerEmail: event.customerEmail,
    description: `${event.packageName || "Meal prep"} visit, ${prettyVisitDate(event.serviceDate)}${kitCents ? ` (includes ${dollars(kitCents)} pantry kit)` : ""}`,
    serviceCents,
    groceryCents: event.groceryCents,
    environment: squareConfig()?.environment ?? "",
    status: held ? "review" : "pending",
  });
  if (payment.status === "review") {
    if (held) await emailOwnerReview(payment);
    return { outcome: "held", message: `Groceries over ${dollars(GROCERY_REVIEW_CENTS)}: waiting for Casey to approve the charge.` };
  }
  return runVisitCharge(payment);
}

/** Owner approves a held charge (large grocery total) and it runs right away. */
export async function approveHeldCharge(paymentId: number): Promise<ChargeOutcome> {
  if (!(await claimPayment(paymentId, ["review"], "pending", { error: "" }))) {
    return { outcome: "already", message: "This charge isn't waiting for approval any more." };
  }
  const payment = await getPayment(paymentId);
  return payment ? runVisitCharge(payment) : { outcome: "error", message: "Payment not found." };
}

const HOUR = 60 * 60 * 1000;

/**
 * Try (or retry) a visit charge against the customer's saved card.
 *
 * States: pending -> processing -> paid | failed | unknown.
 * - failed: Square definitely refused (no money moved). A retry uses a NEW key.
 * - unknown: timeout / Square error / not-yet-completed. Money may have moved, so a
 *   retry resends the SAME key and Square returns the original result instead of
 *   charging again. After 24 hours we stop resending and ask Casey to check Square.
 */
export async function runVisitCharge(payment: PaymentRow): Promise<ChargeOutcome> {
  if (payment.kind !== "visit_charge") return { outcome: "error", message: "Not a visit charge." };
  if (payment.status === "paid") return { outcome: "already", message: "Already paid." };
  if (payment.status === "canceled") return { outcome: "already", message: "This charge was cancelled." };
  if (payment.status === "review") return { outcome: "held", message: "This charge is waiting for Casey to approve it." };

  // Never charge a visit that isn't finished, or one that was billed another way.
  const event = await getEvent(payment.scheduleEventId);
  if (!event || event.status !== "completed") return { outcome: "error", message: "The visit isn't marked completed." };
  const others = await listPaymentsForEvent(payment.scheduleEventId);
  if (others.some((p) => p.kind === "pay_link" && (p.status === "paid" || p.status === "link_sent"))) {
    await claimPayment(payment.id, ["pending", "failed"], "canceled", { error: "Billed with a pay link instead." });
    return { outcome: "already", message: "This visit was billed with a pay link instead." };
  }

  const config = squareConfig();
  if (!config) return { outcome: "awaiting-card", message: "Card payments aren't switched on yet." };
  if (payment.environment && payment.environment !== config.environment) {
    return { outcome: "error", message: `This charge was recorded in ${payment.environment} mode and can't run in ${config.environment}. Cancel it and bill the visit again.` };
  }
  const profile = await billingProfileFor(payment.customerEmail);

  const age = Date.now() - Date.parse(payment.updatedAt);
  const resendSameKey = payment.status === "unknown" || (payment.status === "processing" && age > 5 * 60 * 1000);
  if (resendSameKey && age > 24 * HOUR) {
    return { outcome: "error", message: "Over a day old: check this payment in your Square dashboard, then mark it paid or failed." };
  }

  let cardId: string;
  let key: string;
  if (resendSameKey) {
    // Ask Square what happened to the attempt we know about before sending anything.
    if (payment.squarePaymentId) {
      const known = await retrievePayment(payment.squarePaymentId);
      if (known.ok) {
        const settled = await settleFromSquare(payment, known.data.payment, [payment.status]);
        if (settled) return settled;
      }
    }
    // A resend must match the original request exactly (same card), or Square
    // rejects the reused key and a later retry could charge a second time.
    cardId = payment.cardId || profile?.cardId || "";
    if (!cardId) return { outcome: "error", message: "Square didn't confirm this charge and the card is gone. Check your Square dashboard, then mark it paid or failed." };
    key = payment.idempotencyKey;
  } else {
    if (!profile?.cardId || !profile.autopayConsentAt) {
      return { outcome: "awaiting-card", message: "The customer hasn't saved a card yet. It will be charged when they do." };
    }
    if (payment.status === "failed") {
      // A new key can charge again, so first make sure no earlier attempt for this visit went through.
      const earlier = await findPaymentsByReference(`visit-${payment.scheduleEventId}`, payment.createdAt);
      if (!earlier.ok) return { outcome: "error", message: "Couldn't check Square for an earlier charge, so nothing was charged. Try again in a minute." };
      const live = earlier.data.find((p) => LIVE_SQUARE_PAYMENT.has(p.status));
      if (live) {
        const settled = await settleFromSquare(payment, live, ["failed"]);
        return settled ?? { outcome: "already", message: "Square already has a charge for this visit. Check the Billing tab." };
      }
    }
    cardId = profile.cardId;
    key = payment.status === "failed" ? nextVisitChargeKey(payment.scheduleEventId, payment.idempotencyKey) : payment.idempotencyKey;
  }

  const from = resendSameKey ? [payment.status] : ["pending", "failed"];
  if (!(await claimPayment(payment.id, from, "processing", { idempotencyKey: key, cardId, environment: config.environment }))) {
    return { outcome: "already", message: "This charge is already being processed." };
  }

  const result = await chargeCard({
    cardId,
    customerId: profile?.squareCustomerId ?? "",
    amountCents: payment.amountCents,
    idempotencyKey: key,
    referenceId: `visit-${payment.scheduleEventId}`,
    note: payment.description,
    buyerEmail: payment.customerEmail,
  });

  if (result.ok && result.data.payment.status === "COMPLETED") {
    const paid = await updatePayment(payment.id, {
      status: "paid",
      error: "",
      squarePaymentId: result.data.payment.id,
      receiptUrl: result.data.payment.receipt_url ?? "",
      paidAt: new Date().toISOString(),
    });
    if (paid) await emailReceipt(paid);
    return { outcome: "paid", amountCents: payment.amountCents, message: `Charged ${dollars(payment.amountCents)}.` };
  }

  if (!result.ok && result.definite) {
    // Square refused: nothing was charged, so a later retry with a new key is safe.
    const failed = await updatePayment(payment.id, { status: "failed", error: result.message });
    if (failed) await emailChargeFailed(failed, result.category === "PAYMENT_METHOD_ERROR");
    return { outcome: "failed", message: result.message };
  }

  // Outcome unknown: keep the same key and card for any retry.
  const message = result.ok ? `Square says the payment is ${result.data.payment.status.toLowerCase()}. Retry to check again.` : result.message;
  const unknown = await updatePayment(payment.id, {
    status: "unknown",
    error: message,
    squarePaymentId: result.ok ? result.data.payment.id : payment.squarePaymentId,
  });
  if (unknown) await emailOwnerUnknown(unknown);
  return { outcome: "error", message };
}

/**
 * Record what Square says about a payment we found for this visit. Returns null
 * when Square's answer doesn't settle anything and the caller should carry on.
 */
async function settleFromSquare(payment: PaymentRow, found: SquarePayment, from: string[]): Promise<ChargeOutcome | null> {
  if (found.status === "COMPLETED") {
    if (!(await claimPayment(payment.id, from, "paid", { squarePaymentId: found.id, receiptUrl: found.receipt_url ?? "", paidAt: new Date().toISOString(), error: "" }))) {
      return { outcome: "already", message: "This charge changed while checking Square. Refresh Billing." };
    }
    const paid = await getPayment(payment.id);
    if (paid) await emailReceipt(paid);
    return { outcome: "paid", amountCents: payment.amountCents, message: `Square shows ${dollars(payment.amountCents)} was already charged. Marked paid.` };
  }
  if (from.includes("failed") && LIVE_SQUARE_PAYMENT.has(found.status)) {
    // An earlier attempt is still going through at Square: wait for it rather than charge again.
    await claimPayment(payment.id, from, "unknown", { squarePaymentId: found.id, error: `Square shows an earlier charge that is ${found.status.toLowerCase()}. Retry later to check it.` });
    return { outcome: "error", message: "Square shows an earlier charge for this visit that hasn't finished. Retry later to check it." };
  }
  if (found.status === "FAILED" || found.status === "CANCELED") {
    await claimPayment(payment.id, from, "failed", { error: "Square shows this charge didn't go through. Retry to charge again." });
    return { outcome: "failed", message: "Square shows this charge didn't go through. Retry to charge again." };
  }
  return null;
}

/** When a customer saves a card, run any visit charges that were waiting for one. */
export async function chargeWaitingVisits(email: string) {
  const waiting = await listPendingVisitCharges(email);
  const results = [];
  for (const payment of waiting) results.push(await runVisitCharge(payment));
  return results;
}

/** Owner creates a Square pay link (dinners, catering, or anything off-schedule) and emails it. */
export async function sendPayLink(input: { customerEmail: string; customerName: string; description: string; amountCents: number; scheduleEventId: number; createdBy: string }) {
  const config = squareConfig();
  if (!config) return { ok: false as const, error: "Card payments aren't switched on yet." };
  let cardCharge: PaymentRow | null = null;
  if (input.scheduleEventId) {
    // Billing a visit by link replaces any card charge that hasn't gone through.
    cardCharge = await getVisitCharge(input.scheduleEventId);
    if (cardCharge && ["paid", "processing", "unknown"].includes(cardCharge.status)) {
      return { ok: false as const, error: "This visit's card charge has already gone through or is being processed." };
    }
    const links = await listPaymentsForEvent(input.scheduleEventId);
    if (links.some((p) => p.kind === "pay_link" && (p.status === "link_sent" || p.status === "paid"))) {
      return { ok: false as const, error: "This visit already has an invoice out or paid. Cancel that one first if it needs to change." };
    }
  }
  const row = await createPayLinkRow({ ...input, environment: config.environment });
  const site = publicSiteUrl();
  const link = await createPaymentLink({
    name: input.description,
    amountCents: input.amountCents,
    idempotencyKey: row.idempotencyKey,
    buyerEmail: input.customerEmail,
    redirectUrl: `${site}/account?paid=1`,
    note: `Driftline #${row.id}`,
  });
  if (!link.ok) {
    // The card charge is left alone, so the visit is still billed one way or another.
    const error = link.definite ? link.message : "Square didn't answer. Check your Square dashboard for a new payment link before sending another.";
    await updatePayment(row.id, { status: "failed", error });
    return { ok: false as const, error };
  }
  await updatePayment(row.id, { squareLinkId: link.data.payment_link.id, squareOrderId: link.data.payment_link.order_id, linkUrl: link.data.payment_link.url });

  // Only now switch off the card charge. If it started meanwhile, switch the link off instead.
  if (cardCharge && cardCharge.status !== "canceled") {
    const switched = await claimPayment(cardCharge.id, ["pending", "failed", "review"], "canceled", { error: "Billed with a pay link instead." });
    if (!switched) {
      await deletePaymentLink(link.data.payment_link.id).catch(() => null);
      await updatePayment(row.id, { status: "canceled", error: "The card charge started first, so this link was switched off." });
      return { ok: false as const, error: "The card charge started while the link was being made, so the link was switched off. Check Billing." };
    }
  }
  const saved = await updatePayment(row.id, { status: "link_sent" });
  if (saved) await emailPayLink(saved, input.customerName);
  return { ok: true as const, payment: saved };
}

/**
 * Ask Square whether a pay link has been paid (used by the webhook and the
 * "Check payment" button). Also catches links that were cancelled here but paid
 * anyway, so money never goes unnoticed.
 */
export async function refreshPayLink(paymentId: number): Promise<PaymentRow | null> {
  const payment = await getPayment(paymentId);
  if (!payment || payment.kind !== "pay_link" || !["link_sent", "canceled"].includes(payment.status) || !payment.squareOrderId) return payment;
  const environment = squareConfig()?.environment;
  if (payment.environment && payment.environment !== environment) return payment;
  const order = await retrieveOrder(payment.squareOrderId);
  if (!order.ok) return payment;
  const tender = order.data.order.tenders?.find((t) => t.payment_id);
  if (!tender?.payment_id) return payment;
  const paid = await retrievePayment(tender.payment_id);
  if (!paid.ok || paid.data.payment.status !== "COMPLETED") return payment;
  const wasCanceled = payment.status === "canceled";
  if (
    !(await claimPayment(payment.id, [payment.status], "paid", {
      squarePaymentId: tender.payment_id,
      receiptUrl: paid.data.payment.receipt_url ?? "",
      paidAt: new Date().toISOString(),
      error: wasCanceled ? "Paid after it was cancelled. Refund in Square if needed." : "",
    }))
  ) {
    return getPayment(payment.id);
  }
  const updated = await getPayment(payment.id);
  if (updated) await emailOwnerPaid(updated, wasCanceled);
  return updated;
}

/** Owner resolves a charge after checking the Square dashboard by hand. */
export async function resolveByHand(paymentId: number, outcome: "paid" | "failed") {
  const payment = await getPayment(paymentId);
  if (!payment || !["unknown", "processing"].includes(payment.status)) return { ok: false as const, error: "Only unconfirmed charges can be resolved by hand." };
  await claimPayment(payment.id, [payment.status], outcome, {
    error: outcome === "paid" ? "Marked paid by Casey after checking Square." : "Marked failed by Casey after checking Square.",
    ...(outcome === "paid" ? { paidAt: new Date().toISOString() } : {}),
  });
  return { ok: true as const, payment: await getPayment(payment.id) };
}

// ---------------------------------------------------------------- emails

const money = (cents: number) => dollars(cents);

function receiptLines(p: PaymentRow): [string, string][] {
  return [
    ["For", p.description],
    ...(p.groceryCents ? ([["Service", money(p.serviceCents)], ["Groceries", money(p.groceryCents)]] as [string, string][]) : []),
    ["Total", money(p.amountCents)],
  ];
}

function box(title: string, lines: [string, string][], note: string, button?: { href: string; label: string }) {
  const rows = lines
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#596568">${escapeHtml(k)}</td><td style="padding:6px 0"><b>${escapeHtml(v)}</b></td></tr>`)
    .join("");
  return `<div style="font-family:Arial,sans-serif;font-size:15px;max-width:560px;color:#16232f">
<h2 style="font-family:Georgia,serif;font-weight:400;margin:0 0 14px">${escapeHtml(title)}</h2>
<table style="border-collapse:collapse;margin:0 0 16px">${rows}</table><p style="color:#34454c">${escapeHtml(note)}</p>
${button ? `<p><a href="${escapeHtml(button.href)}" style="background:#7a6032;color:#fff;padding:11px 18px;text-decoration:none;font-weight:bold;display:inline-block">${escapeHtml(button.label)}</a></p>` : ""}
<p style="color:#596568;font-size:13px">Driftline Provisions · Astoria, Oregon</p></div>`;
}
const plain = (title: string, lines: [string, string][], note: string, link = "") =>
  [title, "", ...lines.map(([k, v]) => `${k}: ${v}`), "", note, link].join("\n").trim();

async function emailReceipt(p: PaymentRow) {
  const lines = receiptLines(p);
  const note = "Thank you! Your card on file was charged. Questions about a charge? Just reply.";
  await sendEmail({
    to: p.customerEmail,
    subject: `Receipt: ${money(p.amountCents)} for your Driftline visit`,
    text: plain("Payment received", lines, note, p.receiptUrl),
    html: box("Payment received", lines, note, p.receiptUrl ? { href: p.receiptUrl, label: "View Square receipt" } : undefined),
  });
}

async function emailChargeFailed(p: PaymentRow, tellCustomer: boolean) {
  const site = publicSiteUrl();
  const lines = receiptLines(p);
  if (tellCustomer) await sendEmail({
    to: p.customerEmail,
    subject: "We couldn't charge your card for your Driftline visit",
    text: plain("Your card didn't go through", lines, `${p.error} Please update your card in your account.`, `${site}/account#billing`),
    html: box("Your card didn't go through", lines, `${p.error} Please update your card in your account and we'll try again.`, {
      href: `${site}/account#billing`,
      label: "Update your card",
    }),
  });
  await sendEmail({
    to: ownerEmails(),
    subject: `Card declined: ${p.customerEmail} (${money(p.amountCents)})`,
    text: plain("A visit charge failed", [...lines, ["Customer", p.customerEmail], ["Reason", p.error]], "Retry or send a pay link from the Billing tab.", `${site}/portal`),
    html: box("A visit charge failed", [...lines, ["Customer", p.customerEmail], ["Reason", p.error]], "Retry or send a pay link from the Billing tab.", {
      href: `${site}/portal`,
      label: "Open Billing",
    }),
  });
}

async function emailPayLink(p: PaymentRow, name: string) {
  const lines: [string, string][] = [["For", p.description], ["Amount", money(p.amountCents)]];
  const first = name.trim().split(/\s+/)[0] || "there";
  const note = "Pay securely with Square. Card details go straight to Square; Driftline never sees them.";
  await sendEmail({
    to: p.customerEmail,
    subject: `Your Driftline invoice: ${money(p.amountCents)}`,
    text: plain(`Hi ${first},`, lines, note, p.linkUrl),
    html: box(`Hi ${first}, here's your invoice`, lines, note, { href: p.linkUrl, label: `Pay ${money(p.amountCents)}` }),
  });
}

async function emailOwnerUnknown(p: PaymentRow) {
  const site = publicSiteUrl();
  const lines: [string, string][] = [...receiptLines(p), ["Customer", p.customerEmail]];
  const note = "Square didn't confirm this charge. Tap Retry in Billing: it re-checks with the same request, so it can't charge twice.";
  await sendEmail({
    to: ownerEmails(),
    subject: `Charge not confirmed: ${p.customerEmail} (${money(p.amountCents)})`,
    text: plain("A charge needs a second look", lines, note, `${site}/portal`),
    html: box("A charge needs a second look", lines, note, { href: `${site}/portal`, label: "Open Billing" }),
  });
}

async function emailOwnerReview(p: PaymentRow) {
  const site = publicSiteUrl();
  const lines: [string, string][] = [...receiptLines(p), ["Customer", p.customerEmail]];
  const note = `The grocery total is over ${money(GROCERY_REVIEW_CENTS)}, so the card wasn't charged yet. Check the receipt photo, then approve the charge or send a pay link with the right amount.`;
  await sendEmail({
    to: ownerEmails(),
    subject: `Approve charge: ${p.customerEmail} (${money(p.amountCents)})`,
    text: plain("A charge is waiting for your OK", lines, note, `${site}/portal`),
    html: box("A charge is waiting for your OK", lines, note, { href: `${site}/portal`, label: "Open Billing" }),
  }).catch(() => false);
}

async function emailOwnerPaid(p: PaymentRow, afterCancel = false) {
  await sendEmail({
    to: ownerEmails(),
    subject: `${afterCancel ? "Paid after cancelling" : "Paid"}: ${money(p.amountCents)} from ${p.customerEmail}`,
    text: plain("Invoice paid", [["For", p.description], ["Amount", money(p.amountCents)], ["Customer", p.customerEmail]], ""),
    html: box("Invoice paid", [["For", p.description], ["Amount", money(p.amountCents)], ["Customer", p.customerEmail]], "It's marked paid in your Billing tab."),
  });
}

/**
 * A finished visit that did not get charged and will not fix itself without
 * someone acting: tell the owner right away instead of waiting for them to
 * notice it in the Billing tab. Failed and unknown charges already email the owner.
 */
export async function alertOwnerNotCharged(eventId: number, reason: string): Promise<void> {
  const event = await getEvent(eventId).catch(() => null);
  if (!event) return;
  const site = publicSiteUrl();
  const lines: [string, string][] = [
    ["Client", event.household],
    ["Customer", event.customerEmail || "No account on this visit"],
    ["Visit", `${prettyVisitDate(event.serviceDate)}${event.packageName ? `, ${event.packageName}` : ""}`],
    ["Why", reason],
  ];
  const note = "The visit is finished but nothing has been charged. Open Billing to send a pay link or retry once the card is saved.";
  await sendEmail({
    to: ownerEmails(),
    subject: `Not charged yet: ${event.household}, ${prettyVisitDate(event.serviceDate)}`,
    text: plain("A finished visit was not charged", lines, note, `${site}/portal`),
    html: box("A finished visit was not charged", lines, note, { href: `${site}/portal`, label: "Open Billing" }),
  }).catch(() => false);
}
