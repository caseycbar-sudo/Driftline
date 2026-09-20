import { NextResponse } from "next/server";
import { effectiveMarketStatus, parseMarketUpdate } from "../../market-core";
import { getSavedMarketStatus, saveMarketStatus } from "../../../db/market";
import { requireStaffRole } from "../../staff-auth";
import { isCrossSiteRequest } from "../../auth-core";

export const dynamic = "force-dynamic";

/** Public: what the site should say about the Sunday Market right now. */
export async function GET() {
  const status = effectiveMarketStatus(await getSavedMarketStatus().catch(() => null));
  return NextResponse.json(status, { headers: { "cache-control": "public, max-age=30" } });
}

/** Owner only: set today's market status from the dashboard. */
export async function POST(request: Request) {
  const input = await request.json().catch(() => null);
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const owner = await requireStaffRole("admin");
  if (!owner) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const parsed = parseMarketUpdate(input);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  await saveMarketStatus(parsed.status, parsed.note, owner.email);
  return NextResponse.json(effectiveMarketStatus(await getSavedMarketStatus()));
}
