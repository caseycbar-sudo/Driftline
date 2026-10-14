import assert from "node:assert/strict";
import test from "node:test";

import {
  PASSWORD_MAX,
  PASSWORD_MIN,
  dummyVerify,
  hashPassword,
  passwordProblem,
  tooManyPasswordFailures,
  verifyPassword,
} from "../app/password-core.ts";

test("passwords need real length and can't be trivially weak", () => {
  assert.equal(passwordProblem("blue heron lantern"), "");
  assert.match(passwordProblem("short"), new RegExp(String(PASSWORD_MIN)));
  assert.match(passwordProblem("x".repeat(PASSWORD_MAX + 1)), /or fewer/);
  assert.match(passwordProblem("aaaaaaaaaaaa"), /repeated/);
  assert.match(passwordProblem("MyPassword123"), /easy to guess/);
  assert.match(passwordProblem(" leading space here"), /space/);
  assert.notEqual(passwordProblem(undefined), "");
  assert.notEqual(passwordProblem(12345678901), "");
});

test("a password verifies only against itself, and is salted", async () => {
  const a = await hashPassword("blue heron lantern");
  const b = await hashPassword("blue heron lantern");
  assert.notEqual(a.hash, b.hash, "same password, different salt, different hash");
  assert.ok(!a.hash.includes("blue"));
  assert.equal(await verifyPassword("blue heron lantern", a), true);
  assert.equal(await verifyPassword("blue heron lanterns", a), false);
  assert.equal(await verifyPassword("", a), false);
  assert.equal(await verifyPassword("x".repeat(PASSWORD_MAX + 1), a), false);
});

test("an unknown email still does the hashing work", async () => {
  await dummyVerify("anything at all");
  await dummyVerify(undefined);
});

test("too many wrong passwords from one address or for one email cuts off", () => {
  assert.equal(tooManyPasswordFailures(0, 0), false);
  assert.equal(tooManyPasswordFailures(5, 7), false);
  assert.equal(tooManyPasswordFailures(0, 8), true);
  assert.equal(tooManyPasswordFailures(20, 0), true);
});
