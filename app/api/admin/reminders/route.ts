import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { runDailyJobs } from "../../../jobs/daily";

export const dynamic = "force-dynamic";

/**
 * Owner only: send tomorrow's reminders now. Uses the same once-per-day claim as
 * the nightly job, so it can never double-send.
 */
export async function POST(request: Request) {
  await request.text().catch(() => "");
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  try {
    return NextResponse.json(await runDailyJobs());
  } catch (error) {
    console.error("[daily] manual run failed", error);
    return NextResponse.json({ error: "Reminders couldn't be sent. Try again shortly." }, { status: 500 });
  }
}
