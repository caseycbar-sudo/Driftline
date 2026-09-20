/**
 * Minimal Square API client for Driftline: customers, saved cards, charges,
 * payment links, orders, and webhook signature checks.
 *
 * Settings (Worker variables; the token and signature key are secrets):
 *   SQUARE_ENVIRONMENT            "sandbox" (test cards, no real money) or "production"
 *   SQUARE_ACCESS_TOKEN           secret
 *   SQUARE_APPLICATION_ID         public, used by the card form in the browser
 *   SQUARE_LOCATION_ID            the Square location payments are recorded under
 *   SQUARE_WEBHOOK_SIGNATURE_KEY  secret, from the webhook subscription
 *   SQUARE_API_URL                local testing only: point at a stand-in server
 *
 * Card numbers never pass through Driftline: the browser form sends them straight
 * to Square and gives us a one-time token.
 */
import { env } from "cloudflare:workers";

type SquareEnv = {
  SQUARE_ENVIRONMENT?: string;
  SQUARE_ACCESS_TOKEN?: string;
  SQUARE_APPLICATION_ID?: string;
  SQUARE_LOCATION_ID?: string;
  SQUARE_WEBHOOK_SIGNATURE_KEY?: string;
  SQUARE_API_URL?: string;
};

const SQUARE_VERSION = "2025-01-23";

