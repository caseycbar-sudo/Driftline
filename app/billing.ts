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
  const serviceCents = event.priceCents || findPackage(pricing, event.packageName)?.priceCents || 0;
  if (!serviceCents) return { outcome: "not-autopay", message: "No price set for this visit. Casey will bill it." };

  const payment = await upsertVisitCharge({
    scheduleEventId: event.id,
    customerEmail: event.customerEmail,
    description: `${event.packageName || "Meal prep"} visit, ${prettyVisitDate(event.serviceDate)}`,
    serviceCents,
    groceryCents: event.groceryCents,
  });
  return runVisitCharge(payment);
}

/** Try (or retry) a visit charge against the customer's saved card. */
export async function runVisitCharge(payment: PaymentRow): Promise<ChargeOutcome> {
  if (payment.status === "paid") return { outcome: "already", message: "Already paid." };
  const profile = await getBillingProfile(payment.customerEmail);
  if (!profile?.cardId || !profile.autopayConsentAt) {
    return { outcome: "awaiting-card", message: "The customer hasn't saved a card yet. It will be charged when they do." };
  }
  if (!squareConfig()) return { outcome: "awaiting-card", message: "Card payments aren't switched on yet." };

  // A failed attempt gets a fresh key. A "processing" charge that was interrupted
  // (older than 5 minutes) is resent with the SAME key: Square then returns the
  // original result instead of charging again.
  const attempt = Number(payment.idempotencyKey.split("-").pop()) || 1;
  const stale = payment.status === "processing" && Date.now() - Date.parse(payment.updatedAt) > 5 * 60 * 1000;
  const key = payment.status === "failed" ? `visit-${payment.scheduleEventId}-${attempt + 1}` : payment.idempotencyKey;
  const from = stale ? ["processing"] : ["pending", "failed"];
  if (!(await claimPayment(payment.id, from, "processing", { idempotencyKey: key, error: "" }))) {
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
      squarePaymentId: result.data.payment.id,
      receiptUrl: result.data.payment.receipt_url ?? "",
      paidAt: new Date().toISOString(),
    });
    if (paid) await emailReceipt(paid);
    return { outcome: "paid", amountCents: payment.amountCents, message: `Charged ${dollars(payment.amountCents)}.` };
  }
  const message = result.ok ? `Payment is ${result.data.payment.status.toLowerCase()}.` : result.message;
  const failed = await updatePayment(payment.id, {
    status: "failed",
    error: message,
    squarePaymentId: result.ok ? result.data.payment.id : "",
  });
  if (failed) await emailChargeFailed(failed);
  return { outcome: "failed", message };
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
    await updatePayment(row.id, { status: "failed", error: link.message });
    return { ok: false as const, error: link.message };
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

/** Ask Square whether a pay link has been paid (used by the webhook and the "Check payment" button). */
export async function refreshPayLink(paymentId: number): Promise<PaymentRow | null> {
  const payment = await getPayment(paymentId);
  if (!payment || payment.kind !== "pay_link" || payment.status !== "link_sent" || !payment.squareOrderId) return payment;
  const order = await retrieveOrder(payment.squareOrderId);
  if (!order.ok) return payment;
  const tender = order.data.order.tenders?.find((t) => t.payment_id);
  if (order.data.order.state !== "COMPLETED" && !tender) return payment;
  let receiptUrl = "";
  if (tender?.payment_id) {
    const paid = await retrievePayment(tender.payment_id);
    if (paid.ok) {
      if (paid.data.payment.status !== "COMPLETED") return payment;
      receiptUrl = paid.data.payment.receipt_url ?? "";
    }
  }
  if (!(await claimPayment(payment.id, ["link_sent"], "paid", { squarePaymentId: tender?.payment_id ?? "", receiptUrl, paidAt: new Date().toISOString() }))) {
    return getPayment(payment.id);
  }
  const updated = await getPayment(payment.id);
  if (updated) await emailOwnerPaid(updated);
  return updated;
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
${button ? `<p><a href="${button.href}" style="background:#7a6032;color:#fff;padding:11px 18px;text-decoration:none;font-weight:bold;display:inline-block">${escapeHtml(button.label)}</a></p>` : ""}
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

async function emailChargeFailed(p: PaymentRow) {
  const site = publicSiteUrl();
  const lines = receiptLines(p);
  await sendEmail({
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

async function emailOwnerPaid(p: PaymentRow) {
  await sendEmail({
    to: ownerEmails(),
    subject: `Paid: ${money(p.amountCents)} from ${p.customerEmail}`,
    text: plain("Invoice paid", [["For", p.description], ["Amount", money(p.amountCents)], ["Customer", p.customerEmail]], ""),
    html: box("Invoice paid", [["For", p.description], ["Amount", money(p.amountCents)], ["Customer", p.customerEmail]], "It's marked paid in your Billing tab."),
  });
}
