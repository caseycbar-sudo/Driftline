import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getUser } from "../../auth";
import { requireStaffRole } from "../../staff-auth";
import { getEvent } from "../../../db/schedule";

export const dynamic = "force-dynamic";

/** The grocery receipt photo for a visit: the customer it was billed to, or the owner. */
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("visit"));
  const event = Number.isInteger(id) && id > 0 ? await getEvent(id) : null;
  if (!event?.receiptKey) return NextResponse.json({ error: "No receipt for this visit" }, { status: 404 });
  const owns = event.customerEmail.toLowerCase() === user.email.toLowerCase();
  if (!owns && !(await requireStaffRole("admin"))) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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
