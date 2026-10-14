import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "./index";
import { authChallenges, authPasswords, authSessions } from "./schema";
import { randomToken, sha256Hex } from "../app/auth-core";
import type { PasswordRecord } from "../app/password-core";

const HOUR_MS = 60 * 60 * 1000;

export async function getPasswordRecord(email: string): Promise<PasswordRecord | null> {
  const rows = await getDb().select().from(authPasswords).where(eq(authPasswords.email, email)).limit(1);
  const row = rows[0];
  return row ? { hash: row.hash, salt: row.salt, iterations: row.iterations } : null;
}

export async function savePasswordRecord(email: string, record: PasswordRecord) {
  const now = new Date().toISOString();
  await getDb()
    .insert(authPasswords)
    .values({ email, ...record, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: authPasswords.email, set: { ...record, updatedAt: now } });
}

export async function removePasswordRecord(email: string) {
  await getDb().delete(authPasswords).where(eq(authPasswords.email, email));
}

/** Failures are short-lived rows in auth_challenges, which the existing cleanup deletes once they expire. */
async function failureKeys(email: string, sourceHash: string) {
  return { source: sourceHash ? `src:${sourceHash}` : "", email: `em:${(await sha256Hex(`driftline-pw:${email}`)).slice(0, 24)}` };
}

async function countFailures(key: string) {
  if (!key) return 0;
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)` })
    .from(authChallenges)
    .where(and(eq(authChallenges.purpose, "pw-failure"), eq(authChallenges.email, key), gt(authChallenges.expiresAt, new Date().toISOString())));
  return Number(row?.n ?? 0);
}

export async function passwordFailureCounts(email: string, sourceHash: string) {
  const keys = await failureKeys(email, sourceHash);
  return { bySource: await countFailures(keys.source), byEmail: await countFailures(keys.email) };
}

export async function recordPasswordFailure(email: string, sourceHash: string) {
  const keys = await failureKeys(email, sourceHash);
  const expiresAt = new Date(Date.now() + HOUR_MS).toISOString();
  for (const key of [keys.source, keys.email]) {
    if (!key) continue;
    await getDb().insert(authChallenges).values({ idHash: randomToken(), challenge: "", purpose: "pw-failure", email: key, returnTo: "", expiresAt });
  }
}

/** When this live session started and how, or null if it is not a live session. */
export async function sessionStart(sessionIdHash: string): Promise<{ at: number; method: string } | null> {
  const rows = await getDb()
    .select({ createdAt: authSessions.createdAt, method: authSessions.method })
    .from(authSessions)
    .where(and(eq(authSessions.idHash, sessionIdHash), gt(authSessions.expiresAt, new Date().toISOString())))
    .limit(1);
  const at = rows[0] ? Date.parse(rows[0].createdAt) : NaN;
  return rows[0] && Number.isFinite(at) ? { at, method: rows[0].method } : null;
}

/** Sign out every other device after a password change. */
export async function deleteOtherSessions(email: string, keepIdHash: string) {
  await getDb().run(sql`DELETE FROM auth_sessions WHERE email = ${email} AND id_hash <> ${keepIdHash}`);
}
