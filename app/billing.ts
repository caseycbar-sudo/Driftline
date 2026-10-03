/**
 * Driftline billing rules.
 *
 * - Weekly meal prep: when the chef completes a visit, the customer's saved card
 *   is charged the package price plus the grocery receipt, if they've agreed to
 *   autopay. Otherwise the charge waits (status "pending") and runs as soon as
 *   they save a card, or Casey sends a pay link instead.
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
  updatePayment,
  upsertVisitCharge,
  type PaymentRow,
} from "../db/payments";
import { findPackage, dollars } from "./pricing-core";
import { chargeCard, createPaymentLink, retrieveOrder, retrievePayment, squareConfig } from "./square";
import { escapeHtml, ownerEmails, publicSiteUrl, sendEmail } from "./notify";
import { prettyVisitDate } from "./visit-emails";

export type ChargeOutcome =
  | { outcome: "paid"; amountCents: number; message: string }
  | { outcome: "failed"; message: string }
  | { outcome: "awaiting-card"; message: string }
  | { outcome: "not-autopay"; message: string }
  | { outcome: "already"; message: string }
  | { outcome: "error"; message: string };

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

  const payment = await upsertVisitCharge({
    scheduleEventId: event.id,
    customerEmail: event.customerEmail,
    description: `${event.packageName || "Meal prep"} visit, ${prettyVisitDate(event.serviceDate)}${kitCents ? ` (includes ${dollars(kitCents)} pantry kit)` : ""}`,
    serviceCents,
    groceryCents: event.groceryCents,
  });
  return runVisitCharge(payment);
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

  // Never charge a visit that isn't finished, or one that was billed another way.
  const event = await getEvent(payment.scheduleEventId);
  if (!event || event.status !== "completed") return { outcome: "error", message: "The visit isn't marked completed." };
  const others = await listPaymentsForEvent(payment.scheduleEventId);
  if (others.some((p) => p.kind === "pay_link" && (p.status === "paid" || p.status === "link_sent"))) {
    await claimPayment(payment.id, ["pending", "failed"], "canceled", { error: "Billed with a pay link instead." });
    return { outcome: "already", message: "This visit was billed with a pay link instead." };
  }

  const profile = await getBillingProfile(payment.customerEmail);
  if (!profile?.cardId || !profile.autopayConsentAt) {
    return { outcome: "awaiting-card", message: "The customer hasn't saved a card yet. It will be charged when they do." };
  }
  if (!squareConfig()) return { outcome: "awaiting-card", message: "Card payments aren't switched on yet." };

  const age = Date.now() - Date.parse(payment.updatedAt);
  const resendSameKey = payment.status === "unknown" || (payment.status === "processing" && age > 5 * 60 * 1000);
  if (resendSameKey && age > 24 * HOUR) {
    return { outcome: "error", message: "Over a day old: check this payment in your Square dashboard, then mark it paid or failed." };
  }
  const attempt = Number(payment.idempotencyKey.split("-").pop()) || 1;
  const key = payment.status === "failed" ? `visit-${payment.scheduleEventId}-${attempt + 1}` : payment.idempotencyKey;
  const from = resendSameKey ? [payment.status] : ["pending", "failed"];
  if (!(await claimPayment(payment.id, from, "processing", { idempotencyKey: key }))) {
    return { outcome: "already", message: "This charge is already being processed." };
  }

  const result = await chargeCard({
    cardId: profile.cardId,
    customerId: profile.squareCustomerId,
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

  // Outcome unknown: keep the same key for any retry.
  const message = result.ok ? `Square says the payment is ${result.data.payment.status.toLowerCase()}. Retry to check again.` : result.message;
  const unknown = await updatePayment(payment.id, {
    status: "unknown",
    error: message,
    squarePaymentId: result.ok ? result.data.payment.id : "",
  });
  if (unknown) await emailOwnerUnknown(unknown);
  return { outcome: "error", message };
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
  if (!squareConfig()) return { ok: false as const, error: "Card payments aren't switched on yet." };
  if (input.scheduleEventId) {
    // Billing a visit by link replaces any card charge that hasn't gone through.
    const existing = await getVisitCharge(input.scheduleEventId);
    if (existing && ["paid", "processing", "unknown"].includes(existing.status)) {
      return { ok: false as const, error: "This visit's card charge has already gone through or is being processed." };
    }
    if (existing) await claimPayment(existing.id, ["pending", "failed"], "canceled", { error: "Billed with a pay link instead." });
  }
  const row = await createPayLinkRow(input);
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
    const error = link.definite ? link.message : "Square didn't answer. Check your Square dashboard for a new payment link before sending another.";
    await updatePayment(row.id, { status: "failed", error });
    return { ok: false as const, error };
  }
  const saved = await updatePayment(row.id, {
    status: "link_sent",
    squareLinkId: link.data.payment_link.id,
    squareOrderId: link.data.payment_link.order_id,
    linkUrl: link.data.payment_link.url,
  });
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

async function emailOwnerPaid(p: PaymentRow, afterCancel = false) {
  await sendEmail({
    to: ownerEmails(),
    subject: `${afterCancel ? "Paid after cancelling" : "Paid"}: ${money(p.amountCents)} from ${p.customerEmail}`,
    text: plain("Invoice paid", [["For", p.description], ["Amount", money(p.amountCents)], ["Customer", p.customerEmail]], ""),
    html: box("Invoice paid", [["For", p.description], ["Amount", money(p.amountCents)], ["Customer", p.customerEmail]], "It's marked paid in your Billing tab."),
  });
}
