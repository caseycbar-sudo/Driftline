import { redirect } from "next/navigation";

import { getChatGPTUser, requireChatGPTUser } from "./chatgpt-auth";
import { decideStaffAccess } from "./staff-access";
import { resolveStaff, type StaffProfile, type StaffRole } from "../db/staff";

/** The signed-in identity together with its active staff row, or null. */
export async function getStaffUser() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const staff = await resolveStaff(user.email, user.displayName);
  return staff ? { ...user, staff } : null;
}

/**
 * Guard for API routes. Returns null rather than redirecting, so callers can
 * answer with 401/403 JSON.
 */
export async function requireStaffRole(role?: StaffRole) {
  const user = await getStaffUser();
  if (!user) return null;
  if (role && user.staff.role !== role) return null;
  return user;
}

export type StaffPageAccess =
  | { authorized: true; user: Awaited<ReturnType<typeof requireChatGPTUser>>; staff: StaffProfile }
  | { authorized: false; user: Awaited<ReturnType<typeof requireChatGPTUser>> };

/**
 * Guard for staff-only pages.
 *
 * Signed-out visitors are sent through sign-in. Active staff in the wrong
 * workspace are redirected to the one they own. Everyone else -- including
 * every signed-in customer, and any invited or suspended staff account --
 * comes back unauthorized so the page can render the access-pending notice.
 *
 * Both redirect paths throw, so a caller that forgets to check `authorized`
 * still cannot render staff content to a customer.
 */
export async function requireStaffPage(
  returnTo: string,
  role: StaffRole,
): Promise<StaffPageAccess> {
  const user = await requireChatGPTUser(returnTo);
  const staff = await resolveStaff(user.email, user.displayName);
  const decision = decideStaffAccess(staff, role);

  if (decision.outcome === "redirect") redirect(decision.to);
  if (decision.outcome === "deny") return { authorized: false, user };

  return { authorized: true, user, staff: decision.staff };
}
