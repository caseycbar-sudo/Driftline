import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { getCustomer } from "../../../../db/customers";
import { getRequest, listInbox, patchRequest, type SessionRequest } from "../../../../db/requests";
import { VISIT_DEFAULTS, createEvent, getEvent, linkRequest, listAwaitingChef, listChefDay, patchEvent, setChefResponse } from "../../../../db/schedule";
import { listStaff } from "../../../../db/staff";
import { findChefConflicts, isRealDate, type VisitInput } from "../../../schedule-core";
import { parseApproval, startTimesIn, type TimeWindow } from "../../../request-core";
import { notifyCancelledByDriftline, notifyChefAssigned, notifyChefReleased, notifyDeclined, notifyNeedsNewTime } from "../../../request-emails";
import { notifyVisitChange } from "../../../visit-emails";
import { releaseHoldForVisit } from "../../../billing";

export const dynamic = "force-dynamic";

const fail = (error: string, status = 400, extra: Record<string, unknown> = {}) => NextResponse.json({ error, ...extra }, { status });
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

async function whoIs(r: SessionRequest) {
  const c = await getCustomer(r.customerEmail);
  return { name: c?.fullName || r.customerEmail, email: r.customerEmail, phone: c?.phone ?? "", profile: c };
}

/** Active chefs, each marked busy when they already have an overlapping visit in that block. */
async function chefsFor(date: string, start: string, end: string, ignoreEventId = 0) {
  const chefs = (await listStaff()).filter((s) => s.role === "chef" && s.status === "active");
  return Promise.all(
    chefs.map(async (c) => {
      const day = await listChefDay(c.email, date);
      const clash = findChefConflicts({ id: ignoreEventId, serviceDate: date, startTime: start, endTime: end, chefEmail: c.email, status: "scheduled", household: "" }, day);
      return { email: c.email, fullName: c.fullName, busy: clash.length > 0, clashWith: clash.map((x) => `${x.household} ${x.startTime}`) };
    }),
  );
}

