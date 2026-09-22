import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { addToCart, krogerConfig } from "../../../kroger";

export const dynamic = "force-dynamic";

/** Put the checked items in the staff member's Fred Meyer cart, for pickup. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { items?: { upc?: string; quantity?: number }[] };
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const user = await requireStaffRole();
  if (!user) return NextResponse.json({ error: "Staff only" }, { status: 403 });
  if (!krogerConfig()) return NextResponse.json({ error: "Fred Meyer isn't connected yet." }, { status: 409 });
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((i) => ({ upc: String(i.upc ?? ""), quantity: Math.round(Number(i.quantity)) }))
    .filter((i) => /^\d{8,14}$/.test(i.upc) && i.quantity >= 1 && i.quantity <= 50)
    .slice(0, 80);
  if (!items.length) return NextResponse.json({ error: "Nothing to add." }, { status: 400 });
  try {
    const result = await addToCart(user.email, items);
    if (!result.ok) return NextResponse.json({ error: "Please link your Fred Meyer account again.", relink: true }, { status: 409 });
    return NextResponse.json({ ok: true, added: items.length });
  } catch (error) {
    console.error("[kroger] cart failed", error);
    return NextResponse.json({ error: "Fred Meyer didn't take the order. Try again in a minute." }, { status: 502 });
  }
}
