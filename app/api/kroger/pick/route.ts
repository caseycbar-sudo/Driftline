import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";
import { savePick } from "../../../kroger";

export const dynamic = "force-dynamic";

/** Remember the product chosen for a shopping-list item, for every future visit. */
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { key?: string; product?: { upc?: string; description?: string; size?: string; image?: string } };
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const user = await requireStaffRole();
  if (!user) return NextResponse.json({ error: "Staff only" }, { status: 403 });
  const key = String(body.key ?? "").slice(0, 160);
  const upc = String(body.product?.upc ?? "");
  if (!key || !/^\d{8,14}$/.test(upc)) return NextResponse.json({ error: "Pick a product first." }, { status: 400 });
  const image = String(body.product?.image ?? "");
  await savePick(
    key,
    { upc, description: String(body.product?.description ?? "").slice(0, 160), size: String(body.product?.size ?? "").slice(0, 40), image: /^https:\/\/[\w.-]*kroger\.com\//.test(image) ? image : "" },
    user.email,
  );
  return NextResponse.json({ ok: true });
}
