import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  DEV_AUTH_EMAIL_VAR,
  DEV_AUTH_FULL_NAME_VAR,
  resolveDevIdentity,
} from "../app/dev-auth-identity.ts";
import { startBuiltWorker } from "./worker-harness.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("development identity: signed in when the environment configures one", () => {
  const identity = resolveDevIdentity({
    DEV: true,
    [DEV_AUTH_EMAIL_VAR]: "dev@example.com",
    [DEV_AUTH_FULL_NAME_VAR]: "Dev User",
  });

  assert.deepEqual(identity, {
    displayName: "Dev User",
    email: "dev@example.com",
    fullName: "Dev User",
  });
});

test("development identity: display name falls back to the email address", () => {
  const identity = resolveDevIdentity({
    DEV: true,
    [DEV_AUTH_EMAIL_VAR]: "dev@example.com",
  });

  assert.equal(identity?.displayName, "dev@example.com");
  assert.equal(identity?.fullName, null);
});

test("development identity: signed out when unset, blank, or whitespace", () => {
  assert.equal(resolveDevIdentity({ DEV: true }), null);
  assert.equal(resolveDevIdentity({ DEV: true, [DEV_AUTH_EMAIL_VAR]: "" }), null);
  assert.equal(resolveDevIdentity({ DEV: true, [DEV_AUTH_EMAIL_VAR]: "   " }), null);
});

test("development identity: rejects a malformed email rather than inventing a user", () => {
  assert.throws(
    () => resolveDevIdentity({ DEV: true, [DEV_AUTH_EMAIL_VAR]: "not-an-email" }),
    /not a valid email address/,
  );
});

test("production safety: the shim is absent from the built worker", async () => {
  const bundle = await readFile(resolve(projectRoot, "dist", "server", "index.js"), "utf8");

  // The sentinel is defined in app/dev-auth.ts. Its absence proves the module
  // was eliminated from the production bundle rather than merely disabled.
  assert.doesNotMatch(bundle, /DRIFTLINE_DEV_AUTH_SHIM_MUST_NOT_SHIP/);
  assert.doesNotMatch(bundle, new RegExp(DEV_AUTH_EMAIL_VAR));
  assert.doesNotMatch(bundle, /getDevUser/);
});

test("production safety: a protected route still redirects to sign-in", async () => {
  const worker = await startBuiltWorker();
  try {
    const response = await worker.fetch("/account", {
      headers: { accept: "text/html" },
      redirect: "manual",
    });

    // No dev identity can apply here: the production build reaches the real
    // header check, finds no platform headers, and redirects.
    assert.equal(response.status, 307);
    const location = new URL(response.headers.get("location") ?? "", "http://localhost");
    assert.equal(
      `${location.pathname}${location.search}`,
      "/signin-with-chatgpt?return_to=%2Faccount",
    );
  } finally {
    await worker.dispose();
  }
});
