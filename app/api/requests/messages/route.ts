import { NextResponse } from "next/server";
import { getUser } from "../../../auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { getOrCreateCustomer } from "../../../../db/customers";
import { getRequest } from "../../../../db/requests";
import { addMessage, countMessages, listMessages, markRead, recentSent } from "../../../../db/messages";
import { MAX_PER_THREAD, parseMessage, tooManyRecently } from "../../../message-core";
import { notifyOwnerOfMessage } from "../../../request-emails";

export const dynamic = "force-dynamic";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** The customer's own request, or null. */
async function mine(id: number, email: string) {
  const r = await getRequest(Math.round(id));
  return r && r.customerEmail === email.toLowerCase() && r.status !== "cancelled" ? r : null;
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return fail("Sign in required", 401);
  const r = await mine(Number(new URL(request.url).searchParams.get("id")), user.email);
  if (!r) return fail("We couldn't find that request.", 404);
  await markRead(r.id, "customer");
  return NextResponse.json({ messages: await listMessages(r.id) }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return fail("Forbidden", 403);
  const user = await getUser();
  if (!user) return fail("Sign in required", 401);
  const r = await mine(Number(body.id), user.email);
  if (!r) return fail("We couldn't find that request.", 404);
  const parsed = parseMessage(body.body);
  if (!parsed.ok) return fail(parsed.error);
  if ((await countMessages(r.id)) >= MAX_PER_THREAD) return fail("This conversation is full. Please call or text Driftline.", 409);
  if (tooManyRecently(await recentSent(r.id, "customer", new Date(Date.now() - 3600_000).toISOString()), Date.now())) return fail("That's a lot of messages in a short time. Give us a little while to answer.", 429);
  const profile = await getOrCreateCustomer(user.email, user.displayName);
  const message = await addMessage(r.id, "customer", parsed.body);
  await notifyOwnerOfMessage(r, { name: profile.fullName || user.displayName, email: user.email, phone: profile.phone }, parsed.body);
  return NextResponse.json({ message }, { status: 201 });
}
