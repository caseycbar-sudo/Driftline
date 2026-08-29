/**
 * Pure authorization decision for staff-only pages.
 *
 * Kept free of framework and environment imports so it can be unit-tested
 * directly, and so the rule itself is readable in one place rather than
 * reimplemented per page.
 *
 * The rule: a customer identity alone never grants staff access. Reaching a
 * staff page requires an *active* row in `staff_profiles` whose role matches
 * what the page requires. Anything else is either a redirect to the workspace
 * that identity does own, or a denial.
 */

import type { StaffProfile, StaffRole } from "../db/staff";

export const ADMIN_HOME = "/portal";
export const CHEF_HOME = "/chef/workspace";

export type StaffAccessDecision =
  | { outcome: "allow"; staff: StaffProfile }
  | { outcome: "redirect"; to: string }
  | { outcome: "deny" };

/** Where an active staff member of this role belongs. */
export function homeForRole(role: StaffRole): string {
  return role === "admin" ? ADMIN_HOME : CHEF_HOME;
}

/**
 * Decide whether `staff` may open a page requiring `requiredRole`.
 *
 * `staff` is the row for the signed-in identity, or `null` when that identity
 * has no staff record. Callers are responsible for having already established
 * that someone is signed in.
 */
export function decideStaffAccess(
  staff: StaffProfile | null | undefined,
  requiredRole: StaffRole,
): StaffAccessDecision {
  // No staff record at all, or a record that is invited/suspended rather than
  // active. Both are denials: a pending or revoked account is not a staff
  // account.
  if (!staff || staff.status !== "active") return { outcome: "deny" };

  if (staff.role === requiredRole) return { outcome: "allow", staff };

  // Active staff, wrong workspace. Send them to the one they do own rather
  // than showing a denial that would read as a bug to a legitimate user.
  return { outcome: "redirect", to: homeForRole(staff.role) };
}
