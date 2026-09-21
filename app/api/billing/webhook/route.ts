import { NextResponse } from "next/server";
import { squareConfig, verifyWebhookSignature } from "../../../square";
import { findPaymentByOrderId } from "../../../../db/payments";
import { refreshPayLink } from "../../../billing";
import { publicSiteUrl } from "../../../notify";

export const dynamic = "force-dynamic";

/**
 * Square calls this when a payment changes. We only trust it after checking
 * Square's signature, and even then we re-read the order from Square rather
 * than believing the message body.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const config = squareConfig();
  if (!config?.webhookKey) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const url = `${publicSiteUrl()}/api/billing/webhook`;
  const ok = await verifyWebhookSignature(raw, request.headers.get("x-square-hmacsha256-signature"), url, config.webhookKey);
  if (!ok) return NextResponse.json({ error: "Bad signature" }, { status: 401 });

  let event: { type?: string; data?: { object?: { payment?: { order_id?: string; status?: string } } } } = {};
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }
  const orderId = event.data?.object?.payment?.order_id;
  if ((event.type === "payment.created" || event.type === "payment.updated") && orderId) {
    const payment = await findPaymentByOrderId(orderId);
    if (payment) await refreshPayLink(payment.id);
  }
  return NextResponse.json({ ok: true });
}
