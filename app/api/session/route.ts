import { NextResponse } from "next/server";
import { getUser } from "../../auth";
import { getActiveStaff } from "../../../db/staff";

export const dynamic = "force-dynamic";

/**
 * Who is signed in, for the site menu: just enough to show "My account",
 * "Owner dashboard" or "Chef workspace" instead of "Sign in", and to fill in
 * the person's own name and email on forms. Private, never cached.
 */
export async function GET() {
  const headers = { "cache-control": "private, no-store" };
  const user = await getUser();
  if (!user) return NextResponse.json({ signedIn: false, role: null, firstName: "", fullName: "", email: "" }, { headers });
  const staff = await getActiveStaff(user.email).catch(() => null);
  const firstName = user.fullName ? user.fullName.split(" ")[0] : "";
  return NextResponse.json({ signedIn: true, role: staff?.role ?? null, firstName, fullName: user.fullName ?? "", email: user.email }, { headers });
}
