import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { listPantry, removePantryItems } from "../../../../db/pantry";

export const dynamic = "force-dynamic";
const headers = { "cache-control": "private, no-store" };

/** What a household already has on the shelf, for building their next shopping list. */
export async function GET(request: Request) {
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const email = (new URL(request.url).searchParams.get("email") || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ items: [] }, { headers });
  return NextResponse.json({ items: await listPantry(email) }, { headers });
}

/** Take items off a household's shelf (used up, or thrown out). */
export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; keys?: string[] };
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  await removePantryItems(String(body.email ?? ""), (Array.isArray(body.keys) ? body.keys : []).map(String));
  return NextResponse.json({ ok: true }, { headers });
}
