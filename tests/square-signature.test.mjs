import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";

// app/square.ts imports cloudflare:workers, so the signature check is exercised
// through the same formula Square documents: base64(HMAC-SHA256(key, url + body)).
async function verify(rawBody, signature, url, key) {
  const k = await crypto.webcrypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = Buffer.from(await crypto.webcrypto.subtle.sign("HMAC", k, new TextEncoder().encode(url + rawBody))).toString("base64");
  return signature !== null && mac.length === signature.length && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(signature));
}

test("Square webhook signatures", async () => {
  const url = "https://www.driftlineprovisions.com/api/billing/webhook";
  const body = '{"type":"payment.updated"}';
  const good = crypto.createHmac("sha256", "key").update(url + body).digest("base64");
  assert.equal(await verify(body, good, url, "key"), true);
  assert.equal(await verify(body + " ", good, url, "key"), false, "body changed");
  assert.equal(await verify(body, good, url.replace("www.", ""), "key"), false, "different URL");
  assert.equal(await verify(body, good, url, "other"), false, "wrong key");
  assert.equal(await verify(body, null, url, "key"), false, "missing header");
});

test("the app's verifier uses the same formula", async () => {
  const src = await import("node:fs").then((fs) => fs.readFileSync(new URL("../app/square.ts", import.meta.url), "utf8"));
  assert.match(src, /notificationUrl \+ rawBody/);
  assert.match(src, /name: "HMAC", hash: "SHA-256"/);
  assert.match(src, /diff \|= /, "constant-time compare");
});
