import { NextResponse } from "next/server";
import { generateAuthenticationOptions, verifyAuthenticationResponse, type AuthenticationResponseJSON, type AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { flowCookie, isCrossSiteRequest, passkeyRpId, safeRelativeReturnPath, shouldUseSecureCookie } from "../../../../auth-core";
import { findPasskey, saveChallenge, takeChallenge, touchPasskey } from "../../../../../db/auth";
import { readFlowCookie, signInJson } from "../../../../auth-session";

export const dynamic = "force-dynamic";

/**
 * Sign in with Face ID / Touch ID. Step 1 ({ returnTo }): options for the phone,
 * which shows the person their saved Driftline passkeys. Step 2 ({ response }): check it
 * and start the session.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { response?: AuthenticationResponseJSON; returnTo?: string };
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Please sign in from the Driftline website." }, { status: 403 });
  const url = new URL(request.url);
  const rpID = passkeyRpId(url.hostname);
  const secure = shouldUseSecureCookie(request.url);

  if (!body.response) {
    const options = await generateAuthenticationOptions({ rpID, userVerification: "preferred", allowCredentials: [] });
    const flow = await saveChallenge({ challenge: options.challenge, purpose: "pk-login", returnTo: safeRelativeReturnPath(body.returnTo) });
    const response = NextResponse.json(options);
    response.headers.append("Set-Cookie", flowCookie(flow, secure));
    return response;
  }

  const fail = (message = "Face ID sign-in didn't work. Use your email instead, then turn Face ID on again.") =>
    NextResponse.json({ error: message }, { status: 400 });
  const flow = readFlowCookie(request);
  const challenge = flow ? await takeChallenge(flow, "pk-login") : null;
  if (!challenge) return fail("That took too long. Please try again.");
  const stored = await findPasskey(String(body.response.id || ""));
  if (!stored) return fail("This device's Face ID isn't linked to a Driftline account yet. Sign in with email once, then turn it on.");
  try {
    const result = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: url.origin,
      expectedRPID: rpID,
      requireUserVerification: false,
      credential: {
        id: stored.credentialId,
        publicKey: isoBase64URL.toBuffer(stored.publicKey),
        counter: stored.counter,
        transports: stored.transports ? (stored.transports.split(",") as AuthenticatorTransportFuture[]) : undefined,
      },
    });
    if (!result.verified) return fail();
    await touchPasskey(stored.credentialId, result.authenticationInfo.newCounter);
    return signInJson(stored.email, challenge.returnTo, request);
  } catch (error) {
    console.error("[passkey] sign-in failed", error);
    return fail();
  }
}
