/** Customer reviews: pure validation helpers. */
// Kept self-contained (no imports) so it can be unit tested directly with Node.
function cleanText(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export const REVIEW_SERVICES = ["Private chef dinner", "Catering", "Weekly meal prep", "Sunday Market chowder"] as const;
export const REVIEW_BODY_MIN = 20;
export const REVIEW_BODY_MAX = 1000;
export const REVIEWS_PER_EMAIL_PER_30_DAYS = 3;

export type ReviewInput = { displayName: string; town: string; service: string; rating: number; body: string };

export function parseReview(input: unknown): { ok: true; review: ReviewInput } | { ok: false; error: string; field?: string } {
  const b = (input ?? {}) as Record<string, unknown>;
  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: "Please choose 1 to 5 stars.", field: "rating" };
  const displayName = cleanText(b.displayName, 60);
  if (displayName.length < 2) return { ok: false, error: "Please add the name you'd like shown.", field: "displayName" };
  const service = cleanText(b.service, 40);
  if (!(REVIEW_SERVICES as readonly string[]).includes(service)) return { ok: false, error: "Please pick which service this was.", field: "service" };
  const body = String(b.body ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, REVIEW_BODY_MAX);
  if (body.length < REVIEW_BODY_MIN) return { ok: false, error: `Please write at least ${REVIEW_BODY_MIN} characters.`, field: "body" };
  if (/https?:\/\/|www\./i.test(body)) return { ok: false, error: "Please leave links out of your review.", field: "body" };
  return { ok: true, review: { displayName, town: cleanText(b.town, 60), service, rating, body } };
}

/** "Dana Henderson" -> "Dana H." so full names aren't published. */
export function publicName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
