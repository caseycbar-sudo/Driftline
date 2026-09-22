"use client";
/** Browser side of Face ID / Touch ID (passkey) sign-in. */
import { browserSupportsWebAuthn, browserSupportsWebAuthnAutofill, startAuthentication, startRegistration } from "@simplewebauthn/browser";

const READY_KEY = "dl-passkey-ready";

/** True once Face ID has been used or set up for Driftline in this browser. */
export function passkeyReadyHere(): boolean {
  try {
    return localStorage.getItem(READY_KEY) === "1";
  } catch {
    return false;
  }
}
function markReady() {
  try {
    localStorage.setItem(READY_KEY, "1");
  } catch {}
}

export function passkeysSupported(): boolean {
  try {
    return browserSupportsWebAuthn();
  } catch {
    return false;
  }
}

/** What to call it on this device. */
export function biometricName(): string {
  if (typeof navigator === "undefined") return "Face ID";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "Face ID";
  if (/Macintosh/.test(ua)) return "Touch ID";
  if (/Android/.test(ua)) return "fingerprint";
  return "a passkey";
}

async function post(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}) });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(data.error || "Something went wrong. Please try again."));
  return data;
}

export const NO_PASSKEY_YET = () =>
  `${biometricName()} isn't set up for Driftline on this phone yet. Sign in with your email code once, then tap "Use ${biometricName()}" when it pops up.`;

/**
 * Sign in with a saved passkey. Returns where to go next, or throws with a friendly
 * message. When the phone has no Driftline passkey, iOS just closes its sheet, which
 * looks the same as cancelling, so we say what to do instead of failing silently.
 */
export async function signInWithPasskey(returnTo: string): Promise<string | null> {
  const options = await post("/api/auth/passkey/login", { returnTo });
  let response;
  try {
    response = await startAuthentication({ optionsJSON: options as never });
  } catch (error) {
    if (error instanceof Error && /abort/i.test(`${error.name} ${error.message}`)) return null;
    throw new Error(NO_PASSKEY_YET());
  }
  const done = await post("/api/auth/passkey/login", { response });
  markReady();
  return String(done.to || "/account");
}

/**
 * Quietly offer saved passkeys in the email box's autofill bar (iPhone shows
 * "Sign in with passkey" above the keyboard). Resolves with where to go if used.
 */
export async function passkeyAutofill(returnTo: string): Promise<string | null> {
  try {
    if (!(await browserSupportsWebAuthnAutofill())) return null;
    const options = await post("/api/auth/passkey/login", { returnTo });
    const response = await startAuthentication({ optionsJSON: options as never, useBrowserAutofill: true });
    const done = await post("/api/auth/passkey/login", { response });
    markReady();
    return String(done.to || "/account");
  } catch {
    return null;
  }
}

/** Turn on Face ID for the signed-in account on this device. Returns false if cancelled. */
export async function registerPasskey(): Promise<boolean> {
  const options = await post("/api/auth/passkey/register", {});
  let response;
  try {
    response = await startRegistration({ optionsJSON: options as never });
  } catch (error) {
    if (error instanceof Error && /InvalidState/i.test(`${error.name} ${error.message}`)) return true; // already set up here
    if (error instanceof Error && /NotAllowed|abort|cancel/i.test(`${error.name} ${error.message}`)) return false;
    throw error;
  }
  await post("/api/auth/passkey/register", { response, device: biometricName() });
  markReady();
  return true;
}
