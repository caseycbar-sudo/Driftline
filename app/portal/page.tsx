import PortalClient from "./PortalClient";
import StaffAccessPending from "../StaffAccessPending";
import { requireStaffPage } from "../staff-auth";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  // Admin only. A chef with an active record is redirected to /chef/workspace
  // by the guard; a customer identity gets the access notice below.
  const access = await requireStaffPage("/portal", "admin");

  if (!access.authorized)
    return <StaffAccessPending email={access.user.email} workspace="admin" />;

  const { staff } = access;
  return (
    <PortalClient
      staff={{ email: staff.email, fullName: staff.fullName, role: staff.role }}
    />
  );
}
