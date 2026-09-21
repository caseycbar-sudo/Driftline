import { NextResponse } from "next/server";
import { parsePricing } from "../../pricing-core";
import { getPricing, savePricing } from "../../../db/pricing";
import { requireStaffRole } from "../../staff-auth";
import { isCrossSiteRequest } from "../../auth-core";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getPricing(), { headers: { "cache-control": "public, max-age=60" } });
}

/** Owner only: update prices. The public pages pick them up right away. */
export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const owner = await requireStaffRole("admin");
  if (!owner) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const parsed = parsePricing(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  await savePricing(parsed.pricing, owner.email);
  return NextResponse.json(parsed.pricing);
}
