"use client";
/** Browser side of Face ID / Touch ID (passkey) sign-in. */
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";

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

/** Returns where to go next, or throws with a friendly message. Cancelled prompts return null. */
export async function signInWithPasskey(returnTo: string): Promise<string | null> {
  const options = await post("/api/auth/passkey/login", { returnTo });
  let response;
  try {
    response = await startAuthentication({ optionsJSON: options as never });
  } catch (error) {
    if (error instanceof Error && /NotAllowed|abort|cancel/i.test(`${error.name} ${error.message}`)) return null;
    throw new Error(`${biometricName()} isn't set up for Driftline on this device yet. Sign in with email once, then turn it on.`);
  }
  const done = await post("/api/auth/passkey/login", { response });
  return String(done.to || "/account");
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
  return true;
}
