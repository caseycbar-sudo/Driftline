/**
 * Pure helpers for email sign-in. No Worker, database or framework imports, so
 * everything here can be unit tested directly.
 */

export const SIGN_IN_PATH = "/signin";
export const SIGN_OUT_PATH = "/signout";
export const VERIFY_PATH = "/auth/verify";
export const SESSION_COOKIE = "dl_session";

/** A sign-in link is good for 15 minutes and works once. */
export const LINK_TTL_MS = 15 * 60 * 1000;
/** A session lasts 30 days from sign-in. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Per hour: at most this many links per email address, and per requesting address. */
export const LINKS_PER_EMAIL_PER_HOUR = 5;
export const LINKS_PER_SOURCE_PER_HOUR = 20;

// Deliberately plain: letters, digits and . _ % + - before the @; a normal domain after.
// Rejects anything with spaces, quotes, commas or angle brackets that a mail system
// might read as a different recipient.
const EMAIL = /^[a-z0-9._%+'-]{1,64}@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/;

export function normalizeEmail(value: unknown): string | null {
  const email = String(value ?? "").trim().toLowerCase();
  if (email.length > 200 || !EMAIL.test(email)) return null;
  return email;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 256 bits of randomness, URL-safe. Used for sign-in links and session ids. */
export function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Tokens are exactly 43 URL-safe characters; anything else is rejected before touching the database. */
export function looksLikeToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

const RESERVED = new Set([SIGN_IN_PATH, SIGN_OUT_PATH, VERIFY_PATH]);

/**
 * Only same-site relative paths are allowed as a post-sign-in destination, so a
 * sign-in link can never bounce someone to another website.
 */
export function safeRelativeReturnPath(value: unknown): string {
  const raw = String(value ?? "");
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  let url: URL;
  try {
    url = new URL(raw, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (RESERVED.has(url.pathname) || url.pathname.startsWith("/api/")) return "/";
  const out = `${url.pathname}${url.search}${url.hash}`;
  // Parsing resolves "." and ".." segments, so "/.//evil.com" becomes "//evil.com",
  // which a browser treats as another website. Check the final result, not just the input.
  if (out.startsWith("//") || out.includes("\\")) return "/";
  return out;
}

/**
 * True when a POST plainly came from another website (a hidden auto-submitting form,
 * say). Browsers label every form POST with Origin and Sec-Fetch-Site; requests with
 * neither (curl, scripts) can't carry a visitor's cookies, so they're let through.
 */
export function isCrossSiteRequest(request: Request, allowedOrigins: string[] = []): boolean {
  // Sec-Fetch-Site is set by the browser and can't be forged by page scripts, so when it
  // says the request came from this very site, that settles it. Safari sends
  // "Origin: null" on forms from pages with a no-referrer policy, and without this the
  // Origin check below would reject the site's own sign-in form.
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "none") return false;
  if (fetchSite) return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  // "null" means an opaque origin (sandboxed frame, no-referrer form). Never trusted.
  if (origin === "null") return true;
  const own = new URL(request.url).origin;
  return origin !== own && !allowedOrigins.includes(origin);
}

export function signInPath(returnTo = "/"): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function signOutPath(returnTo = "/"): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

/** Group IPv6 addresses by their /64 (one household or server), IPv4 by full address. */
export function rateLimitKeyForIp(ip: string): string {
  const value = ip.trim().toLowerCase();
  if (!value.includes(":")) return value;
  const [head, tail = ""] = value.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const full = value.includes("::") ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right] : left;
  return full.slice(0, 4).map((part) => part.replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

/** Read one cookie from a Cookie header. */
export function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=") || null;
  }
  return null;
}

/** Session cookie: not readable by page scripts, sent only to this site, HTTPS-only outside localhost. */
export function sessionCookie(value: string, secure: boolean, maxAgeSeconds = SESSION_TTL_MS / 1000): string {
  return [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
    `Max-Age=${Math.floor(maxAgeSeconds)}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearedSessionCookie(secure: boolean): string {
  return sessionCookie("", secure, 0);
}

/**
 * Secure cookies on HTTPS, and on localhost (browsers treat localhost as secure).
 * Only a plain-http address on some other host (e.g. a LAN IP in dev) gets a non-Secure cookie.
 */
export function shouldUseSecureCookie(requestUrl: string): boolean {
  const url = new URL(requestUrl);
  return url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1";
}
