import { NextResponse } from "next/server";
import { normalizeEmail } from "../../../../auth-core";
import { takeChallenge } from "../../../../../db/auth";
import { siteOrigin } from "../../../../notify";
import { googleConfig, readFlowCookie, signInRedirect } from "../../../../auth-session";
import { readGoogleIdToken } from "../../../../google-core";

export const dynamic = "force-dynamic";

/**
 * Google sends the person back here. The state must match the cookie set when they
 * left (so another site can't finish a sign-in for them), and the email must be one
 * Google has verified.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const fail = () => NextResponse.redirect(new URL("/signin?google=failed", url.origin), 303);
  const config = googleConfig();
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  const flow = readFlowCookie(request);
  if (!config || !code || !flow || flow !== state) return fail();
  const challenge = await takeChallenge(flow, "google");
  if (!challenge) return fail();

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: `${siteOrigin(request.url)}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResponse.ok) throw new Error(`token exchange ${tokenResponse.status}`);
    const tokens = (await tokenResponse.json()) as { id_token?: string };
    // The ID token came straight from Google over HTTPS in exchange for our secret,
    // so its claims can be read directly; we still check who it's for and the nonce.
    const claims = readGoogleIdToken(tokens.id_token, { clientId: config.clientId, nonce: challenge.challenge });
    const email = claims ? normalizeEmail(claims.email) : null;
    if (!email) return fail();
    return signInRedirect(email, challenge.returnTo, request);
  } catch (error) {
    console.error("[google] sign-in failed", error);
    return fail();
  }
}
