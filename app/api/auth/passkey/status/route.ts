import { NextResponse } from "next/server";
import { isCrossSiteRequest } from "../../../../auth-core";
import { getUser } from "../../../../auth";
import { passkeysFor, removePasskeys } from "../../../../../db/auth";

export const dynamic = "force-dynamic";
const headers = { "cache-control": "private, no-store" };

/** How many devices have Face ID sign-in turned on for this account. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ signedIn: false, count: 0 }, { headers });
  const keys = await passkeysFor(user.email);
  return NextResponse.json({ signedIn: true, count: keys.length }, { headers });
}

/** Turn Face ID sign-in off on every device (email always still works). */
export async function DELETE(request: Request) {
  if (isCrossSiteRequest(request)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  await removePasskeys(user.email);
  return NextResponse.json({ ok: true }, { headers });
}
