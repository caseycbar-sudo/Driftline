import { NextResponse } from "next/server";
import { isCrossSiteRequest, SESSION_COOKIE, clearedSessionCookie, readCookie, safeRelativeReturnPath, shouldUseSecureCookie } from "../auth-core";
import { deleteSession } from "../../db/auth";

export const dynamic = "force-dynamic";

/** Sign out: end the session on the server and clear the cookie. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  // A link on another website can't sign someone out.
  if (isCrossSiteRequest(request)) return NextResponse.redirect(new URL("/", url.origin), 303);
  const sessionId = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (sessionId && /^[A-Za-z0-9_-]{43}$/.test(sessionId)) await deleteSession(sessionId).catch(() => {});
  const response = NextResponse.redirect(new URL(safeRelativeReturnPath(url.searchParams.get("return_to")), url.origin), 303);
  response.headers.append("Set-Cookie", clearedSessionCookie(shouldUseSecureCookie(request.url)));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
