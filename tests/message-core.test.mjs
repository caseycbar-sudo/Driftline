import test from "node:test";
import assert from "node:assert/strict";
import { MAX_MESSAGE_CHARS, MAX_PER_HOUR, parseMessage, tooManyRecently, unreadFor } from "../app/message-core.ts";

test("a message is trimmed, must have text and has a length limit", () => {
  assert.deepEqual(parseMessage("  Wed works for me  "), { ok: true, body: "Wed works for me" });
  assert.equal(parseMessage("   ").ok, false);
  assert.equal(parseMessage(undefined).ok, false);
  assert.equal(parseMessage("x".repeat(MAX_MESSAGE_CHARS)).ok, true);
  assert.equal(parseMessage("x".repeat(MAX_MESSAGE_CHARS + 1)).ok, false);
});

test("blank lines are tidied but line breaks stay", () => {
  assert.equal(parseMessage("a\r\n\r\n\r\n\r\nb").body, "a\n\nb");
});

test("a side that sends too many in an hour is stopped", () => {
  const now = Date.parse("2026-10-05T20:00:00Z");
  const recent = Array.from({ length: MAX_PER_HOUR }, (_, i) => new Date(now - i * 60_000).toISOString());
  assert.equal(tooManyRecently(recent, now), true);
  assert.equal(tooManyRecently(recent.slice(1), now), false);
  const old = Array.from({ length: 30 }, () => new Date(now - 2 * 3600_000).toISOString());
  assert.equal(tooManyRecently(old, now), false, "older than an hour doesn't count");
});

test("unread counts only the other side's unopened messages", () => {
  const thread = [
    { sender: "customer", readAt: "" },
    { sender: "owner", readAt: "" },
    { sender: "owner", readAt: "2026-10-05T20:00:00Z" },
    { sender: "owner", readAt: "" },
  ];
  assert.equal(unreadFor("customer", thread), 2);
  assert.equal(unreadFor("owner", thread), 1);
});
