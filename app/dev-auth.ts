/**
 * Development-only authentication shim.
 *
 * On ChatGPT Sites the platform authenticates the request and injects the
 * `oai-authenticated-user-*` headers that `app/chatgpt-auth.ts` reads. Outside
 * Sites those headers are absent (and, if present, are attacker-supplied and
 * untrusted), so every protected route would redirect to a sign-in path that
 * does not exist locally.
 *
 * This module substitutes a fixed identity read from the environment so the
 * customer, chef, and admin routes can be worked on locally.
 *
 * PRODUCTION SAFETY BOUNDARY
 * --------------------------
 * `import.meta.env.DEV` is statically replaced by Vite at build time (`true` in
 * dev, `false` in a production build). Two independent mechanisms keep this
 * module out of production:
 *
 *   1. `app/chatgpt-auth.ts` imports this module only inside an
 *      `if (import.meta.env.DEV)` block. In a production build that condition
 *      folds to `false` and the dynamic import is eliminated, so this file is
 *      never part of the production bundle.
 *   2. The guard below throws at module evaluation time. If this module is ever
 *      reached in a production build despite (1), the worker fails loudly on
 *      load rather than silently accepting a fabricated identity.
 *
 * `tests/dev-auth.test.mjs` asserts that the sentinel below is absent from the
 * built production worker.
 */

import { resolveDevIdentity, type DevIdentity } from "./dev-auth-identity";

/** Unique marker asserted against the production bundle by the test suite. */
export const DEV_AUTH_SENTINEL = "DRIFTLINE_DEV_AUTH_SHIM_MUST_NOT_SHIP";

if (!import.meta.env.DEV) {
  throw new Error(
    `${DEV_AUTH_SENTINEL}: app/dev-auth.ts was evaluated in a non-development build. ` +
      `This module fabricates a user identity and must never run in production. ` +
      `Refusing to start.`,
  );
}

/**
 * The configured development identity, or `null` when none is set.
 *
 * `null` is the signed-out case: callers fall through to the normal redirect.
 */
export function getDevUser(): DevIdentity | null {
  return resolveDevIdentity(import.meta.env as unknown as Record<string, string | undefined>);
}
