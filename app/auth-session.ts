/**
 * Finishing a sign-in, shared by every way in: email link, 6-digit code, Face ID
 * (passkey) and Google. Starts the session and sets the cookie.
 */
import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { FLOW_COOKIE, readCookie, safeRelativeReturnPath, sessionCookie, shouldUseSecureCookie, flowCookie } from "./auth-core";
import { createSession, retireOpenLinks } from "../db/auth";

export async function signInJson(email: string, returnTo: string, request: Request) {
  await retireOpenLinks(email).catch(() => {});
  const sessionId = await createSession(email);
  const response = NextResponse.json({ ok: true, to: safeRelativeReturnPath(returnTo) });
  response.headers.append("Set-Cookie", sessionCookie(sessionId, shouldUseSecureCookie(request.url)));
  response.headers.append("Set-Cookie", flowCookie("", shouldUseSecureCookie(request.url), 0));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function signInRedirect(email: string, returnTo: string, request: Request) {
  await retireOpenLinks(email).catch(() => {});
  const sessionId = await createSession(email);
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL(safeRelativeReturnPath(returnTo), origin), 303);
  response.headers.append("Set-Cookie", sessionCookie(sessionId, shouldUseSecureCookie(request.url)));
  response.headers.append("Set-Cookie", flowCookie("", shouldUseSecureCookie(request.url), 0));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function readFlowCookie(request: Request): string | null {
  const value = readCookie(request.headers.get("cookie"), FLOW_COOKIE);
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}

type GoogleEnv = { GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string };

/** Google sign-in is switched on by setting both secrets on the Worker. */
export function googleConfig(): { clientId: string; clientSecret: string } | null {
  const e = env as unknown as GoogleEnv;
  const clientId = (e.GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (e.GOOGLE_CLIENT_SECRET || "").trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}