export async function GET(request: Request) {
  if (!(await requireStaffRole("admin"))) return fail("Admin access required", 403);
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  if (date) {
    const start = url.searchParams.get("start") ?? "",
      end = url.searchParams.get("end") ?? "";
    if (!isRealDate(date) || !TIME.test(start) || !TIME.test(end)) return fail("Pick a day and time.");
    return NextResponse.json({ chefs: await chefsFor(date, start, end, Number(url.searchParams.get("ignore")) || 0) });
  }
  const inbox = await listInbox();
  const cards = await Promise.all(
    inbox.map(async (r) => {
      const who = await whoIs(r);
      const visit = r.scheduleEventId ? await getEvent(r.scheduleEventId) : null;
      return {
        ...r,
        customer: {
          name: who.name,
          email: who.email,
          phone: who.phone,
          city: who.profile?.city ?? "",
          householdSize: who.profile?.householdSize ?? 0,
          dietaryNeeds: who.profile?.dietaryNeeds ?? "",
          foodsToAvoid: who.profile?.foodsToAvoid ?? "",
          noAllergies: who.profile?.noAllergies ?? false,
        },
        currentVisit: visit && visit.status !== "cancelled" ? { id: visit.id, serviceDate: visit.serviceDate, startTime: visit.startTime, endTime: visit.endTime, chef: visit.chef, chefEmail: visit.chefEmail } : null,
        blocks: r.windows.map((w: TimeWindow) => ({ ...w, starts: startTimesIn(w) })),
      };
    }),
  );
  const awaiting = (await listAwaitingChef()).map((v) => ({ id: v.id, serviceDate: v.serviceDate, startTime: v.startTime, endTime: v.endTime, household: v.household, chef: v.chef, chefEmail: v.chefEmail, chefResponse: v.chefResponse, requestId: v.requestId }));
  return NextResponse.json({ requests: cards, awaitingChef: awaiting }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return fail("Forbidden", 403);
  const admin = await requireStaffRole("admin");
  if (!admin) return fail("Admin access required", 403);
  const action = String(body.action || "");

  // Put a declined or unanswered visit with a different chef.
  if (action === "reassign") {
    const v = await getEvent(Math.round(Number(body.eventId)));
    const chefEmail = String(body.chefEmail || "").trim().toLowerCase();
    const chef = (await listStaff()).find((s) => s.email === chefEmail && s.role === "chef" && s.status === "active");
    if (!v || !v.requestId || !chef) return fail("Choose a chef and a visit from a customer request.");
    const clash = findChefConflicts({ ...v, chefEmail: chef.email }, await listChefDay(chef.email, v.serviceDate));
    if (clash.length && body.force !== true) return fail(`${chef.fullName} is already booked with ${clash.map((c) => c.household).join(", ")} then.`, 409, { conflict: true });
    const before = v.chefEmail ? v : null;
    const after = await patchEvent(v.id, { chef: chef.fullName, chefEmail: chef.email });
    if (after) {
      await setChefResponse(v.id, "pending");
      if (before && before.chefEmail !== chef.email) await notifyChefReleased(before);
      await notifyChefAssigned(after, true);
    }
    return NextResponse.json({ ok: true });
  }

  const r = await getRequest(Math.round(Number(body.id)));
  if (!r) return fail("We couldn't find that request.", 404);
  const who = await whoIs(r);

  // Driftline cancels a session, with its visit if one is booked. Customers ask by message.
  if (action === "cancel") {
    if (r.status === "cancelled") return fail("That session is already canceled.", 409);
    const visit = r.scheduleEventId ? await getEvent(r.scheduleEventId) : null;
    const live = visit && visit.status !== "cancelled" ? await patchEvent(visit.id, { status: "cancelled" }) : null;
    if (visit) await releaseHoldForVisit(visit.id, "Visit cancelled.").catch(() => undefined);
    await patchRequest(r.id, { status: "cancelled" });
    await notifyCancelledByDriftline(r, who, live);
    return NextResponse.json({ ok: true });
  }

  if (!["requested", "change_requested"].includes(r.status)) return fail("Someone already handled this request.", 409);
  const note = String(body.note || "").trim().slice(0, 600);

  if (action === "suggest") {
    const times = (Array.isArray(body.times) ? (body.times as Record<string, unknown>[]) : [])
      .map((t) => ({ date: String(t.date || ""), from: String(t.from || ""), to: String(t.to || "") }))
      .filter((t) => isRealDate(t.date) && TIME.test(t.from) && TIME.test(t.to) && t.to > t.from)
      .slice(0, 5);
    if (!note && !times.length) return fail("Add a note or at least one time for the customer.");
    const updated = await patchRequest(r.id, { status: "needs_new_time", suggestedTimes: times, adminNote: note });
    if (updated) await notifyNeedsNewTime(updated, who);
    return NextResponse.json({ ok: true });
  }

  if (action === "decline") {
    if (!note) return fail("Tell the customer why, even briefly.");
    // A change request that can't happen leaves the booked visit as it was.
    const keep = r.status === "change_requested" && r.scheduleEventId > 0;
    const updated = await patchRequest(r.id, { status: keep ? "scheduled" : "declined", adminNote: note });
    if (updated) await notifyDeclined(updated, who, keep);
    return NextResponse.json({ ok: true });
  }

  if (action !== "approve") return fail("Unknown action.");
  const parsed = parseApproval(body);
  if (!parsed.ok) return fail(parsed.error);
  const chef = (await listStaff()).find((s) => s.email === parsed.chefEmail && s.role === "chef" && s.status === "active");
  if (!chef) return fail("That chef isn't available to schedule.");
  const existing = r.scheduleEventId ? await getEvent(r.scheduleEventId) : null;
  const live = existing && existing.status !== "cancelled" ? existing : null;
  const clash = findChefConflicts(
    { id: live?.id ?? 0, serviceDate: parsed.date, startTime: parsed.startTime, endTime: parsed.endTime, chefEmail: chef.email, status: "scheduled", household: "" },
    await listChefDay(chef.email, parsed.date),
  );
  if (clash.length && body.force !== true) return fail(`${chef.fullName} is already booked with ${clash.map((c) => c.household).join(", ")} then. Pick another chef or time.`, 409, { conflict: true });

  const kitchen = r.kitchenNotes ? `Kitchen notes from the customer: ${r.kitchenNotes}` : "";
  const fields: Partial<VisitInput> = {
    serviceDate: parsed.date,
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    household: who.name,
    customerEmail: r.customerEmail,
    dishes: r.dishes,
    chef: chef.fullName,
    chefEmail: chef.email,
    packageName: r.packageName,
    location: r.city,
    status: "scheduled",
    serviceType: "meal_prep",
    contactName: who.name,
    contactPhone: who.phone,
    address: r.address,
    accessNotes: r.accessNotes,
    notes: kitchen,
    priceCents: r.priceCents,
  };

  if (live) {
    // An approved change. The same chef keeps it; a different chef has to accept.
    const sameChef = live.chefEmail.toLowerCase() === chef.email;
    const after = await patchEvent(live.id, fields);
    await patchRequest(r.id, { status: sameChef ? "scheduled" : "awaiting_chef", adminNote: note, suggestedTimes: [] });
    if (after) {
      if (sameChef) {
        await notifyVisitChange(after, live);
      } else {
        await setChefResponse(live.id, "pending");
        await notifyChefReleased(live);
        await notifyChefAssigned(after, true);
      }
    }
    return NextResponse.json({ ok: true });
  }

  // A new visit. The chef hears first; the customer hears once the chef accepts.
  const created = await createEvent(admin.email, { ...VISIT_DEFAULTS, ...fields } as VisitInput);
  await linkRequest(created.id, r.id, "pending");
  await patchRequest(r.id, { status: "awaiting_chef", scheduleEventId: created.id, adminNote: note, suggestedTimes: [] });
  await notifyChefAssigned(created);
  return NextResponse.json({ ok: true, visitId: created.id });
}
