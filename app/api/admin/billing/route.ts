import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest, normalizeEmail } from "../../../auth-core";
import { claimPayment, getBillingProfile, getPayment, listPayments, listUnbilledVisits } from "../../../../db/payments";
import { getCustomer, listCustomers } from "../../../../db/customers";
import { chargeCompletedVisit, refreshPayLink, resolveByHand, runVisitCharge, sendPayLink } from "../../../billing";
import { deletePaymentLink, squareConfig } from "../../../square";

export const dynamic = "force-dynamic";
const forbidden = () => NextResponse.json({ error: "Owner access required" }, { status: 403 });

/** Everything billed, newest first, plus which customers have a card saved. */
export async function GET() {
  if (!(await requireStaffRole("admin"))) return forbidden();
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [payments, customers, unbilled] = await Promise.all([listPayments(), listCustomers(), listUnbilledVisits(since)]);
  const cards = await Promise.all(
    customers.map(async (c) => {
      const p = await getBillingProfile(c.email);
      return { email: c.email, name: c.fullName, card: p?.cardId ? `${p.cardBrand} ···· ${p.cardLast4}` : "", autopay: Boolean(p?.autopayConsentAt) };
    }),
  );
  const config = squareConfig();
  return NextResponse.json(
    { configured: Boolean(config), environment: config?.environment ?? "", payments, unbilled, customers: cards },
    { headers: { "cache-control": "private, no-store" } },
  );
}

/**
 * Actions: send a pay link, bill a completed visit, retry a visit charge, check a
 * pay link, cancel, or mark an unconfirmed charge paid/failed after checking Square.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return forbidden();
  const owner = await requireStaffRole("admin");
  if (!owner) return forbidden();
  const action = String(body.action ?? "");

  if (action === "pay_link") {
    const email = normalizeEmail(body.customerEmail);
    const amountCents = Math.round(Number(String(body.amount ?? "").replace(/[$,\s]/g, "")) * 100);
    const description = String(body.description ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
    if (!email) return NextResponse.json({ error: "Enter the customer's email." }, { status: 400 });
    if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > 5_000_000) return NextResponse.json({ error: "Amount must be $1 to $50,000." }, { status: 400 });
    if (description.length < 3) return NextResponse.json({ error: "Add what it's for, e.g. \"Anniversary dinner for 6, Oct 12\"." }, { status: 400 });
    const customer = await getCustomer(email);
    const result = await sendPayLink({
      customerEmail: email,
      customerName: String(body.customerName ?? customer?.fullName ?? ""),
      description,
      amountCents,
      scheduleEventId: Math.max(0, Math.round(Number(body.scheduleEventId) || 0)),
      createdBy: owner.email,
    });
    return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 502 });
  }

  if (action === "bill_visit") {
    const eventId = Number(body.eventId);
    if (!Number.isInteger(eventId) || eventId <= 0) return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    return NextResponse.json({ result: await chargeCompletedVisit(eventId) });
  }

  const id = Number(body.id);
  const payment = Number.isInteger(id) && id > 0 ? await getPayment(id) : null;
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  if (action === "retry") {
    if (payment.kind !== "visit_charge") return NextResponse.json({ error: "Only visit charges can be retried." }, { status: 400 });
    return NextResponse.json({ result: await runVisitCharge(payment), payment: await getPayment(id) });
  }
  if (action === "check") return NextResponse.json({ payment: await refreshPayLink(id) });
  if (action === "mark_paid" || action === "mark_failed") {
    const result = await resolveByHand(id, action === "mark_paid" ? "paid" : "failed");
    return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 409 });
  }
  if (action === "cancel") {
    if (payment.kind === "pay_link" && payment.status === "link_sent") {
      // Make sure it hasn't just been paid before switching the link off.
      const fresh = await refreshPayLink(id);
      if (fresh?.status === "paid") return NextResponse.json({ error: "This invoice was just paid, so it can't be cancelled." }, { status: 409 });
    }
    // Only moves from a state where no money has moved, so it can never overwrite a payment.
    const canceled = await claimPayment(id, ["pending", "failed", "link_sent"], "canceled");
    if (!canceled) return NextResponse.json({ error: "Paid, in-progress or unconfirmed charges can't be cancelled here. Check Square." }, { status: 409 });
    if (payment.kind === "pay_link" && payment.squareLinkId) await deletePaymentLink(payment.squareLinkId).catch(() => null);
    return NextResponse.json({ payment: await getPayment(id) });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
