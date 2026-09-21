import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

/** Serves a dish photo Casey uploaded. Public, like the built-in cookbook pictures. */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const name = (await params).name;
  if (!/^[\w-]+\.(webp|jpg|jpeg|png)$/i.test(name)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const object = await (env as unknown as { BUCKET: R2Bucket }).BUCKET.get(`cookbook/${name}`);
  if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || "image/jpeg",
      // The filename changes whenever the photo does, so this can be cached hard.
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
