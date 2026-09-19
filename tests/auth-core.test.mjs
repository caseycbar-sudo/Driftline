import assert from "node:assert/strict";
import test from "node:test";

import {
  LINKS_PER_EMAIL_PER_HOUR,
  SESSION_COOKIE,
  clearedSessionCookie,
  looksLikeToken,
  isCrossSiteRequest,
  normalizeEmail,
  rateLimitKeyForIp,
  randomToken,
  readCookie,
  safeRelativeReturnPath,
  sessionCookie,
  sha256Hex,
  shouldUseSecureCookie,
  signInPath,
  signOutPath,
} from "../app/auth-core.ts";

test("emails are trimmed, lower-cased and validated", () => {
  assert.equal(normalizeEmail("  Casey@Example.COM "), "casey@example.com");
  assert.equal(normalizeEmail("pat.o'brien+chef@mail.example.co"), "pat.o'brien+chef@mail.example.co");
  for (const sneaky of ["victim<attacker@evil.com>", '"a,b"@example.com', "a@b.com, c@d.com", "a;b@example.com", "a@-.com.", "a@example"]) {
    assert.equal(normalizeEmail(sneaky), null, sneaky);
  }
  for (const bad of ["", "casey", "casey@", "@example.com", "a b@example.com", "a@b.c", null, undefined, "x".repeat(200) + "@example.com"]) {
    assert.equal(normalizeEmail(bad), null, String(bad));
  }
});

test("tokens are 43 URL-safe characters and never repeat", () => {
  const seen = new Set();
  for (let i = 0; i < 500; i++) {
    const t = randomToken();
    assert.ok(looksLikeToken(t), t);
    seen.add(t);
  }
  assert.equal(seen.size, 500);
  for (const bad of ["", "short", "A".repeat(42), "A".repeat(44), "A".repeat(42) + "=", "A".repeat(42) + "/", 42, null]) {
    assert.equal(looksLikeToken(bad), false, String(bad));
  }
});

test("sha256Hex matches a known digest", async () => {
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("return paths stay on this site", () => {
  assert.equal(safeRelativeReturnPath("/account"), "/account");
  assert.equal(safeRelativeReturnPath("/cookbook?side=private-chef#top"), "/cookbook?side=private-chef#top");
  for (const bad of [
    "https://evil.com",
    "//evil.com",
    "///evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "javascript:alert(1)",
    "evil.com",
    "",
    null,
    "/api/staff",
    "/signin",
    "/signout",
    "/auth/verify?token=x",
    "/.//evil.com",
    "/a/..//evil.com",
    "/%2e%2e//evil.com",
    "/./\\evil.com",
    "/%2e//evil.com?x=1",
  ]) {
    assert.equal(safeRelativeReturnPath(bad), "/", JSON.stringify(bad));
  }
});

test("sign-in and sign-out paths encode a safe return path", () => {
  assert.equal(signInPath("/account"), "/signin?return_to=%2Faccount");
  assert.equal(signInPath("https://evil.com"), "/signin?return_to=%2F");
  assert.equal(signOutPath("/chef"), "/signout?return_to=%2Fchef");
});

test("cookies are read by exact name", () => {
  const header = `other=1; ${SESSION_COOKIE}x=nope; ${SESSION_COOKIE}=abc=def; last=2`;
  assert.equal(readCookie(header, SESSION_COOKIE), "abc=def");
  assert.equal(readCookie("a=1", SESSION_COOKIE), null);
  assert.equal(readCookie(null, SESSION_COOKIE), null);
});

test("session cookie is HttpOnly, SameSite=Lax, and Secure on HTTPS", () => {
  const c = sessionCookie("v", true);
  assert.match(c, /^dl_session=v; Path=\/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000$/);
  assert.doesNotMatch(sessionCookie("v", false), /Secure/);
  assert.match(clearedSessionCookie(true), /^dl_session=; .*Max-Age=0$/);
  assert.equal(shouldUseSecureCookie("https://driftlineprovisions.com/"), true);
  assert.equal(shouldUseSecureCookie("http://localhost:5173/"), true);
  assert.equal(shouldUseSecureCookie("http://192.168.1.4:5173/"), false);
});

test("rate limit constants are sane", () => {
  assert.ok(LINKS_PER_EMAIL_PER_HOUR >= 3 && LINKS_PER_EMAIL_PER_HOUR <= 10);
});

test("cross-site POSTs are recognised", () => {
  const req = (headers) => new Request("https://www.driftlineprovisions.com/api/auth/verify", { method: "POST", headers });
  assert.equal(isCrossSiteRequest(req({ origin: "https://www.driftlineprovisions.com", "sec-fetch-site": "same-origin" })), false);
  assert.equal(isCrossSiteRequest(req({})), false, "no browser headers (curl) is not a CSRF vector");
  assert.equal(isCrossSiteRequest(req({ origin: "https://evil.com" })), true);
  assert.equal(isCrossSiteRequest(req({ "sec-fetch-site": "cross-site" })), true);
  assert.equal(isCrossSiteRequest(req({ "sec-fetch-site": "same-site" })), true);
  assert.equal(isCrossSiteRequest(req({ origin: "https://driftlineprovisions.com" }), ["https://driftlineprovisions.com"]), false);
});

test("IPv6 addresses are rate-limited per /64", () => {
  assert.equal(rateLimitKeyForIp("203.0.113.9"), "203.0.113.9");
  const a = rateLimitKeyForIp("2001:db8:abcd:12:1:2:3:4");
  assert.equal(a, "2001:db8:abcd:12::/64");
  assert.equal(rateLimitKeyForIp("2001:db8:abcd:12::99"), a);
  assert.equal(rateLimitKeyForIp("2001:0DB8:abcd:0012:ffff::1"), a);
  assert.notEqual(rateLimitKeyForIp("2001:db8:abcd:13::1"), a);
  assert.equal(rateLimitKeyForIp("::1"), "0:0:0:0::/64");
});
