import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { oregonToday } from "../../../oregon-time";
import { parseBlockedDate } from "../../../request-core";
import { addBlocked, listBlocked, removeBlocked } from "../../../../db/availability";

export const dynamic = "force-dynamic";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function GET() {
  if (!(await requireStaffRole("admin"))) return fail("Admin access required", 403);
  return NextResponse.json({ blocked: await listBlocked(oregonToday()) });
}

export async function POST(request: Request) {
  if (isCrossSiteRequest(request)) return fail("Cross-site request refused", 403);
  const staff = await requireStaffRole("admin");
  if (!staff) return fail("Admin access required", 403);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.action === "remove") {
    const date = String(body.date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Pick a day to unblock.");
    await removeBlocked(date);
  } else {
    const parsed = parseBlockedDate(body, oregonToday());
    if (!parsed.ok) return fail(parsed.error);
    await addBlocked(parsed.date, parsed.note, staff.staff.email);
  }
  return NextResponse.json({ blocked: await listBlocked(oregonToday()) });
}
