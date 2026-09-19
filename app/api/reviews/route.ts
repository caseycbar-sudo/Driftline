import { NextResponse } from "next/server";
import { getUser } from "../../auth";
import { isCrossSiteRequest } from "../../auth-core";
import { REVIEWS_PER_EMAIL_PER_30_DAYS, parseReview, publicName } from "../../review-core";
import { approvedReviews, createReview, hasCompletedVisit, recentReviewCount, reviewsByEmail } from "../../../db/reviews";
import { notifyNewReview } from "../../notify";

export const dynamic = "force-dynamic";

/** Public: approved reviews only, with last names shortened to an initial. */
export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get("mine") === "1") {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const mine = await reviewsByEmail(user.email);
    return NextResponse.json(
      { reviews: mine.map((r) => ({ id: r.id, rating: r.rating, service: r.service, status: r.status, createdAt: r.createdAt })) },
      { headers: { "cache-control": "private, no-store" } },
    );
  }
  const rows = await approvedReviews().catch(() => []);
  return NextResponse.json(
    { reviews: rows.map((r) => ({ ...r, displayName: publicName(r.displayName) })) },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}

/** Signed-in customers leave a review. It waits for the owner's approval before anyone sees it. */
export async function POST(request: Request) {
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });
  const parsed = parseReview(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error, field: parsed.field }, { status: 400 });
  if ((await recentReviewCount(user.email)) >= REVIEWS_PER_EMAIL_PER_30_DAYS) {
    return NextResponse.json({ error: "Thanks! You've already sent a few reviews this month." }, { status: 429 });
  }
  const verified = await hasCompletedVisit(user.email).catch(() => false);
  const review = await createReview(user.email, parsed.review, verified);
  await notifyNewReview({ ...parsed.review, email: user.email, verified }).catch(() => false);
  return NextResponse.json({ ok: true, id: review.id, status: review.status });
}
