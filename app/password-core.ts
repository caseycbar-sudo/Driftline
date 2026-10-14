/**
 * Passwords, the optional second way to sign in. Pure and free of framework
 * imports so it can be unit-tested directly.
 *
 * Stored as PBKDF2-SHA256 with a random salt. Cloudflare Workers caps PBKDF2 at
 * 100,000 iterations, so that is the number used. A password is only ever
 * compared after hashing, and never stored or logged.
 */

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;
export const PASSWORD_ITERATIONS = 100_000;
/** Wrong passwords per hour from one requesting address, and per email address. */
export const PASSWORD_FAILURES_PER_SOURCE_PER_HOUR = 20;
export const PASSWORD_FAILURES_PER_EMAIL_PER_HOUR = 8;
/** A session this young counts as "just signed in", so a forgotten password can be replaced. */
export const FRESH_SESSION_MS = 10 * 60 * 1000;

/** Why a new password is not acceptable, or "" when it is fine. */
export function passwordProblem(value: unknown): string {
  if (typeof value !== "string") return "Enter a password.";
  if (value.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (value.length > PASSWORD_MAX) return `Use ${PASSWORD_MAX} characters or fewer.`;
  if (/^\s|\s$/.test(value)) return "A password can't start or end with a space.";
  if (/^(.)\1+$/.test(value)) return "Pick something harder to guess than one repeated character.";
  const lowered = value.toLowerCase();
  if (["password", "driftline", "1234567890", "qwertyuiop"].some((weak) => lowered.includes(weak))) {
    return "That password is too easy to guess. Try a few unrelated words.";
  }
  return "";
}

function bytesToBase64(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += String.fromCharCode(b);
  return btoa(out);
}

function base64ToBytes(value: string): Uint8Array {
  const raw = atob(value);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, 256);
  return new Uint8Array(bits);
}

export type PasswordRecord = { hash: string; salt: string; iterations: number };

export async function hashPassword(password: string): Promise<PasswordRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, PASSWORD_ITERATIONS);
  return { hash: bytesToBase64(hash), salt: bytesToBase64(salt), iterations: PASSWORD_ITERATIONS };
}

/** Constant-time comparison of two equal-length byte arrays. */
function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(password: string, record: PasswordRecord): Promise<boolean> {
  if (typeof password !== "string" || password.length > PASSWORD_MAX) return false;
  const derived = await derive(password, base64ToBytes(record.salt), record.iterations);
  return sameBytes(derived, base64ToBytes(record.hash));
}

/** A throwaway record, so a sign-in for an unknown email takes as long as a real one. */
export async function dummyVerify(password: string): Promise<void> {
  await derive(typeof password === "string" ? password.slice(0, PASSWORD_MAX) : "", new Uint8Array(16), PASSWORD_ITERATIONS);
}

export const tooManyPasswordFailures = (bySource: number, byEmail: number) =>
  bySource >= PASSWORD_FAILURES_PER_SOURCE_PER_HOUR || byEmail >= PASSWORD_FAILURES_PER_EMAIL_PER_HOUR;
