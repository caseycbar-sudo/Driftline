import { NextResponse } from "next/server";
import { cleanCode, isCrossSiteRequest, normalizeEmail } from "../../../auth-core";
import { consumeLoginCode } from "../../../../db/auth";
import { siteOrigin } from "../../../notify";
import { signInJson } from "../../../auth-session";

export const dynamic = "force-dynamic";

/** Sign in with the 6-digit code from the sign-in email, typed on the same screen. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request, [siteOrigin(request.url)])) {
    return NextResponse.json({ error: "Please sign in from the Driftline website." }, { status: 403 });
  }
  const email = normalizeEmail(body.email);
  const code = cleanCode(body.code);
  if (!email || !code) return NextResponse.json({ error: "Enter the 6-digit code from the email." }, { status: 400 });
  const used = await consumeLoginCode(email, code);
  if (!used) {
    return NextResponse.json({ error: "That code didn't work. Check the newest email, or send a new code." }, { status: 400 });
  }
  return signInJson(used.email, used.returnTo, request);
}
