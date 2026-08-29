import PortalClient from "../../portal/PortalClient";
import StaffAccessPending from "../../StaffAccessPending";
import { requireStaffPage } from "../../staff-auth";

export const dynamic = "force-dynamic";

export default async function ChefWorkspace() {
  // Chef only. An active admin is redirected to /portal by the guard; a
  // customer identity gets the access notice below.
  const access = await requireStaffPage("/chef/workspace", "chef");

  if (!access.authorized)
    return <StaffAccessPending email={access.user.email} workspace="chef" />;

  const { staff } = access;
  return (
    <PortalClient
      staff={{ email: staff.email, fullName: staff.fullName, role: "chef" }}
    />
  );
}
