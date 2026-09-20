import assert from "node:assert/strict";
import test from "node:test";
import { oregonLongDate, oregonPartOfDay, oregonToday } from "../app/oregon-time.ts";

test("evening in Oregon is still today, even though it's tomorrow in UTC", () => {
  const sixPm = new Date("2026-09-20T01:00:00Z"); // 6pm Sept 19 in Astoria
  assert.equal(oregonToday(sixPm), "2026-09-19");
  assert.equal(oregonLongDate(sixPm), "Saturday, September 19");
  assert.equal(oregonPartOfDay(sixPm), "evening");
  assert.equal(oregonPartOfDay(new Date("2026-09-19T16:00:00Z")), "morning"); // 9am
  assert.equal(oregonPartOfDay(new Date("2026-09-19T21:00:00Z")), "afternoon"); // 2pm
});

test("winter (PST) offsets work too", () => {
  assert.equal(oregonToday(new Date("2026-12-24T07:30:00Z")), "2026-12-23"); // 11:30pm Dec 23
});
