import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { getCustomer } from "../../../../db/customers";
import { getRequest } from "../../../../db/requests";
import { addMessage, countMessages, listConversations, listMessages, markRead, recentSent } from "../../../../db/messages";
import { MAX_PER_THREAD, parseMessage, tooManyRecently } from "../../../message-core";
import { notifyCustomerOfMessage } from "../../../request-emails";

export const dynamic = "force-dynamic";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function whoIs(email: string) {
  const c = await getCustomer(email);
  return { name: c?.fullName || email, email, phone: c?.phone ?? "" };
}

/** No id: the list of conversations. With an id: that thread (and it's marked read). */
export async function GET(request: Request) {
  if (!(await requireStaffRole("admin"))) return fail("Admin access required", 403);
  const id = Math.round(Number(new URL(request.url).searchParams.get("id")));
  const headers = { "cache-control": "private, no-store" };
  if (id) {
    const r = await getRequest(id);
    if (!r) return fail("We couldn't find that request.", 404);
    await markRead(r.id, "owner");
    return NextResponse.json({ messages: await listMessages(r.id) }, { headers });
  }
  const conversations = await Promise.all(
    (await listConversations()).map(async (c) => {
      const r = await getRequest(c.requestId);
      if (!r) return null;
      const who = await whoIs(r.customerEmail);
      return { requestId: r.id, customer: who.name, email: who.email, status: r.status, dishes: r.dishes, last: c.last, unread: c.unread };
    }),
  );
  return NextResponse.json({ conversations: conversations.filter(Boolean) }, { headers });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return fail("Forbidden", 403);
  if (!(await requireStaffRole("admin"))) return fail("Admin access required", 403);
  const r = await getRequest(Math.round(Number(body.id)));
  if (!r) return fail("We couldn't find that request.", 404);
  const parsed = parseMessage(body.body);
  if (!parsed.ok) return fail(parsed.error);
  if ((await countMessages(r.id)) >= MAX_PER_THREAD) return fail("This conversation is full.", 409);
  if (tooManyRecently(await recentSent(r.id, "owner", new Date(Date.now() - 3600_000).toISOString()), Date.now())) return fail("Slow down a little: too many messages in the last hour.", 429);
  const message = await addMessage(r.id, "owner", parsed.body);
  await notifyCustomerOfMessage(r, await whoIs(r.customerEmail), parsed.body);
  return NextResponse.json({ message }, { status: 201 });
}
