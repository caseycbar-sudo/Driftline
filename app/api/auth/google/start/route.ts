import { NextResponse } from "next/server";
import { flowCookie, randomToken, safeRelativeReturnPath, shouldUseSecureCookie } from "../../../../auth-core";
import { saveChallenge } from "../../../../../db/auth";
import { siteOrigin } from "../../../../notify";
import { googleConfig } from "../../../../auth-session";

export const dynamic = "force-dynamic";

/** "Continue with Google": send the person to Google's account chooser. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeRelativeReturnPath(url.searchParams.get("return_to") || "/account");
  const config = googleConfig();
  if (!config) return NextResponse.redirect(new URL(`/signin?return_to=${encodeURIComponent(returnTo)}`, url.origin), 303);

  const nonce = randomToken();
  const state = await saveChallenge({ challenge: nonce, purpose: "google", returnTo });
  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.searchParams.set("client_id", config.clientId);
  google.searchParams.set("redirect_uri", `${siteOrigin(request.url)}/api/auth/google/callback`);
  google.searchParams.set("response_type", "code");
  google.searchParams.set("scope", "openid email profile");
  google.searchParams.set("state", state);
  google.searchParams.set("nonce", nonce);
  google.searchParams.set("prompt", "select_account");
  const response = NextResponse.redirect(google.toString(), 303);
  response.headers.append("Set-Cookie", flowCookie(state, shouldUseSecureCookie(request.url)));
  return response;
}
