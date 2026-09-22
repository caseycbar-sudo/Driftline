import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { isLinked, krogerConfig, unlink } from "../../../kroger";

export const dynamic = "force-dynamic";
const headers = { "cache-control": "private, no-store" };

/** Is Fred Meyer switched on for the site, and has this staff member linked their account? */
export async function GET() {
  const user = await requireStaffRole();
  if (!user) return NextResponse.json({ error: "Staff only" }, { status: 403 });
  const configured = Boolean(krogerConfig());
  return NextResponse.json({ configured, linked: configured ? await isLinked(user.email) : false }, { headers });
}

export async function DELETE(request: Request) {
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const user = await requireStaffRole();
  if (!user) return NextResponse.json({ error: "Staff only" }, { status: 403 });
  await unlink(user.email);
  return NextResponse.json({ ok: true }, { headers });
}
