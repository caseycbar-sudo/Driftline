import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "./index";
import { privateChefInquiries } from "./schema";
import type { CleanInquiry } from "../app/inquiry-validation";

/**
 * Inquiries from the public site: private chef dinners, catering, and meal prep.
 * The table keeps its original name (private_chef_inquiries) so existing leads carry over.
 */
export type Inquiry = typeof privateChefInquiries.$inferSelect;

export async function createInquiry(data: CleanInquiry, sourceHash: string) {
  const now = new Date().toISOString();
  return (
    await getDb()
      .insert(privateChefInquiries)
      .values({ ...data, sourceHash, status: "new", adminNotes: "", notifiedAt: "", createdAt: now, updatedAt: now })
      .returning()
  )[0];
}

/** How many inquiries this requester (hashed address) or email sent since `sinceIso`. */
export async function recentInquiryCount(sourceHash: string, email: string, sinceIso: string) {
  const db = getDb();
  const [bySource] = sourceHash
    ? await db
        .select({ n: sql<number>`count(*)` })
        .from(privateChefInquiries)
        .where(and(eq(privateChefInquiries.sourceHash, sourceHash), gte(privateChefInquiries.createdAt, sinceIso)))
    : [{ n: 0 }];
  const [byEmail] = await db
    .select({ n: sql<number>`count(*)` })
    .from(privateChefInquiries)
    .where(and(eq(privateChefInquiries.email, email), gte(privateChefInquiries.createdAt, sinceIso)));
  return { bySource: Number(bySource?.n ?? 0), byEmail: Number(byEmail?.n ?? 0) };
}

export async function markInquiryNotified(id: number) {
  await getDb()
    .update(privateChefInquiries)
    .set({ notifiedAt: new Date().toISOString() })
    .where(eq(privateChefInquiries.id, id));
}

export async function listInquiries() {
  return getDb().select().from(privateChefInquiries).orderBy(desc(privateChefInquiries.createdAt));
}

export async function updateInquiry(id: number, status: string, adminNotes: string) {
  return (
    await getDb()
      .update(privateChefInquiries)
      .set({ status, adminNotes, updatedAt: new Date().toISOString() })
      .where(eq(privateChefInquiries.id, id))
      .returning()
  )[0];
}

/** Admin list without the internal rate-limit hash. */
export function toAdminInquiry(row: Inquiry) {
  const { sourceHash: _omit, ...rest } = row;
  void _omit;
  return rest;
}
