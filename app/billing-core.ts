/**
 * Pure billing rules, kept free of Worker imports so they can be unit tested.
 */

export type SquareEnvironment = "sandbox" | "production";

/**
 * Grocery totals above this are held for the owner to approve before the card
 * is charged. A typo (an extra zero) on the chef's phone should never reach a
 * customer's card on its own.
 */
export const GROCERY_REVIEW_CENTS = 25_000;
export const MAX_GROCERY_CENTS = 200_000;

/**
 * Strict dollars-and-cents parser for amounts typed by people: "84.62",
 * "$1,084.62", "0". Rejects anything Number() would accept but a person would
 * not mean, such as "1e3", "0x10", "Infinity", " " or "12.345".
 */
export function parseMoneyCents(raw: unknown): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const text = String(raw).trim().replace(/^\$\s*/, "");
  if (!/^(\d{1,3}(,\d{3})+|\d{1,7})(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.replace(/,/g, "").split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

/** The idempotency key for the next attempt after a definite decline: visit-12-1 becomes visit-12-2. */
export function nextVisitChargeKey(scheduleEventId: number, currentKey: string): string {
  const attempt = Number(currentKey.split("-").pop()) || 1;
  return `visit-${scheduleEventId}-${attempt + 1}`;
}

/**
 * True only when Square clearly refused the request, so no money moved and a
 * new idempotency key is safe. 429 and 5xx are unknown. IDEMPOTENCY_KEY_REUSED
 * means Square already has a request under this key (possibly a completed
 * charge), so it is unknown too, never a decline.
 */
export function isDefiniteSquareRefusal(status: number, code: string | undefined): boolean {
  if (code === "IDEMPOTENCY_KEY_REUSED" || code === "CONFLICT") return false;
  return status >= 400 && status < 500 && status !== 429;
}

/**
 * Reads SQUARE_ENVIRONMENT. Anything other than exactly "sandbox" or
 * "production" returns null, so a typo switches card payments off instead of
 * quietly pointing production at the test system (or the reverse).
 */
export function parseSquareEnvironment(raw: string | undefined): SquareEnvironment | null {
  const value = (raw || "").trim();
  return value === "sandbox" || value === "production" ? value : null;
}

/** Square payment states that mean money moved or may still move. */
export const LIVE_SQUARE_PAYMENT = new Set(["COMPLETED", "APPROVED", "PENDING"]);
