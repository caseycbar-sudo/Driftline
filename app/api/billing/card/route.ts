import { NextResponse } from "next/server";
import { getUser } from "../../../auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { getCustomer } from "../../../../db/customers";
import { clearSavedCard, getBillingProfile, listPaymentsForCustomer, saveBillingProfile } from "../../../../db/payments";
import { createCard, createCustomer, disableCard, squareConfig } from "../../../square";
import { chargeWaitingVisits } from "../../../billing";

export const dynamic = "force-dynamic";
const noStore = { "cache-control": "private, no-store" };

/** The signed-in customer's saved card (brand + last 4 only) and payment history. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const config = squareConfig();
  const [profile, history] = await Promise.all([getBillingProfile(user.email), listPaymentsForCustomer(user.email)]);
  return NextResponse.json(
    {
      configured: Boolean(config),
      sdk: config ? { applicationId: config.applicationId, locationId: config.locationId, url: config.sdkUrl, environment: config.environment } : null,
      card: profile?.cardId
        ? { brand: profile.cardBrand, last4: profile.cardLast4, expMonth: profile.cardExpMonth, expYear: profile.cardExpYear, autopay: Boolean(profile.autopayConsentAt) }
        : null,
      payments: history.map((p) => ({
        id: p.id,
        description: p.description,
        amountCents: p.amountCents,
        serviceCents: p.serviceCents,
        groceryCents: p.groceryCents,
        status: p.status,
        kind: p.kind,
        linkUrl: p.status === "link_sent" ? p.linkUrl : "",
        receiptUrl: p.receiptUrl,
        createdAt: p.createdAt,
        paidAt: p.paidAt,
      })),
    },
    { headers: noStore },
  );
}

/**
 * Save a card. The browser's Square form turns the card into a one-time token;
 * we swap that for a saved card on the customer's Square profile.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!squareConfig()) return NextResponse.json({ error: "Card payments aren't switched on yet." }, { status: 503 });
  const sourceId = String(body.sourceId ?? "");
  if (!/^[\w:+\-./=]{8,512}$/.test(sourceId)) return NextResponse.json({ error: "Please enter the card again." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Please agree to be charged after each visit." }, { status: 400 });
  const verificationToken = typeof body.verificationToken === "string" ? body.verificationToken.slice(0, 1024) : undefined;

  const customer = await getCustomer(user.email);
  const fullName = (customer?.fullName || user.displayName || "").trim();
  let profile = await getBillingProfile(user.email);
  if (!profile) {
    const [givenName, ...rest] = fullName.includes("@") ? [""] : fullName.split(/\s+/);
    const created = await createCustomer({
      email: user.email,
      givenName: givenName ?? "",
      familyName: rest.join(" "),
      referenceId: user.email.slice(0, 40),
      idempotencyKey: `cust-${crypto.randomUUID()}`,
    });
    if (!created.ok) return NextResponse.json({ error: created.message }, { status: 502 });
    profile = await saveBillingProfile({
      email: user.email,
      squareCustomerId: created.data.customer.id,
      cardId: "",
      cardBrand: "",
      cardLast4: "",
      cardExpMonth: 0,
      cardExpYear: 0,
      autopayConsentAt: "",
    });
  }

  const card = await createCard({
    sourceId,
    verificationToken,
    customerId: profile.squareCustomerId,
    cardholderName: fullName.includes("@") ? "" : fullName,
    idempotencyKey: `card-${crypto.randomUUID()}`,
  });
  if (!card.ok) return NextResponse.json({ error: card.message }, { status: 400 });

  const oldCardId = profile.cardId;
  await saveBillingProfile({
    ...profile,
    cardId: card.data.card.id,
    cardBrand: card.data.card.card_brand ?? "",
    cardLast4: card.data.card.last_4 ?? "",
    cardExpMonth: card.data.card.exp_month ?? 0,
    cardExpYear: card.data.card.exp_year ?? 0,
    autopayConsentAt: new Date().toISOString(),
  });
  if (oldCardId && oldCardId !== card.data.card.id) await disableCard(oldCardId).catch(() => null);

  // Anything that was waiting on a card gets charged now.
  const charged = await chargeWaitingVisits(user.email).catch(() => []);
  return NextResponse.json({
    ok: true,
    card: { brand: card.data.card.card_brand ?? "", last4: card.data.card.last_4 ?? "" },
    charged: charged.filter((c) => c.outcome === "paid").length,
  });
}

/** Remove the saved card and turn off autopay. */
export async function DELETE(request: Request) {
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const profile = await getBillingProfile(user.email);
  if (profile?.cardId) await disableCard(profile.cardId).catch(() => null);
  await clearSavedCard(user.email);
  return NextResponse.json({ ok: true });
}