export function squareConfig() {
  const e = env as unknown as SquareEnv;
  const environment = e.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";
  const token = (e.SQUARE_ACCESS_TOKEN || "").trim();
  const locationId = (e.SQUARE_LOCATION_ID || "").trim();
  const applicationId = (e.SQUARE_APPLICATION_ID || "").trim();
  if (!token || !locationId || !applicationId) return null;
  const base =
    (e.SQUARE_API_URL || "").trim().replace(/\/$/, "") ||
    (environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com");
  return {
    environment,
    token,
    locationId,
    applicationId,
    base,
    webhookKey: (e.SQUARE_WEBHOOK_SIGNATURE_KEY || "").trim(),
    sdkUrl: environment === "production" ? "https://web.squarecdn.com/v1/square.js" : "https://sandbox.web.squarecdn.com/v1/square.js",
  };
}

export type SquareResult<T> = { ok: true; data: T } | { ok: false; code: string; message: string; status: number };

async function call<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<SquareResult<T>> {
  const config = squareConfig();
  if (!config) return { ok: false, code: "NOT_CONFIGURED", message: "Card payments aren't set up yet.", status: 503 };
  let response: Response;
  try {
    response = await fetch(`${config.base}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${config.token}`,
        "square-version": SQUARE_VERSION,
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { ok: false, code: "NETWORK", message: "Couldn't reach Square. Try again in a minute.", status: 502 };
  }
  const json = (await response.json().catch(() => ({}))) as { errors?: { code?: string; detail?: string }[] } & T;
  if (!response.ok || json.errors?.length) {
    const first = json.errors?.[0];
    return { ok: false, code: first?.code || `HTTP_${response.status}`, message: friendlyError(first?.code, first?.detail), status: response.status };
  }
  return { ok: true, data: json as T };
}

/** Plain-English messages for the card errors customers actually hit. */
export function friendlyError(code?: string, detail?: string): string {
  switch (code) {
    case "GENERIC_DECLINE":
    case "CARD_DECLINED":
      return "The card was declined.";
    case "INSUFFICIENT_FUNDS":
      return "The card was declined for insufficient funds.";
    case "CVV_FAILURE":
      return "The security code didn't match.";
    case "ADDRESS_VERIFICATION_FAILURE":
    case "INVALID_POSTAL_CODE":
      return "The ZIP code didn't match the card.";
    case "INVALID_EXPIRATION":
    case "CARD_EXPIRED":
      return "The card has expired.";
    case "CARD_DECLINED_VERIFICATION_REQUIRED":
      return "The bank needs the cardholder to verify this card.";
    case "SOURCE_EXPIRED":
    case "SOURCE_USED":
      return "That card entry expired. Please enter the card again.";
    default:
      return detail ? `Square: ${detail}`.slice(0, 200) : "Square couldn't complete that request.";
  }
}

export async function createCustomer(input: { email: string; givenName: string; familyName: string; referenceId: string; idempotencyKey: string }) {
  return call<{ customer: { id: string } }>("POST", "/v2/customers", {
    idempotency_key: input.idempotencyKey,
    email_address: input.email,
    given_name: input.givenName || undefined,
    family_name: input.familyName || undefined,
    reference_id: input.referenceId,
  });
}

export type SquareCard = { id: string; card_brand?: string; last_4?: string; exp_month?: number; exp_year?: number };

export async function createCard(input: { sourceId: string; verificationToken?: string; customerId: string; cardholderName: string; idempotencyKey: string }) {
  return call<{ card: SquareCard }>("POST", "/v2/cards", {
    idempotency_key: input.idempotencyKey,
    source_id: input.sourceId,
    verification_token: input.verificationToken || undefined,
    card: { customer_id: input.customerId, cardholder_name: input.cardholderName || undefined },
  });
}

export async function disableCard(cardId: string) {
  return call<{ card: SquareCard }>("POST", `/v2/cards/${encodeURIComponent(cardId)}/disable`, {});
}

export type SquarePayment = { id: string; status: string; receipt_url?: string; order_id?: string; amount_money?: { amount: number; currency: string } };

/** Charge a saved card. The idempotency key makes a retried request safe: Square charges at most once per key. */
export async function chargeCard(input: {
  cardId: string;
  customerId: string;
  amountCents: number;
  idempotencyKey: string;
  referenceId: string;
  note: string;
  buyerEmail: string;
}) {
  const config = squareConfig();
  return call<{ payment: SquarePayment }>("POST", "/v2/payments", {
    idempotency_key: input.idempotencyKey,
    source_id: input.cardId,
    customer_id: input.customerId,
    location_id: config?.locationId,
    amount_money: { amount: input.amountCents, currency: "USD" },
    reference_id: input.referenceId.slice(0, 40),
    note: input.note.slice(0, 500),
    buyer_email_address: input.buyerEmail || undefined,
    autocomplete: true,
  });
}

export async function createPaymentLink(input: {
  name: string;
  amountCents: number;
  idempotencyKey: string;
  buyerEmail: string;
  redirectUrl: string;
  note: string;
}) {
  const config = squareConfig();
  return call<{ payment_link: { id: string; url: string; order_id: string } }>("POST", "/v2/online-checkout/payment-links", {
    idempotency_key: input.idempotencyKey,
    quick_pay: { name: input.name.slice(0, 255), price_money: { amount: input.amountCents, currency: "USD" }, location_id: config?.locationId },
    checkout_options: { redirect_url: input.redirectUrl, ask_for_shipping_address: false },
    pre_populated_data: input.buyerEmail ? { buyer_email: input.buyerEmail } : undefined,
    payment_note: input.note.slice(0, 500),
  });
}

/** Turn off a pay link so it can't be used any more. */
export async function deletePaymentLink(linkId: string) {
  return call<{ id: string }>("DELETE", `/v2/online-checkout/payment-links/${encodeURIComponent(linkId)}`);
}

export async function retrieveOrder(orderId: string) {
  return call<{ order: { id: string; state?: string; tenders?: { id: string; payment_id?: string }[] } }>(
    "GET",
    `/v2/orders/${encodeURIComponent(orderId)}`,
  );
}

export async function retrievePayment(paymentId: string) {
  return call<{ payment: SquarePayment }>("GET", `/v2/payments/${encodeURIComponent(paymentId)}`);
}

/**
 * Square signs each webhook: base64(HMAC-SHA256(signatureKey, notificationUrl + rawBody)).
 * Compared in constant time.
 */
export async function verifyWebhookSignature(rawBody: string, signature: string | null, notificationUrl: string, signatureKey: string) {
  if (!signature || !signatureKey) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(signatureKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(notificationUrl + rawBody)));
  let expected = "";
  for (const byte of mac) expected += String.fromCharCode(byte);
  expected = btoa(expected);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
