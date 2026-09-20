import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "./index";
import { billingProfiles, payments } from "./schema";

export type PaymentRow = typeof payments.$inferSelect;
export type BillingProfile = typeof billingProfiles.$inferSelect;

const now = () => new Date().toISOString();

export async function getBillingProfile(email: string) {
  const rows = await getDb().select().from(billingProfiles).where(eq(billingProfiles.email, email.toLowerCase())).limit(1);
  return rows[0] ?? null;
}

export async function saveBillingProfile(profile: Omit<BillingProfile, "updatedAt">) {
  const row = { ...profile, email: profile.email.toLowerCase(), updatedAt: now() };
  await getDb()
    .insert(billingProfiles)
    .values(row)
    .onConflictDoUpdate({ target: billingProfiles.email, set: { ...row } });
  return row;
}

export async function clearSavedCard(email: string) {
  await getDb()
    .update(billingProfiles)
    .set({ cardId: "", cardBrand: "", cardLast4: "", cardExpMonth: 0, cardExpYear: 0, autopayConsentAt: "", updatedAt: now() })
    .where(eq(billingProfiles.email, email.toLowerCase()));
}

export async function getPayment(id: number) {
  const rows = await getDb().select().from(payments).where(eq(payments.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getVisitCharge(scheduleEventId: number) {
  const rows = await getDb()
    .select()
    .from(payments)
    .where(and(eq(payments.scheduleEventId, scheduleEventId), eq(payments.kind, "visit_charge")))
    .limit(1);
  return rows[0] ?? null;
}

/** Creates the one visit-charge row for a visit, or returns the existing one. */
export async function upsertVisitCharge(input: {
  scheduleEventId: number;
  customerEmail: string;
  description: string;
  serviceCents: number;
  groceryCents: number;
}) {
  const existing = await getVisitCharge(input.scheduleEventId);
  if (existing) return existing;
  const t = now();
  const [row] = await getDb()
    .insert(payments)
    .values({
      ...input,
      customerEmail: input.customerEmail.toLowerCase(),
      kind: "visit_charge",
      amountCents: input.serviceCents + input.groceryCents,
      status: "pending",
      idempotencyKey: `visit-${input.scheduleEventId}-1`,
      createdBy: "system",
      createdAt: t,
      updatedAt: t,
    })
    .onConflictDoNothing()
    .returning();
  return row ?? (await getVisitCharge(input.scheduleEventId))!;
}

/**
 * Atomically move a payment from one of `from` to `to`. Returns false when
 * another request got there first, which is what stops double charging.
 */
export async function claimPayment(id: number, from: string[], to: string, patch: Partial<PaymentRow> = {}) {
  const rows = await getDb()
    .update(payments)
    .set({ ...patch, status: to, updatedAt: now() })
    .where(and(eq(payments.id, id), inArray(payments.status, from)))
    .returning({ id: payments.id });
  return rows.length > 0;
}

export async function updatePayment(id: number, patch: Partial<PaymentRow>) {
  await getDb()
    .update(payments)
    .set({ ...patch, updatedAt: now() })
    .where(eq(payments.id, id));
  return getPayment(id);
}

export async function createPayLinkRow(input: {
  customerEmail: string;
  description: string;
  amountCents: number;
  scheduleEventId: number;
  createdBy: string;
}) {
  const t = now();
  const [row] = await getDb()
    .insert(payments)
    .values({
      ...input,
      customerEmail: input.customerEmail.toLowerCase(),
      kind: "pay_link",
      serviceCents: input.amountCents,
      groceryCents: 0,
      status: "pending",
      idempotencyKey: `link-${crypto.randomUUID()}`,
      createdAt: t,
      updatedAt: t,
    })
    .returning();
  return row;
}

export async function findPaymentByOrderId(orderId: string) {
  const rows = await getDb().select().from(payments).where(eq(payments.squareOrderId, orderId)).limit(1);
  return rows[0] ?? null;
}

export async function listPayments(limit = 200) {
  return getDb().select().from(payments).orderBy(desc(payments.createdAt)).limit(limit);
}

export async function listPaymentsForCustomer(email: string) {
  return getDb()
    .select()
    .from(payments)
    .where(eq(payments.customerEmail, email.toLowerCase()))
    .orderBy(desc(payments.createdAt))
    .limit(50);
}

/** Visit charges waiting on a saved card, for when the customer adds one. */
export async function listPendingVisitCharges(email: string) {
  return getDb()
    .select()
    .from(payments)
    .where(and(eq(payments.customerEmail, email.toLowerCase()), eq(payments.kind, "visit_charge"), inArray(payments.status, ["pending"])));
}

export async function listPaymentsForEvent(scheduleEventId: number) {
  return getDb().select().from(payments).where(eq(payments.scheduleEventId, scheduleEventId));
}

/**
 * Completed meal prep visits with a customer account but no visit charge yet:
 * the safety net for anything that slipped through (e.g. the request was cut
 * off right after the chef finished, or the owner marked it completed by hand).
 */
export async function listUnbilledVisits(sinceDate: string) {
  const result = await getDb().$client
    .prepare(
      `SELECT s.id, s.service_date, s.household, s.customer_email, s.package_name, s.grocery_cents
       FROM schedule_events s
       WHERE s.status = 'completed' AND s.service_type = 'meal_prep' AND s.customer_email != '' AND s.service_date >= ?
         AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.schedule_event_id = s.id)
       ORDER BY s.service_date DESC LIMIT 50`,
    )
    .bind(sinceDate)
    .all<Record<string, unknown>>();
  return result.results.map((r) => ({
    id: Number(r.id),
    serviceDate: String(r.service_date),
    household: String(r.household),
    customerEmail: String(r.customer_email),
    packageName: String(r.package_name),
    groceryCents: Number(r.grocery_cents ?? 0),
  }));
}
