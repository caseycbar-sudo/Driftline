import { NextResponse } from "next/server";
import { generateRegistrationOptions, verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { flowCookie, isCrossSiteRequest, passkeyRpId, shouldUseSecureCookie } from "../../../../auth-core";
import { getUser } from "../../../../auth";
import { passkeysFor, savePasskey, saveChallenge, takeChallenge } from "../../../../../db/auth";
import { readFlowCookie } from "../../../../auth-session";

export const dynamic = "force-dynamic";
const denied = () => NextResponse.json({ error: "Please sign in first." }, { status: 401 });

/**
 * Turn on Face ID / Touch ID for the signed-in person on this device.
 * Step 1 (no body): options for the phone. Step 2 ({ response }): save the passkey.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { response?: RegistrationResponseJSON; device?: string };
  if (isCrossSiteRequest(request)) return denied();
  const user = await getUser();
  if (!user) return denied();
  const url = new URL(request.url);
  const rpID = passkeyRpId(url.hostname);
  const secure = shouldUseSecureCookie(request.url);

  if (!body.response) {
    const existing = await passkeysFor(user.email);
    const options = await generateRegistrationOptions({
      rpName: "Driftline Provisions",
      rpID,
      userName: user.email,
      userDisplayName: user.fullName || user.email,
      attestationType: "none",
      excludeCredentials: existing.map((p) => ({ id: p.credentialId })),
      authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
    });
    const flow = await saveChallenge({ challenge: options.challenge, purpose: "pk-register", email: user.email });
    const response = NextResponse.json(options);
    response.headers.append("Set-Cookie", flowCookie(flow, secure));
    return response;
  }

  const flow = readFlowCookie(request);
  const challenge = flow ? await takeChallenge(flow, "pk-register") : null;
  if (!challenge || challenge.email !== user.email) {
    return NextResponse.json({ error: "That took too long. Please try again." }, { status: 400 });
  }
  try {
    const result = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: url.origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
    if (!result.verified || !result.registrationInfo) throw new Error("not verified");
    const { credential } = result.registrationInfo;
    await savePasskey({
      credentialId: credential.id,
      email: user.email,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      transports: (credential.transports ?? []).join(","),
      device: String(body.device ?? "").slice(0, 80),
    });
    const response = NextResponse.json({ ok: true });
    response.headers.append("Set-Cookie", flowCookie("", secure, 0));
    return response;
  } catch (error) {
    console.error("[passkey] registration failed", error);
    return NextResponse.json({ error: "Face ID couldn't be set up. Please try again." }, { status: 400 });
  }
}
