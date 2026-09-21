/**
 * Who is signed in. Replaces the old ChatGPT Sites sign-in with Driftline's own
 * email sign-in: a one-time link emailed to the person, then a session cookie.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, readCookie, signInPath, signOutPath, safeRelativeReturnPath } from "./auth-core";
import { displayNameFor, sessionEmail } from "../db/auth";

export { signInPath, signOutPath, safeRelativeReturnPath };

export type AuthUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getUser(): Promise<AuthUser | null> {
  // Local development can pin an identity (VITE_DEV_AUTH_EMAIL) to work on staff
  // screens quickly. `import.meta.env.DEV` is false in production builds, so this
  // block and app/dev-auth.ts are removed from the deployed site entirely.
  if (import.meta.env.DEV) {
    const { getDevUser } = await import("./dev-auth");
    const dev = getDevUser();
    if (dev) return dev;
  }

  const sessionId = readCookie((await headers()).get("cookie"), SESSION_COOKIE);
  if (!sessionId || !/^[A-Za-z0-9_-]{43}$/.test(sessionId)) return null;
  const email = await sessionEmail(sessionId);
  if (!email) return null;
  const name = await displayNameFor(email);
  return { email, displayName: name, fullName: name === email ? null : name };
}

/** For pages: the signed-in user, or a redirect to sign-in that comes back here afterwards. */
export async function requireUser(returnTo: string): Promise<AuthUser> {
  const user = await getUser();
  if (user) return user;
  redirect(signInPath(returnTo));
}
