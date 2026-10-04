import { redirect } from "next/navigation";

import { getUser } from "../auth";
import { getStaffUser } from "../staff-auth";

export const dynamic = "force-dynamic";

/**
 * A short address for the team to remember. It is not linked anywhere on the
 * public site. It sends each person to their own home: the owner to the owner
 * dashboard, a chef to the chef app, and anyone signed out to the sign-in page
 * (which brings them straight back here afterward).
 */
export default async function StaffEntry() {
  const staff = await getStaffUser();
  if (staff) redirect(staff.staff.role === "admin" ? "/portal" : "/chef");
  if (await getUser()) redirect("/account");
  redirect("/signin?return_to=%2Fstaff");
}
