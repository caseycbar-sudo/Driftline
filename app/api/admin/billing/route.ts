import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest, normalizeEmail } from "../../../auth-core";
import { getBillingProfile, getPayment, listPayments, updatePayment } from "../../../../db/payments";
import { getCustomer, listCustomers } from "../../../../db/customers";
import { refreshPayLink, runVisitCharge, sendPayLink } from "../../../billing";
import { deletePaymentLink, squareConfig } from "../../../square";

export const dynamic = "force-dynamic";
const forbidden = () => NextResponse.json({ error: "Owner access required" }, { status: 403 });

/** Everything billed, newest first, plus which customers have a card saved. */
export async function GET() {
  if (!(await requireStaffRole("admin"))) return forbidden();
  const [payments, customers] = await Promise.all([listPayments(), listCustomers()]);
  const cards = await Promise.all(
    customers.map(async (c) => {
      const p = await getBillingProfile(c.email);
      return { email: c.email, name: c.fullName, card: p?.cardId ? `${p.cardBrand} ···· ${p.cardLast4}` : "", autopay: Boolean(p?.autopayConsentAt) };
    }),
  );
  const config = squareConfig();
  return NextResponse.json(
    { configured: Boolean(config), environment: config?.environment ?? "", payments, customers: cards },
    { headers: { "cache-control": "private, no-store" } },
  );
}

/** Actions: send a pay link, retry a visit charge, check a pay link, or cancel a payment. */
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

  const id = Number(body.id);
  const payment = Number.isInteger(id) && id > 0 ? await getPayment(id) : null;
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  if (action === "retry") {
    if (payment.kind !== "visit_charge") return NextResponse.json({ error: "Only visit charges can be retried." }, { status: 400 });
    return NextResponse.json({ result: await runVisitCharge(payment), payment: await getPayment(id) });
  }
  if (action === "check") return NextResponse.json({ payment: await refreshPayLink(id) });
  if (action === "cancel") {
    if (payment.status === "paid" || payment.status === "processing") return NextResponse.json({ error: "Paid or in-progress charges can't be cancelled here. Refund in Square." }, { status: 409 });
    if (payment.kind === "pay_link" && payment.squareLinkId) {
      // Make sure it hasn't just been paid, then switch the link off.
      const fresh = await refreshPayLink(id);
      if (fresh?.status === "paid") return NextResponse.json({ error: "This invoice was just paid, so it can't be cancelled." }, { status: 409 });
      await deletePaymentLink(payment.squareLinkId).catch(() => null);
    }
    return NextResponse.json({ payment: await updatePayment(id, { status: "canceled" }) });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
