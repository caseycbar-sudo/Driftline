/**
 * Sunday Market status: pure helpers (no database or framework imports).
 * The owner sets a status for *today*; it lapses on its own at midnight
 * Oregon time so a "Sold out" never lingers into next week.
 */
export const MARKET_STATUSES = ["schedule", "open", "sold_out", "closed"] as const;
export type MarketStatus = (typeof MARKET_STATUSES)[number];
export const MARKET_NOTE_MAX = 140;

export type SavedMarketStatus = { status: MarketStatus; note: string; date: string; updatedAt: string };
export type PublicMarketStatus = { status: MarketStatus; note: string; updatedAt: string };

export function oregonDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Collapse whitespace, drop control characters, cap the length. */
export function cleanText(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function parseMarketUpdate(input: unknown): { ok: true; status: MarketStatus; note: string } | { ok: false; error: string } {
  const body = (input ?? {}) as Record<string, unknown>;
  const status = String(body.status ?? "");
  if (!(MARKET_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Pick one of the market options." };
  const note = status === "schedule" ? "" : cleanText(body.note, MARKET_NOTE_MAX);
  return { ok: true, status: status as MarketStatus, note };
}

/** What visitors should see right now. Anything saved for an earlier day falls back to the regular schedule. */
export function effectiveMarketStatus(saved: SavedMarketStatus | null, now = new Date()): PublicMarketStatus {
  if (!saved || saved.date !== oregonDate(now) || saved.status === "schedule") {
    return { status: "schedule", note: "", updatedAt: saved?.updatedAt ?? "" };
  }
  return { status: saved.status, note: saved.note, updatedAt: saved.updatedAt };
}

export const MARKET_LABELS: Record<MarketStatus, { title: string; detail: string }> = {
  schedule: { title: "Sundays at the Astoria Sunday Market", detail: "10am to 3pm on 12th Street, Mother's Day to mid-October." },
  open: { title: "We're at the market today", detail: "Chowder's hot on 12th Street until 3pm. Come say hi." },
  sold_out: { title: "Sold out today", detail: "Thank you, Astoria! See you next Sunday." },
  closed: { title: "No market for us this week", detail: "We'll be back soon. Private dinners and catering are still booking." },
};
