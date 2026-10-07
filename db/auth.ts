import { and, eq, gt, lt, sql } from "drizzle-orm";
import { getDb } from "./index";
import { authChallenges, authSessions, authTokens, passkeys } from "./schema";
import {
  CHALLENGE_TTL_MS,
  CODE_FAILURES_PER_SOURCE_PER_HOUR,
  CODE_MAX_ATTEMPTS,
  LINK_TTL_MS,
  LINKS_PER_EMAIL_PER_HOUR,
  LINKS_PER_SOURCE_PER_HOUR,
  SESSION_TTL_MS,
  codeHash,
  randomCode,
  randomToken,
  sha256Hex,
} from "../app/auth-core";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Create a one-time sign-in token and its 6-digit code, unless this email or this
 * requesting address already asked for too many in the last hour (then null).
 * The limit check and the insert are one statement, so a burst of parallel
 * requests can't all slip under the limit. Returns both raw values for the
 * email; only their hashes are stored. Either one signs the person in, once.
 */
export async function createLoginToken(email: string, returnTo: string, sourceHash: string) {
  const token = randomToken();
  const code = randomCode();
  const now = new Date();
  const since = new Date(now.getTime() - HOUR_MS).toISOString();
  const result = await getDb()
    .$client.prepare(
      `INSERT INTO auth_tokens (token_hash, email, return_to, source_hash, created_at, expires_at, used_at, code_hash, attempts)
       SELECT ?, ?, ?, ?, ?, ?, '', ?, 0
       WHERE (SELECT count(*) FROM auth_tokens WHERE email = ? AND created_at >= ?) < ?
         AND (? = '' OR (SELECT count(*) FROM auth_tokens WHERE source_hash = ? AND created_at >= ?) < ?)`,
    )
    .bind(
      await sha256Hex(token),
      email,
      returnTo,
      sourceHash,
      now.toISOString(),
      new Date(now.getTime() + LINK_TTL_MS).toISOString(),
      await codeHash(email, code),
      email,
      since,
      LINKS_PER_EMAIL_PER_HOUR,
      sourceHash,
      sourceHash,
      since,
      LINKS_PER_SOURCE_PER_HOUR,
    )
    .run();
  if ((result.meta.changes ?? 0) === 0) return null;
  return { token, code };
}

/**
 * Wrong sign-in codes from one address in the last hour. Stored as short-lived
 * rows in auth_challenges (purpose "code-failure", email = the address key), which
 * the existing cleanup already deletes once they expire.
 */
export async function codeFailuresFrom(sourceHash: string) {
  if (!sourceHash) return 0;
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)` })
    .from(authChallenges)
    .where(and(eq(authChallenges.purpose, "code-failure"), eq(authChallenges.email, sourceHash), gt(authChallenges.expiresAt, new Date().toISOString())));
  return Number(row?.n ?? 0);
}

export async function recordCodeFailure(sourceHash: string) {
  if (!sourceHash) return;
  await getDb()
    .insert(authChallenges)
    .values({ idHash: randomToken(), challenge: "", purpose: "code-failure", email: sourceHash, returnTo: "", expiresAt: new Date(Date.now() + HOUR_MS).toISOString() });
}

export const tooManyCodeFailures = (count: number) => count >= CODE_FAILURES_PER_SOURCE_PER_HOUR;

/**
 * Sign in with the 6-digit code from the email. Only the newest few open emails for
 * that address count, each allows a handful of wrong tries, and the matching token is
 * used up in one conditional update so the same code can't work twice.
 */
export async function consumeLoginCode(email: string, code: string): Promise<{ email: string; returnTo: string } | null> {
  const now = new Date().toISOString();
  const db = getDb();
  const hash = await codeHash(email, code);
  const used = await db
    .update(authTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(authTokens.email, email),
        eq(authTokens.codeHash, hash),
        eq(authTokens.usedAt, ""),
        gt(authTokens.expiresAt, now),
        lt(authTokens.attempts, CODE_MAX_ATTEMPTS),
      ),
    )
    .returning({ email: authTokens.email, returnTo: authTokens.returnTo });
  if (used[0]) return used[0];
  // Wrong code: count it against every open sign-in for this address.
  await db
    .update(authTokens)
    .set({ attempts: sql`${authTokens.attempts} + 1` })
    .where(and(eq(authTokens.email, email), eq(authTokens.usedAt, ""), gt(authTokens.expiresAt, now)));
  return null;
}

/* ---------- passkeys (Face ID) and the Google round trip ---------- */

export type StoredPasskey = typeof passkeys.$inferSelect;

/** Save a short-lived challenge; returns the raw id for the flow cookie. */
export async function saveChallenge(input: { challenge: string; purpose: string; email?: string; returnTo?: string }) {
  const id = randomToken();
  await getDb().insert(authChallenges).values({
    idHash: await sha256Hex(id),
    challenge: input.challenge,
    purpose: input.purpose,
    email: input.email ?? "",
    returnTo: input.returnTo ?? "/",
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS).toISOString(),
  });
  return id;
}

/** Take (and delete) a challenge so it can only be answered once. */
export async function takeChallenge(id: string, purpose: string) {
  const idHash = await sha256Hex(id);
  const now = new Date().toISOString();
  const rows = await getDb()
    .delete(authChallenges)
    .where(and(eq(authChallenges.idHash, idHash), eq(authChallenges.purpose, purpose), gt(authChallenges.expiresAt, now)))
    .returning();
  return rows[0] ?? null;
}

export async function passkeysFor(email: string) {
  return getDb().select().from(passkeys).where(eq(passkeys.email, email));
}

export async function findPasskey(credentialId: string) {
  const rows = await getDb().select().from(passkeys).where(eq(passkeys.credentialId, credentialId)).limit(1);
  return rows[0] ?? null;
}

export async function savePasskey(input: { credentialId: string; email: string; publicKey: string; counter: number; transports: string; device: string }) {
  await getDb()
    .insert(passkeys)
    .values({ ...input, createdAt: new Date().toISOString(), lastUsedAt: "" })
    .onConflictDoNothing();
}

export async function touchPasskey(credentialId: string, counter: number) {
  await getDb().update(passkeys).set({ counter, lastUsedAt: new Date().toISOString() }).where(eq(passkeys.credentialId, credentialId));
}

export async function removePasskeys(email: string) {
  await getDb().delete(passkeys).where(eq(passkeys.email, email));
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
  await db.delete(authChallenges).where(lt(authChallenges.expiresAt, now));
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
