import assert from "node:assert/strict";
import test from "node:test";

import { effectiveMarketStatus, oregonDate, parseMarketUpdate } from "../app/market-core.ts";
import { parseReview, publicName } from "../app/review-core.ts";

const SUNDAY = new Date("2026-09-20T19:00:00Z"); // noon in Astoria
const MONDAY_EARLY = new Date("2026-09-21T08:30:00Z"); // 1:30am Monday in Astoria

test("market status lapses at midnight Oregon time", () => {
  const saved = { status: "sold_out", note: "Thanks!", date: oregonDate(SUNDAY), updatedAt: SUNDAY.toISOString() };
  assert.equal(effectiveMarketStatus(saved, SUNDAY).status, "sold_out");
  assert.equal(effectiveMarketStatus(saved, MONDAY_EARLY).status, "schedule");
  assert.equal(effectiveMarketStatus(null, SUNDAY).status, "schedule");
});

test("market updates are validated and notes cleaned", () => {
  assert.equal(parseMarketUpdate({ status: "party" }).ok, false);
  assert.equal(parseMarketUpdate(null).ok, false);
  const r = parseMarketUpdate({ status: "open", note: "  Special:\n\tsmoked salmon  " + "x".repeat(300) });
  assert.equal(r.ok, true);
  assert.ok(r.note.startsWith("Special: smoked salmon"));
  assert.equal(r.note.length, 140);
  assert.equal(parseMarketUpdate({ status: "schedule", note: "ignored" }).note, "");
});

test("reviews are validated", () => {
  const good = { rating: 5, service: "Weekly meal prep", body: "Wonderful meals all week long, thank you!", displayName: "Dana Henderson", town: "Astoria" };
  assert.equal(parseReview(good).ok, true);
  for (const [patch, field] of [
    [{ rating: 0 }, "rating"],
    [{ rating: 4.5 }, "rating"],
    [{ rating: "5; drop table" }, "rating"],
    [{ service: "Plumbing" }, "service"],
    [{ body: "too short" }, "body"],
    [{ body: "Great! Visit www.spam.example now please thanks" }, "body"],
    [{ displayName: " " }, "displayName"],
  ]) {
    const r = parseReview({ ...good, ...patch });
    assert.equal(r.ok, false, JSON.stringify(patch));
    assert.equal(r.field, field);
  }
  assert.equal(parseReview({ ...good, body: "y".repeat(5000) }).review.body.length, 1000);
});

test("public names show first name and last initial only", () => {
  assert.equal(publicName("Dana Henderson"), "Dana H.");
  assert.equal(publicName("  mary ann  de la cruz "), "mary C.");
  assert.equal(publicName("Cher"), "Cher");
});
