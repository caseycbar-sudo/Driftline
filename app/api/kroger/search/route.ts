import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { krogerConfig, searchProducts } from "../../../kroger";

export const dynamic = "force-dynamic";

/** Search Fred Meyer Warrenton, for swapping a shopping-list item to a different product. */
export async function GET(request: Request) {
  if (!(await requireStaffRole())) return NextResponse.json({ error: "Staff only" }, { status: 403 });
  if (!krogerConfig()) return NextResponse.json({ error: "Fred Meyer isn't connected yet." }, { status: 409 });
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ products: [] });
  try {
    return NextResponse.json({ products: await searchProducts(q, 8) }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Fred Meyer didn't answer. Try again in a moment." }, { status: 502 });
  }
}
