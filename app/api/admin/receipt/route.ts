import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireStaffRole } from "../../../staff-auth";
import { getEvent } from "../../../../db/schedule";

export const dynamic = "force-dynamic";

/** Owner only: the grocery receipt photo a chef uploaded for a visit. */
export async function GET(request: Request) {
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const id = Number(new URL(request.url).searchParams.get("visit"));
  const event = Number.isInteger(id) && id > 0 ? await getEvent(id) : null;
  if (!event?.receiptKey) return NextResponse.json({ error: "No receipt for this visit" }, { status: 404 });
  const object = await (env as unknown as { BUCKET: R2Bucket }).BUCKET.get(event.receiptKey);
  if (!object) return NextResponse.json({ error: "Receipt photo missing" }, { status: 404 });
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || "image/jpeg",
      "cache-control": "private, max-age=300",
      "x-content-type-options": "nosniff",
    },
  });
}
