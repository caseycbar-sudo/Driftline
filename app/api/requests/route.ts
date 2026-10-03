import { NextResponse } from "next/server";
import { getUser } from "../../auth";
import { isCrossSiteRequest } from "../../auth-core";
import { getOrCreateCustomer } from "../../../db/customers";
import { getPricing } from "../../../db/pricing";
import { getCookbook } from "../../../db/cookbook";
import { createRequest, getRequest, listForCustomer, patchRequest, type SessionRequest } from "../../../db/requests";
import { getEvent, patchEvent } from "../../../db/schedule";
import { unavailableBetween } from "../../../db/availability";
import { earliestDate, isOpenForCustomerChange, latestDate, parseRequestInput, planFor, profileGaps } from "../../request-core";
import { notifyCustomerCancelled, notifyRequestSubmitted } from "../../request-emails";
import { customerView } from "../../request-view";

export const dynamic = "force-dynamic";

const fail = (error: string, status = 400, field?: string) => NextResponse.json({ error, field }, { status });

export async function GET() {
  const user = await getUser();
  if (!user) return fail("Sign in required", 401);
  const requests = await listForCustomer(user.email);
  return NextResponse.json(await Promise.all(requests.map(customerView)), { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return fail("Forbidden", 403);
  const user = await getUser();
  if (!user) return fail("Sign in required", 401);
  const action = String(body.action || "create");
  const profile = await getOrCreateCustomer(user.email, user.displayName);
  const who = { name: profile.fullName || user.displayName, email: user.email, phone: profile.phone };

  if (action === "cancel") {
    const existing = await getRequest(Math.round(Number(body.id)));
    if (!existing || existing.customerEmail !== user.email.toLowerCase()) return fail("We couldn't find that request.", 404);
    if (!isOpenForCustomerChange(existing.status)) return fail("That request is already closed.", 409);
    const event = existing.scheduleEventId ? await getEvent(existing.scheduleEventId) : null;
    if (event && event.status !== "cancelled") {
      const cancelled = await patchEvent(event.id, { status: "cancelled" });
      // A chef who hasn't accepted yet still knows about the visit, so they hear about this too.
      if (cancelled) await notifyCustomerCancelled(cancelled, who);
    }
    await patchRequest(existing.id, { status: "cancelled" });
    return NextResponse.json({ ok: true });
  }

  if (action !== "create" && action !== "change") return fail("Unknown action.");

  // The profile has to be complete enough for a chef to show up: name, phone, address, city, allergies.
  const gaps = profileGaps(profile);
  if (gaps.length) return fail(`Before you send a request, add ${gaps.join(", ")} to your profile.`, 400, "profile");

  const pricing = await getPricing();
  const unavailable = await unavailableBetween(earliestDate(), latestDate(), Number(body.id) || 0).catch(() => []);
  const parsed = parseRequestInput({ ...body, city: body.city || profile.city }, pricing, Date.now(), unavailable);
  if (!parsed.ok) return fail(parsed.error, 400, parsed.field);
  const input = parsed.input;

  const cookbook = await getCookbook();
  const dishes: string[] = [];
  for (const id of input.recipeIds) {
    const recipe = cookbook.find((r) => r.id === id && r.side === "meal-prep");
    if (!recipe) return fail("One of those dishes isn't on the meal prep menu any more.", 400, "menu");
    dishes.push(recipe.title);
  }
  const plan = planFor(input.recipeIds.length, input.people, pricing)!;
  const data = {
    recipeIds: input.recipeIds,
    dishes,
    people: input.people,
    packageName: plan.package.name,
    priceCents: plan.package.priceCents,
    address: input.address || profile.streetAddress,
    city: input.city,
    windows: input.windows,
    accessNotes: input.accessNotes || profile.accessNotes,
    kitchenNotes: input.kitchenNotes || profile.kitchenNotes,
  };

  if (action === "create") {
    const created = await createRequest(user.email, data);
    await notifyRequestSubmitted(created, who);
    return NextResponse.json(await customerView(created), { status: 201 });
  }

  const existing = await getRequest(Math.round(Number(body.id)));
  if (!existing || existing.customerEmail !== user.email.toLowerCase()) return fail("We couldn't find that request.", 404);
  if (!isOpenForCustomerChange(existing.status)) return fail("That request is already closed.", 409);
  let status: SessionRequest["status"] = "requested";
  let scheduleEventId = 0;
  if (existing.status === "scheduled" || existing.status === "change_requested") {
    // A chef is already booked: keep the visit until the admin approves the new time.
    status = "change_requested";
    scheduleEventId = existing.scheduleEventId;
  } else if (existing.status === "awaiting_chef" && existing.scheduleEventId) {
    // A chef was picked but hasn't accepted. Release that block and start over.
    const event = await getEvent(existing.scheduleEventId);
    if (event && event.status !== "cancelled") {
      const released = await patchEvent(event.id, { status: "cancelled" });
      if (released) await notifyCustomerCancelled(released, who, true);
    }
  }
  const updated = await patchRequest(existing.id, { ...data, status, scheduleEventId, suggestedTimes: [], adminNote: "", remindedAt: "" });
  if (updated) await notifyRequestSubmitted(updated, who, true);
  return NextResponse.json(updated ? await customerView(updated) : { ok: true });
}
