import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** A short address for the team to remember. It is not linked anywhere on the public site. */
export default function StaffEntry() {
  redirect("/chef");
}
