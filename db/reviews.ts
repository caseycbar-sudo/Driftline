import { and, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "./index";
import { reviews, scheduleEvents } from "./schema";
import type { ReviewInput } from "../app/review-core";

export type ReviewRow = typeof reviews.$inferSelect;

export async function recentReviewCount(email: string): Promise<number> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const rows = await getDb()
    .select({ n: sql<number>`count(*)` })
    .from(reviews)
    .where(and(eq(reviews.customerEmail, email), gt(reviews.createdAt, since)));
  return Number(rows[0]?.n ?? 0);
}

/** A reviewer counts as a verified client when a completed visit is on record for their email. */
export async function hasCompletedVisit(email: string): Promise<boolean> {
  const rows = await getDb()
    .select({ id: scheduleEvents.id })
    .from(scheduleEvents)
    .where(and(sql`lower(${scheduleEvents.customerEmail}) = ${email}`, eq(scheduleEvents.status, "completed")))
    .limit(1);
  return rows.length > 0;
}

export async function createReview(email: string, input: ReviewInput, verified: boolean) {
  const [row] = await getDb()
    .insert(reviews)
    .values({ customerEmail: email, ...input, verified, status: "pending", createdAt: new Date().toISOString() })
    .returning();
  return row;
}

export async function approvedReviews(limit = 12) {
  return getDb()
    .select({
      id: reviews.id,
      displayName: reviews.displayName,
      town: reviews.town,
      service: reviews.service,
      rating: reviews.rating,
      body: reviews.body,
      verified: reviews.verified,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function allReviews() {
  return getDb().select().from(reviews).orderBy(desc(reviews.createdAt)).limit(200);
}

export async function reviewsByEmail(email: string) {
  return getDb().select().from(reviews).where(eq(reviews.customerEmail, email)).orderBy(desc(reviews.createdAt)).limit(10);
}

export async function setReviewStatus(id: number, status: "approved" | "hidden" | "pending") {
  const rows = await getDb()
    .update(reviews)
    .set({ status, reviewedAt: new Date().toISOString() })
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id });
  return rows.length > 0;
}

export async function deleteReview(id: number) {
  const rows = await getDb().delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id });
  return rows.length > 0;
}
