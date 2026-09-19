import { and, eq, gt, gte, lt, sql } from "drizzle-orm";
import { getDb } from "./index";
import { authSessions, authTokens } from "./schema";
import { LINK_TTL_MS, SESSION_TTL_MS, randomToken, sha256Hex } from "../app/auth-core";

/** Create a one-time sign-in token. Returns the raw token for the email link; only its hash is stored. */
export async function createLoginToken(email: string, returnTo: string, sourceHash: string) {
  const token = randomToken();
  const now = new Date();
  await getDb().insert(authTokens).values({
    tokenHash: await sha256Hex(token),
    email,
    returnTo,
    sourceHash,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + LINK_TTL_MS).toISOString(),
    usedAt: "",
  });
  return token;
}

/** How many links were requested in the last hour for this email and from this address. */
export async function recentLinkCounts(email: string, sourceHash: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const db = getDb();
  const [byEmail] = await db
    .select({ n: sql<number>`count(*)` })
    .from(authTokens)
    .where(and(eq(authTokens.email, email), gte(authTokens.createdAt, since)));
  const [bySource] = sourceHash
    ? await db
        .select({ n: sql<number>`count(*)` })
        .from(authTokens)
        .where(and(eq(authTokens.sourceHash, sourceHash), gte(authTokens.createdAt, since)))
    : [{ n: 0 }];
  return { byEmail: Number(byEmail?.n ?? 0), bySource: Number(bySource?.n ?? 0) };
}

/**
 * Use a sign-in token. Succeeds only once, only before it expires. The update is a
 * single conditional statement, so two simultaneous clicks cannot both succeed.
 */
export async function consumeLoginToken(token: string): Promise<{ email: string; returnTo: string } | null> {
  const tokenHash = await sha256Hex(token);
  const now = new Date().toISOString();
  const used = await getDb()
    .update(authTokens)
    .set({ usedAt: now })
    .where(and(eq(authTokens.tokenHash, tokenHash), eq(authTokens.usedAt, ""), gt(authTokens.expiresAt, now)))
    .returning({ email: authTokens.email, returnTo: authTokens.returnTo });
  return used[0] ?? null;
}

/** Mark every still-open sign-in link for this email as used. */
export async function retireOpenLinks(email: string) {
  await getDb()
    .update(authTokens)
    .set({ usedAt: new Date().toISOString() })
    .where(and(eq(authTokens.email, email), eq(authTokens.usedAt, "")));
}

/** Start a session. Returns the raw session id for the cookie; only its hash is stored. */
export async function createSession(email: string) {
  const id = randomToken();
  const now = new Date();
  await getDb().insert(authSessions).values({
    idHash: await sha256Hex(id),
    email,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
    lastSeenAt: now.toISOString(),
  });
  return id;
}

/** The email for a live session id, or null. */
export async function sessionEmail(id: string): Promise<string | null> {
  const idHash = await sha256Hex(id);
  const now = new Date().toISOString();
  const rows = await getDb()
    .select({ email: authSessions.email })
    .from(authSessions)
    .where(and(eq(authSessions.idHash, idHash), gt(authSessions.expiresAt, now)))
    .limit(1);
  return rows[0]?.email ?? null;
}

export async function deleteSession(id: string) {
  await getDb().delete(authSessions).where(eq(authSessions.idHash, await sha256Hex(id)));
}

/** Housekeeping: drop expired links and sessions. Cheap enough to run on each sign-in. */
export async function pruneExpired() {
  const now = new Date().toISOString();
  const db = getDb();
  await db.delete(authTokens).where(lt(authTokens.expiresAt, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()));
  await db.delete(authSessions).where(lt(authSessions.expiresAt, now));
}

/** A friendly name for an email: staff name, then customer name, then the email itself. */
export async function displayNameFor(email: string): Promise<string> {
  const db = getDb().$client;
  try {
    const staff = await db.prepare("SELECT full_name FROM staff_profiles WHERE email = ?").bind(email).first<{ full_name: string }>();
    if (staff?.full_name) return staff.full_name;
  } catch {}
  try {
    const customer = await db.prepare("SELECT full_name FROM customer_profiles WHERE email = ?").bind(email).first<{ full_name: string }>();
    if (customer?.full_name) return customer.full_name;
  } catch {}
  return email;
}
