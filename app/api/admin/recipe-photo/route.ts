import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { requireStaffRole } from "../../../staff-auth";
import { isCrossSiteRequest } from "../../../auth-core";

export const dynamic = "force-dynamic";
const MAX_FILE = 8 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Casey uploads his own photo of a dish; the editor saves the returned path on the recipe. */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await requireStaffRole("admin"))) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  const file = form?.get("photo");
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Choose a photo." }, { status: 400 });
  const extension = TYPES[file.type];
  if (!extension) return NextResponse.json({ error: "Photos must be JPEG, PNG or WebP." }, { status: 400 });
  if (file.size > MAX_FILE) return NextResponse.json({ error: "That photo is larger than 8 MB." }, { status: 400 });

  const bucket = (env as unknown as { BUCKET: R2Bucket }).BUCKET;
  if (!bucket) return NextResponse.json({ error: "Photo storage unavailable" }, { status: 503 });
  const name = `${crypto.randomUUID()}.${extension}`;
  await bucket.put(`cookbook/${name}`, file.stream(), { httpMetadata: { contentType: file.type } });
  return NextResponse.json({ image: `/api/dish-photo/${name}` });
}
