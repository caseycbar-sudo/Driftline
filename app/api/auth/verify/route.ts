import { NextResponse } from "next/server";
import { isCrossSiteRequest, looksLikeToken, safeRelativeReturnPath, sessionCookie, shouldUseSecureCookie } from "../../../auth-core";
import { consumeLoginToken, createSession, retireOpenLinks } from "../../../../db/auth";
import { siteOrigin } from "../../../notify";

export const dynamic = "force-dynamic";

/**
 * Finish sign-in. This is a POST from the "Continue" button on /auth/verify, never a
 * plain link, so email scanners that open links can't use up someone's sign-in.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  const origin = new URL(request.url).origin;
  const fail = () => NextResponse.redirect(new URL("/signin?expired=1", origin), 303);

  // Another website can't finish a sign-in on a visitor's behalf (that would quietly
  // sign them into someone else's account). The token is left unused.
  if (isCrossSiteRequest(request, [siteOrigin(request.url)])) return fail();
  if (!looksLikeToken(token)) return fail();
  const used = await consumeLoginToken(token);
  if (!used) return fail();
  // Any other sign-in links still sitting in that inbox stop working.
  await retireOpenLinks(used.email).catch(() => {});

  const sessionId = await createSession(used.email);
  const response = NextResponse.redirect(new URL(safeRelativeReturnPath(used.returnTo), origin), 303);
  response.headers.append("Set-Cookie", sessionCookie(sessionId, shouldUseSecureCookie(request.url)));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
