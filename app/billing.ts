/**
 * Driftline billing rules.
 *
 * - Weekly meal prep: when the chef completes a visit, the customer's saved card
 *   is charged the package price plus the grocery receipt, if they've agreed to
 *   autopay. Otherwise the charge waits (status "pending") and runs as soon as
 *   they save a card, or Casey sends a pay link instead. A grocery total above
 *   GROCERY_REVIEW_CENTS waits (status "review") for Casey to approve it.
 * - Grocery hold: when the chef starts the shopping trip, the card is held for the
 *   visit price plus GROCERY_HOLD_BUFFER_CENTS, so a declined card shows up before
 *   anyone buys groceries. After the visit the exact total is charged from that hold
 *   and the rest is released. If the total is bigger than the hold, or the hold is
 *   too old, the hold is released and the card is charged the normal way.
 * - Private dinners and catering: Casey sends a Square pay link for the amount
 *   in his proposal; it's marked paid when Square tells us (webhook) or when he
 *   taps "Check payment".
 */
import { getEvent } from "../db/schedule";
import { getPricing } from "../db/pricing";
import {
  claimPayment,
  createHoldRow,
  createPayLinkRow,
  findPaymentsBySquareId,
  getActiveHold,
  getBillingProfile,
  getPayment,
  getVisitCharge,
  listHoldsToRelease,
  listPaymentsForEvent,
  listPendingVisitCharges,
  setBillingEnvironment,
  updatePayment,
  upsertVisitCharge,
  type BillingProfile,
  type PaymentRow,
} from "../db/payments";
import { findPackage, dollars } from "./pricing-core";
import { GROCERY_HOLD_BUFFER_CENTS, GROCERY_REVIEW_CENTS, HOLD_MAX_AGE_MS, LIVE_SQUARE_PAYMENT, canChargeFromHold, groceryHoldCents, nextVisitChargeKey } from "./billing-core";
import {
  cancelPayment,
  chargeCard,
  completePayment,
  createPaymentLink,
  deletePaymentLink,
  findPaymentsByReference,
  retrieveCard,
  retrieveCustomer,
  retrieveOrder,
  retrievePayment,
  squareConfig,
  updatePaymentAmount,
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

  const { serviceCents, kitCents } = visitServiceCents(event, await getPricing());
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

/** Package price plus the flat pantry kit (the chef brings spices, oil, salt and pepper). */
function visitServiceCents(event: { priceCents: number; packageName: string }, pricing: Awaited<ReturnType<typeof getPricing>>) {
  const packageCents = event.priceCents || findPackage(pricing, event.packageName)?.priceCents || 0;
  const kitCents = packageCents ? Math.max(0, pricing.pantryKitCents || 0) : 0;
  return { serviceCents: packageCents + kitCents, kitCents };
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
      if (known.ok && known.data.payment.status === "APPROVED") {
        // A card hold whose completion wasn't confirmed: finish that hold, never charge a second time.
        const done = await completePayment(known.data.payment.id);
        const settled = done.ok ? await settleFromSquare(payment, done.data.payment, [payment.status]) : null;
        if (settled?.outcome === "paid") await markHoldCaptured(payment.squarePaymentId);
        return settled ?? { outcome: "error", message: "The card hold for this visit hasn't been charged yet. Retry in a minute." };
      }
      if (known.ok) {
        const settled = await settleFromSquare(payment, known.data.payment, [payment.status]);
        if (settled?.outcome === "paid") await markHoldCaptured(payment.squarePaymentId);
        if (settled) return settled;
      }
    }
    // A resend must match the original request exactly (same card), or Square
    // rejects the reused key and a later retry could charge a second time.
    cardId = payment.cardId || profile?.cardId || "";
    if (!cardId) return { outcome: "error", message: "Square didn't confirm this charge and the card is gone. Check your Square dashboard, then mark it paid or failed." };
    key = payment.idempotencyKey;
  } else {
    const hold = await getActiveHold(payment.scheduleEventId);
    if (hold) {
      const fromHold = await chargeFromHold(payment, hold);
      if (fromHold) return fromHold;
    }
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

/* ---------------------------------------------------------------- grocery hold */

export type HoldOutcome = { outcome: "held" | "already" | "skipped" | "no-card" | "declined" | "unknown"; message: string };

/**
 * The chef is starting the shopping trip: hold the visit price plus a grocery buffer
 * on the customer's card. Never charges anything; the charge happens after the visit.
 */
export async function placeGroceryHold(eventId: number): Promise<HoldOutcome> {
  const skipped = (message: string): HoldOutcome => ({ outcome: "skipped", message });
  const event = await getEvent(eventId);
  if (!event || event.serviceType !== "meal_prep" || event.status === "completed" || event.status === "cancelled") return skipped("Not a meal prep visit.");
  if (!event.customerEmail) return skipped("No customer account on this visit.");
  const config = squareConfig();
  if (!config) return skipped("Card payments aren't switched on.");
  if (await getActiveHold(eventId)) return { outcome: "already", message: "The card is already held for this visit." };
  const billed = await listPaymentsForEvent(eventId);
  if (billed.some((p) => (p.kind === "pay_link" && ["link_sent", "paid"].includes(p.status)) || (p.kind === "visit_charge" && p.status === "paid"))) {
    return skipped("This visit is already billed.");
  }

  const profile = await billingProfileFor(event.customerEmail);
  if (!profile?.cardId || !profile.autopayConsentAt) {
    return { outcome: "no-card", message: "This customer has no card saved. Check with Casey before you buy groceries." };
  }
  const { serviceCents } = visitServiceCents(event, await getPricing());
  if (!serviceCents) return skipped("No price set for this visit.");

  const amountCents = groceryHoldCents(serviceCents);
  const row = await createHoldRow({
    scheduleEventId: eventId,
    customerEmail: event.customerEmail,
    description: `Card hold for ${event.packageName || "meal prep"} visit, ${prettyVisitDate(event.serviceDate)} (visit plus up to ${dollars(GROCERY_HOLD_BUFFER_CENTS)} groceries)`,
    amountCents,
    cardId: profile.cardId,
    environment: config.environment,
  });
  if (!row) return { outcome: "already", message: "The card is already being held for this visit." };

  const result = await chargeCard({
    cardId: profile.cardId,
    customerId: profile.squareCustomerId,
    amountCents,
    idempotencyKey: row.idempotencyKey,
    referenceId: `hold-${eventId}`,
    note: row.description,
    buyerEmail: event.customerEmail,
    autocomplete: false,
  });
  if (result.ok && result.data.payment.status === "APPROVED") {
    await updatePayment(row.id, { status: "authorized", squarePaymentId: result.data.payment.id, error: "" });
    return { outcome: "held", message: `Card held for ${dollars(amountCents)}. Go ahead and shop.` };
  }
  if (!result.ok && result.definite) {
    const failed = await updatePayment(row.id, { status: "failed", error: result.message });
    if (failed) await emailHoldDeclined(failed, event.household);
    return { outcome: "declined", message: `Don't buy groceries yet: the customer's card was declined (${result.message}) Casey and the customer have been emailed.` };
  }
  // Square didn't confirm. An unconfirmed hold costs the customer nothing and drops off on its own.
  const message = result.ok ? `Square says the hold is ${result.data.payment.status.toLowerCase()}.` : result.message;
  const unknown = await updatePayment(row.id, { status: "unknown", error: message, squarePaymentId: result.ok ? result.data.payment.id : "" });
  if (unknown) await emailHoldUnconfirmed(unknown, event.household);
  return { outcome: "unknown", message: "Couldn't confirm the card hold. Check with Casey before you buy groceries." };
}

/**
 * Charge a finished visit from its hold. Returns null when the hold can't be used (too
 * old, too small, or Square refused): the hold is then released and the caller charges
 * the card the normal way.
 */
async function chargeFromHold(payment: PaymentRow, hold: PaymentRow): Promise<ChargeOutcome | null> {
  if (!hold.squarePaymentId || !canChargeFromHold(hold, payment.amountCents)) {
    await releaseHold(hold, payment.amountCents > hold.amountCents ? "Visit total was more than the hold." : "Hold was too old to use.");
    return null;
  }
  if (!(await claimPayment(hold.id, ["authorized"], "charging"))) return { outcome: "already", message: "This charge is already being processed." };
  if (!(await claimPayment(payment.id, ["pending", "failed"], "processing", { cardId: hold.cardId, squarePaymentId: hold.squarePaymentId, environment: hold.environment }))) {
    await claimPayment(hold.id, ["charging"], "authorized");
    return { outcome: "already", message: "This charge is already being processed." };
  }
  const putBack = async (reason: string) => {
    await releaseHold({ ...hold, status: "charging" }, reason);
    await claimPayment(payment.id, ["processing"], payment.status, { squarePaymentId: "" });
    return null;
  };

  if (payment.amountCents < hold.amountCents) {
    const lowered = await updatePaymentAmount(hold.squarePaymentId, payment.amountCents, `adjust-${payment.id}-${hold.id}`);
    if (!lowered.ok) return putBack(`Couldn't lower the hold: ${lowered.message}`);
  }
  const done = await completePayment(hold.squarePaymentId);
  if (done.ok && done.data.payment.status === "COMPLETED") {
    const paid = await updatePayment(payment.id, {
      status: "paid",
      error: "",
      squarePaymentId: done.data.payment.id,
      receiptUrl: done.data.payment.receipt_url ?? "",
      paidAt: new Date().toISOString(),
    });
    await updatePayment(hold.id, { status: "captured", error: "" });
    if (paid) await emailReceipt(paid);
    return { outcome: "paid", amountCents: payment.amountCents, message: `Charged ${dollars(payment.amountCents)} from the card hold.` };
  }
  if (!done.ok && done.definite) return putBack(`Square wouldn't charge the hold: ${done.message}`);

  // Unknown: Retry re-reads this same payment and finishes it, so it can't charge twice.
  const message = done.ok ? `Square says the payment is ${done.data.payment.status.toLowerCase()}. Retry to check again.` : done.message;
  const unknown = await updatePayment(payment.id, { status: "unknown", error: message });
  if (unknown) await emailOwnerUnknown(unknown);
  return { outcome: "error", message };
}

/** Let go of a hold. No money moves; if Square doesn't answer, it drops the hold itself within 7 days. */
async function releaseHold(hold: PaymentRow, reason: string) {
  const from = hold.status === "charging" ? ["charging"] : ["authorized"];
  if (!(await claimPayment(hold.id, from, "released", { error: reason }))) return;
  if (hold.squarePaymentId) {
    const cancelled = await cancelPayment(hold.squarePaymentId).catch(() => null);
    if (!cancelled?.ok) await updatePayment(hold.id, { error: `${reason} Square didn't confirm the release; it drops on its own within 7 days.` });
  }
}

async function markHoldCaptured(squarePaymentId: string) {
  if (!squarePaymentId) return;
  for (const h of await findPaymentsBySquareId(squarePaymentId)) {
    if (h.kind === "visit_hold") await updatePayment(h.id, { status: "captured", error: "" });
  }
}

/** Release the hold on a visit that won't be charged from it (cancelled, or billed by pay link). */
export async function releaseHoldForVisit(eventId: number, reason: string) {
  const hold = await getActiveHold(eventId);
  if (hold) await releaseHold(hold, reason);
}

/** Daily: release holds on cancelled visits and holds about to expire anyway. */
export async function releaseStaleHolds(now = Date.now()) {
  const ids = await listHoldsToRelease(new Date(now - HOLD_MAX_AGE_MS).toISOString());
  for (const id of ids) {
    const hold = await getPayment(id);
    if (hold) await releaseHold(hold, "Released: the visit was cancelled or the hold was about to expire.");
  }
  return ids.length;
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
  if (input.scheduleEventId) await releaseHoldForVisit(input.scheduleEventId, "Billed with a pay link instead.");
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

async function emailHoldDeclined(p: PaymentRow, household: string) {
  const site = publicSiteUrl();
  const lines: [string, string][] = [["For", p.description], ["Hold", money(p.amountCents)]];
  const note = `${p.error} Your chef is about to shop for your visit, and we check your card first. Please update your card so we can go ahead.`;
  await sendEmail({
    to: p.customerEmail,
    subject: "Please update your card before your Driftline visit",
    text: plain("We couldn't check your card", lines, note, `${site}/account#billing`),
    html: box("We couldn't check your card", lines, note, { href: `${site}/account#billing`, label: "Update your card" }),
  }).catch(() => false);
  await sendEmail({
    to: ownerEmails(),
    subject: `Card hold declined: ${household} (${money(p.amountCents)})`,
    text: plain("A card hold was declined before shopping", [...lines, ["Customer", p.customerEmail], ["Reason", p.error]], "The chef was told not to buy groceries yet. The customer was asked to update their card.", `${site}/portal`),
    html: box("A card hold was declined before shopping", [...lines, ["Customer", p.customerEmail], ["Reason", p.error]], "The chef was told not to buy groceries yet. The customer was asked to update their card.", {
      href: `${site}/portal`,
      label: "Open Billing",
    }),
  }).catch(() => false);
}

async function emailHoldUnconfirmed(p: PaymentRow, household: string) {
  const site = publicSiteUrl();
  const lines: [string, string][] = [["For", p.description], ["Hold", money(p.amountCents)], ["Customer", p.customerEmail]];
  const note = "Square didn't confirm the card hold, so the chef was told to check with you before buying groceries. Nothing was charged.";
  await sendEmail({
    to: ownerEmails(),
    subject: `Card hold not confirmed: ${household}`,
    text: plain("A card hold needs a look", lines, note, `${site}/portal`),
    html: box("A card hold needs a look", lines, note, { href: `${site}/portal`, label: "Open Billing" }),
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
