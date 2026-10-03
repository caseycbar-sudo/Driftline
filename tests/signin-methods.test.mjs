import test from "node:test";
import assert from "node:assert/strict";
import { cleanCode, codeHash, passkeyRpId, randomCode, SESSION_TTL_MS } from "../app/auth-core.ts";
import { readGoogleIdToken } from "../app/google-core.ts";

test("sign-in codes are 6 digits and tidy what people type or paste", () => {
  for (let i = 0; i < 200; i++) assert.match(randomCode(), /^\d{6}$/);
  assert.equal(cleanCode(" 123 456 "), "123456");
  assert.equal(cleanCode("123-456"), "123456");
  assert.equal(cleanCode("12345"), null);
  assert.equal(cleanCode("abcdef"), null);
});

test("a code only matches the email it was sent to", async () => {
  assert.notEqual(await codeHash("a@x.com", "123456"), await codeHash("b@x.com", "123456"));
  assert.equal(await codeHash("a@x.com", "123456"), await codeHash("a@x.com", "123456"));
});

test("people stay signed in for 90 days", () => {
  assert.equal(SESSION_TTL_MS, 90 * 24 * 60 * 60 * 1000);
});

test("Face ID works across every Driftline address", () => {
  assert.equal(passkeyRpId("www.driftlineprovisions.com"), "driftlineprovisions.com");
  assert.equal(passkeyRpId("new.driftlineprovisions.com"), "driftlineprovisions.com");
  assert.equal(passkeyRpId("driftlineprovisions.com"), "driftlineprovisions.com");
  assert.equal(passkeyRpId("localhost"), "localhost");
  assert.equal(passkeyRpId("evil-driftlineprovisions.com"), "evil-driftlineprovisions.com", "look-alike hosts don't get our passkeys");
});

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = (claims) => `${b64({ alg: "RS256" })}.${b64(claims)}.sig`;
const good = { aud: "client-1", iss: "https://accounts.google.com", exp: 2_000_000_000, nonce: "n1", email: "casey@example.com", email_verified: true };

test("Google sign-in only accepts a verified email meant for us", () => {
  const now = 1_900_000_000_000;
  assert.equal(readGoogleIdToken(token(good), { clientId: "client-1", nonce: "n1", now })?.email, "casey@example.com");
  assert.equal(readGoogleIdToken(token({ ...good, aud: "someone-else" }), { clientId: "client-1", nonce: "n1", now }), null);
  assert.equal(readGoogleIdToken(token({ ...good, nonce: "other" }), { clientId: "client-1", nonce: "n1", now }), null);
  assert.equal(readGoogleIdToken(token({ ...good, email_verified: false }), { clientId: "client-1", nonce: "n1", now }), null);
  assert.equal(readGoogleIdToken(token({ ...good, iss: "https://evil.example" }), { clientId: "client-1", nonce: "n1", now }), null);
  assert.equal(readGoogleIdToken(token({ ...good, exp: 1 }), { clientId: "client-1", nonce: "n1", now }), null);
  assert.equal(readGoogleIdToken("not-a-token", { clientId: "client-1", nonce: "n1", now }), null);
});
