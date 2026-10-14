import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { SESSION_COOKIE, isCrossSiteRequest, readCookie, sha256Hex } from "../../../auth-core";
import { getUser } from "../../../auth";
import { FRESH_SESSION_MS, hashPassword, passwordProblem, verifyPassword } from "../../../password-core";
import { deleteOtherSessions, getPasswordRecord, removePasswordRecord, savePasswordRecord, sessionStart } from "../../../../db/passwords";
import { siteOrigin } from "../../../notify";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "private, no-store" };

/** Whether the signed-in person already has a password. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401, headers: NO_STORE });
  return NextResponse.json({ email: user.email, hasPassword: Boolean(await getPasswordRecord(user.email)) }, { headers: NO_STORE });
}

/**
 * Set, change or remove the signed-in person's password.
 * Changing an existing one needs the current password, unless the person
 * signed in with an emailed code in the last few minutes (the forgot-password path).
 */
export async function POST(request: Request) {
  if (isCrossSiteRequest(request, [siteOrigin(request.url)])) {
    return NextResponse.json({ error: "Please do this from the Driftline website." }, { status: 403, headers: NO_STORE });
  }
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401, headers: NO_STORE });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = body.action === "remove" ? "remove" : "set";
  const current = typeof body.current === "string" ? body.current : "";

  const existing = await getPasswordRecord(user.email);
  const sessionId = readCookie((await headers()).get("cookie"), SESSION_COOKIE) || "";
  const sessionHash = sessionId ? await sha256Hex(sessionId) : "";
  if (existing) {
    const start = sessionHash ? await sessionStart(sessionHash) : null;
    // Only a sign-in by emailed code or link counts, never a password or a stolen cookie that is merely new.
    const fresh = start !== null && (start.method === "code" || start.method === "link") && Date.now() - start.at < FRESH_SESSION_MS;
    const knowsCurrent = current ? await verifyPassword(current, existing) : false;
    if (!knowsCurrent && !fresh) {
      return NextResponse.json({ error: "Enter your current password. If you forgot it, sign out, sign in with an emailed code, then set a new one." }, { status: 403, headers: NO_STORE });
    }
  }

  if (action === "remove") {
    await removePasswordRecord(user.email);
    return NextResponse.json({ ok: true, hasPassword: false }, { headers: NO_STORE });
  }
  const problem = passwordProblem(body.password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400, headers: NO_STORE });
  await savePasswordRecord(user.email, await hashPassword(String(body.password)));
  if (sessionHash) await deleteOtherSessions(user.email, sessionHash).catch(() => undefined);
  return NextResponse.json({ ok: true, hasPassword: true }, { headers: NO_STORE });
}
