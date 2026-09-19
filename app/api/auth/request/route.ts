import { NextResponse } from "next/server";
import { isCrossSiteRequest, rateLimitKeyForIp, SIGN_IN_PATH, LINKS_PER_EMAIL_PER_HOUR, LINKS_PER_SOURCE_PER_HOUR, VERIFY_PATH, normalizeEmail, safeRelativeReturnPath, sha256Hex } from "../../../auth-core";
import { createLoginToken, pruneExpired, recentLinkCounts } from "../../../../db/auth";
import { sendSignInLink, siteOrigin } from "../../../notify";

export const dynamic = "force-dynamic";

async function sourceHash(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") || "";
  return ip ? (await sha256Hex(`driftline-auth:${rateLimitKeyForIp(ip)}`)).slice(0, 24) : "";
}

/**
 * Email a one-time sign-in link. Always answers the same way whether or not the
 * email belongs to anyone, so the form can't be used to discover who has an account.
 */
export async function POST(request: Request) {
  if (isCrossSiteRequest(request, [siteOrigin(request.url)])) {
    return NextResponse.json({ error: "Please sign in from the Driftline website." }, { status: 403 });
  }
  // The sign-in form posts JSON once its script has loaded. If someone taps the
  // button before that (slow phone connection), the browser posts a plain form
  // instead; answer that with a redirect back to the sign-in page.
  const isForm = /application\/x-www-form-urlencoded|multipart\/form-data/i.test(request.headers.get("content-type") || "");
  let body: Record<string, unknown> = {};
  try {
    body = isForm
      ? Object.fromEntries(Array.from((await request.formData()).entries()).map(([k, v]) => [k, String(v)]))
      : ((await request.json()) as Record<string, unknown>);
  } catch {}
  const returnTo = safeRelativeReturnPath(body.returnTo);
  const reply = (status: number, error?: string) => {
    if (!isForm) return NextResponse.json(error ? { error } : { ok: true }, { status });
    const to = new URL(SIGN_IN_PATH, request.url);
    to.searchParams.set("return_to", returnTo);
    to.searchParams.set(error ? "error" : "sent", error ? String(status) : "1");
    return NextResponse.redirect(to, 303);
  };

  const email = normalizeEmail(body.email);
  if (!email) return reply(400, "Please enter a valid email address.");

  const source = await sourceHash(request);
  const counts = await recentLinkCounts(email, source);
  if (counts.byEmail >= LINKS_PER_EMAIL_PER_HOUR || counts.bySource >= LINKS_PER_SOURCE_PER_HOUR) {
    return reply(429, "Too many sign-in links requested. Please check your inbox, or try again in an hour.");
  }

  const token = await createLoginToken(email, returnTo, source);
  const link = `${siteOrigin(request.url)}${VERIFY_PATH}?token=${encodeURIComponent(token)}`;
  const sent = await sendSignInLink(email, link);
  if (!sent) {
    return reply(503, "We couldn't send the email just now. Please try again in a few minutes.");
  }
  await pruneExpired().catch(() => {});
  return reply(200);
}
