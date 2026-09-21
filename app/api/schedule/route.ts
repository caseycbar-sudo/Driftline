import { NextResponse } from "next/server";
import { requireStaffRole } from "../../staff-auth";
import { isCrossSiteRequest } from "../../auth-core";
import { findChefConflicts, isRealDate, parseVisit, weeklyDates, type VisitInput } from "../../schedule-core";
import { VISIT_DEFAULTS, createEvent, deleteEvent, getEvent, listChefDay, listEvents, patchEvent } from "../../../db/schedule";
import { markInquiryBooked } from "../../../db/private-chef";
import { notifyVisitChange } from "../../visit-emails";

export const dynamic = "force-dynamic";

const forbidden = () => NextResponse.json({ error: "Owner access required" }, { status: 403 });

/** Other visits this chef already has that overlap in time. */
async function conflictsFor(visit: VisitInput & { id?: number }) {
  if (!visit.chefEmail) return [];
  const day = await listChefDay(visit.chefEmail, visit.serviceDate);
  return findChefConflicts({ id: visit.id ?? 0, ...visit }, day).map((c) => ({
    id: c.id,
    household: c.household,
    startTime: c.startTime,
    endTime: c.endTime,
  }));
}

export async function GET(request: Request) {
  if (!(await requireStaffRole("admin"))) return forbidden();
  const url = new URL(request.url);
  const start = url.searchParams.get("start") ?? "",
    end = url.searchParams.get("end") ?? "";
  if (!isRealDate(start) || !isRealDate(end)) return NextResponse.json({ error: "Pick a date range." }, { status: 400 });
  return NextResponse.json(await listEvents(start, end), { headers: { "cache-control": "private, no-store" } });
}

/** Create a visit, or a weekly series when `repeatWeeks` > 1. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return forbidden();
  const owner = await requireStaffRole("admin");
  if (!owner) return forbidden();
  const parsed = parseVisit(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const visit = { ...VISIT_DEFAULTS, ...parsed.visit } as VisitInput;

  const dates = weeklyDates(visit.serviceDate, Number(body.repeatWeeks) || 1);
  const seriesId = dates.length > 1 ? crypto.randomUUID() : "";
  const created = [];
  const conflicts: Record<string, Awaited<ReturnType<typeof conflictsFor>>> = {};
  for (const date of dates) {
    const one = { ...visit, serviceDate: date };
    const clash = await conflictsFor(one);
    if (clash.length) conflicts[date] = clash;
    created.push(await createEvent(owner.email, one, seriesId));
  }
  if (visit.inquiryId) await markInquiryBooked(visit.inquiryId).catch(() => {});
  if (body.notify !== false) await notifyVisitChange(created[0], null, created.length).catch(() => {});
  return NextResponse.json({ visits: created, conflicts }, { status: 201 });
}

/** Update only the fields sent. */
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (isCrossSiteRequest(request)) return forbidden();
  if (!(await requireStaffRole("admin"))) return forbidden();
  const id = Number(body.id);
  const before = Number.isInteger(id) && id > 0 ? await getEvent(id) : null;
  if (!before) return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  const { id: _id, notify, ...fields } = body;
  const parsed = parseVisit(fields, { partial: true });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const merged = { ...before, ...parsed.visit };
  if (merged.endTime && merged.endTime <= merged.startTime) {
    return NextResponse.json({ error: "The end time has to be after the start time." }, { status: 400 });
  }
  if (before.status === "completed" && parsed.visit.status && parsed.visit.status !== "completed") {
    return NextResponse.json({ error: "This visit is already completed." }, { status: 409 });
  }
  const after = await patchEvent(id, parsed.visit);
  const conflicts = await conflictsFor(merged);
  if (notify !== false && after) await notifyVisitChange(after, before).catch(() => {});
  return NextResponse.json({ visit: after, conflicts });
}

/** Legacy full-save from older screens: treated as a PATCH of every field sent. */
export const PUT = PATCH;

export async function DELETE(request: Request) {
  if (isCrossSiteRequest(request)) return forbidden();
  if (!(await requireStaffRole("admin"))) return forbidden();
  const id = Number(new URL(request.url).searchParams.get("id"));
  const result = Number.isInteger(id) && id > 0 ? await deleteEvent(id) : "missing";
  if (result === "missing") return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  if (result === "has-history") {
    return NextResponse.json(
      { error: "This visit has time, photos or payments recorded, so it can't be deleted. Set it to Cancelled instead." },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}
