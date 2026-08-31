import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_HOME,
  CHEF_HOME,
  canViewVisitPhoto,
  decideStaffAccess,
  homeForRole,
} from "../app/staff-access.ts";
import { startBuiltWorker } from "./worker-harness.mjs";

function staffRow(overrides) {
  return {
    email: "person@example.com",
    fullName: "Person",
    role: "chef",
    status: "active",
    phone: "",
    jobTitle: "Chef",
    hireDate: "",
    emergencyContact: "",
    foodHandlerExpires: "",
    foodManagerExpires: "",
    adminNotes: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

test("a customer identity with no staff record is denied", () => {
  assert.deepEqual(decideStaffAccess(null, "admin"), { outcome: "deny" });
  assert.deepEqual(decideStaffAccess(undefined, "admin"), { outcome: "deny" });
  assert.deepEqual(decideStaffAccess(null, "chef"), { outcome: "deny" });
});

test("an invited or suspended staff record is denied, for either role", () => {
  for (const status of ["invited", "suspended"]) {
    for (const role of ["admin", "chef"]) {
      assert.deepEqual(
        decideStaffAccess(staffRow({ role, status }), role),
        { outcome: "deny" },
        `${status} ${role} should be denied`,
      );
    }
  }
});

test("an active staff member is allowed into the workspace for their role", () => {
  const admin = staffRow({ role: "admin" });
  const chef = staffRow({ role: "chef" });

  assert.deepEqual(decideStaffAccess(admin, "admin"), { outcome: "allow", staff: admin });
  assert.deepEqual(decideStaffAccess(chef, "chef"), { outcome: "allow", staff: chef });
});

test("an active staff member in the wrong workspace is redirected, not admitted", () => {
  assert.deepEqual(decideStaffAccess(staffRow({ role: "chef" }), "admin"), {
    outcome: "redirect",
    to: CHEF_HOME,
  });
  assert.deepEqual(decideStaffAccess(staffRow({ role: "admin" }), "chef"), {
    outcome: "redirect",
    to: ADMIN_HOME,
  });
});

test("no input produces an allow without an active matching role", () => {
  const combinations = [];
  for (const role of ["admin", "chef"]) {
    for (const status of ["active", "invited", "suspended"]) {
      for (const required of ["admin", "chef"]) {
        combinations.push({ role, status, required });
      }
    }
  }

  for (const { role, status, required } of combinations) {
    const decision = decideStaffAccess(staffRow({ role, status }), required);
    if (decision.outcome === "allow") {
      assert.equal(status, "active", `allowed a ${status} account`);
      assert.equal(role, required, `allowed ${role} into the ${required} workspace`);
    }
  }
});

test("homeForRole maps each role to its own workspace", () => {
  assert.equal(homeForRole("admin"), ADMIN_HOME);
  assert.equal(homeForRole("chef"), CHEF_HOME);
});

test("visit photos stay inside the customer, assigned-chef, and admin boundary", () => {
  const photo = { customerEmail: "customer@example.com", chefEmail: "assigned@example.com" };
  const assignedChef = staffRow({ email: "assigned@example.com", role: "chef" });
  const otherChef = staffRow({ email: "other@example.com", role: "chef" });
  const admin = staffRow({ email: "admin@example.com", role: "admin" });

  assert.equal(canViewVisitPhoto("CUSTOMER@example.com", null, photo), true);
  assert.equal(canViewVisitPhoto("Assigned@Example.com", assignedChef, photo), true);
  assert.equal(canViewVisitPhoto("other@example.com", otherChef, photo), false);
  assert.equal(canViewVisitPhoto("assigned@example.com", { ...assignedChef, status: "suspended" }, photo), false);
  assert.equal(canViewVisitPhoto("admin@example.com", admin, photo), true);
});

test("built worker: staff pages redirect a signed-out visitor to sign-in", async () => {
  const worker = await startBuiltWorker();
  try {
    for (const path of [ADMIN_HOME, CHEF_HOME]) {
      const response = await worker.fetch(path, {
        headers: { accept: "text/html" },
        redirect: "manual",
      });

      assert.equal(response.status, 307, `${path} should redirect`);
      const location = new URL(response.headers.get("location") ?? "", "http://localhost");
      assert.equal(location.pathname, "/signin-with-chatgpt");
      assert.equal(location.searchParams.get("return_to"), path);
    }
  } finally {
    await worker.dispose();
  }
});
