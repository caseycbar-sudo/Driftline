import { NextResponse } from "next/server";
import { getUser } from "../../auth";
import { getActiveStaff } from "../../../db/staff";

export const dynamic = "force-dynamic";

/**
 * Who is signed in, for the site menu: just enough to show "My account",
 * "Owner dashboard" or "Chef workspace" instead of "Sign in". No email or
 * other details go back to the page.
 */
export async function GET() {
  const headers = { "cache-control": "private, no-store" };
  const user = await getUser();
  if (!user) return NextResponse.json({ signedIn: false, role: null, firstName: "" }, { headers });
  const staff = await getActiveStaff(user.email).catch(() => null);
  const firstName = user.fullName ? user.fullName.split(" ")[0] : "";
  return NextResponse.json({ signedIn: true, role: staff?.role ?? null, firstName }, { headers });
}
