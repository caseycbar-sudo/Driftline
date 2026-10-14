import { NextResponse } from "next/server";
import { isCrossSiteRequest, normalizeEmail, requestSourceHash } from "../../../auth-core";
import { dummyVerify, tooManyPasswordFailures, verifyPassword } from "../../../password-core";
import { getPasswordRecord, passwordFailureCounts, recordPasswordFailure } from "../../../../db/passwords";
import { siteOrigin } from "../../../notify";
import { signInJson } from "../../../auth-session";

export const dynamic = "force-dynamic";

const WRONG = "That email and password don't match. Check them, or use a code from your email instead.";

/** Sign in with an email and a password the person set earlier. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request, [siteOrigin(request.url)])) {
    return NextResponse.json({ error: "Please sign in from the Driftline website." }, { status: 403 });
  }
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

  const source = await requestSourceHash(request);
  const counts = await passwordFailureCounts(email, source);
  if (tooManyPasswordFailures(counts.bySource, counts.byEmail)) {
    return NextResponse.json({ error: "Too many tries. Use a code from your email, or try again in an hour." }, { status: 429 });
  }

  const record = await getPasswordRecord(email);
  // Same work and same answer whether or not the email has a password, so this can't be used to find out who has an account.
  const ok = record ? await verifyPassword(password, record) : (await dummyVerify(password), false);
  if (!ok) {
    await recordPasswordFailure(email, source).catch(() => undefined);
    return NextResponse.json({ error: WRONG }, { status: 400 });
  }
  const returnTo = typeof body.returnTo === "string" ? body.returnTo : "/account";
  return signInJson(email, returnTo, request, "password");
}
