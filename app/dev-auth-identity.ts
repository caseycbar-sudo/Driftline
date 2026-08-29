/**
 * Pure resolver for the local-development identity.
 *
 * This module holds no environment access and no framework imports so it can be
 * unit-tested directly. It never inspects request headers: outside ChatGPT
 * Sites, client-supplied `oai-authenticated-user-*` headers are attacker
 * controlled and must not influence identity.
 *
 * The dev-only entry point that consumes this is `app/dev-auth.ts`, which
 * refuses to load outside a development build.
 */

export type DevIdentity = {
  displayName: string;
  email: string;
  fullName: string | null;
};

export const DEV_AUTH_EMAIL_VAR = "VITE_DEV_AUTH_EMAIL";
export const DEV_AUTH_FULL_NAME_VAR = "VITE_DEV_AUTH_FULL_NAME";

export type DevAuthEnv = Record<string, string | boolean | undefined>;

function readString(env: DevAuthEnv, key: string): string {
  const value = env[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Resolve the development identity from a plain environment object.
 *
 * Returns `null` when no identity is configured, which the app treats as
 * "signed out" and handles through the normal sign-in redirect.
 */
export function resolveDevIdentity(env: DevAuthEnv): DevIdentity | null {
  const email = readString(env, DEV_AUTH_EMAIL_VAR);
  if (!email) return null;

  if (!isPlausibleEmail(email)) {
    throw new Error(
      `${DEV_AUTH_EMAIL_VAR} is set to "${email}", which is not a valid email address. ` +
        `Use a placeholder such as dev@example.com.`,
    );
  }

  const fullName = readString(env, DEV_AUTH_FULL_NAME_VAR) || null;

  return {
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

function isPlausibleEmail(value: string): boolean {
  if (/\s/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
}
