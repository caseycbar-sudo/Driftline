import assert from "node:assert/strict";
import test from "node:test";
import {
  chefMaySeeAddress,
  earliestDate,
  hoursUntil,
  insideCancelWindow,
  maxPeopleFor,
  oregonInstant,
  parseApproval,
  parseRequestInput,
  parseWindows,
  planFor,
  parseBlockedDate,
  unavailableDates,
  TIME_PRESETS,
  firstBookableDate,
  profileGaps,
  startTimesIn,
} from "../app/request-core.ts";
import { DEFAULT_PRICING } from "../app/pricing-core.ts";

// Wed 2026-09-30 11:00 in Oregon (PDT, UTC-7).
const NOW = Date.UTC(2026, 8, 30, 18, 0);

test("plans: each entrée makes 2 portions per person, so every added person raises the plan", () => {
  const name = (items, people) => planFor(items, people, DEFAULT_PRICING).package.name;
  assert.equal(name(3, 1), "Essential"); // 6 portions
  assert.equal(name(3, 2), "Weekly"); // 12
  assert.equal(name(3, 3), "Household"); // 18 -> 20
  assert.equal(name(3, 4), "Family"); // 24
  assert.equal(name(3, 5), "Large Family"); // 30 -> 32
  assert.equal(name(4, 4), "Large Family"); // 32: a family of 4 with 4 dishes
  assert.equal(name(4, 1), "Classic"); // 8
  assert.equal(name(4, 2), "Couples"); // 16
  // Price never stays flat as people are added.
  for (const items of [3, 4]) {
    let last = 0;
    for (let people = 1; people <= maxPeopleFor(items, DEFAULT_PRICING); people++) {
      const price = planFor(items, people, DEFAULT_PRICING).package.priceCents;
      assert.ok(price > last);
      last = price;
    }
  }
});

test("plans: 3 to 5 entrées only, and people are capped by the largest package", () => {
  assert.equal(planFor(2, 2, DEFAULT_PRICING), null);
  assert.equal(planFor(6, 1, DEFAULT_PRICING), null);
  assert.equal(planFor(4, 5, DEFAULT_PRICING), null); // 40 portions > 32
  assert.equal(planFor(5, 3, DEFAULT_PRICING).portionsNeeded, 30);
  assert.equal(maxPeopleFor(4, DEFAULT_PRICING), 4);
  assert.equal(maxPeopleFor(3, DEFAULT_PRICING), 5);
  assert.equal(maxPeopleFor(5, DEFAULT_PRICING), 3);
});

test("Oregon clock: DST and standard time both land on the right instant", () => {
  assert.equal(oregonInstant("2026-09-30", "11:00"), NOW);
  assert.equal(oregonInstant("2026-12-01", "10:00"), Date.UTC(2026, 11, 1, 18, 0)); // PST, UTC-8
  assert.equal(hoursUntil("2026-10-02", "11:00", NOW), 48);
});

test("windows: 48 hours notice, 60 days out, at least 3 hours, no overlaps", () => {
  const ok = parseWindows([{ date: "2026-10-02", from: "11:00", to: "15:00" }], NOW);
  assert.equal(ok.ok, true);
  assert.equal(parseWindows([{ date: "2026-10-02", from: "10:59", to: "15:00" }], NOW).ok, false);
  assert.equal(parseWindows([{ date: "2026-10-02", from: "11:00", to: "13:00" }], NOW).ok, false);
  assert.equal(parseWindows([{ date: "2026-12-30", from: "09:00", to: "13:00" }], NOW).ok, false);
  assert.equal(parseWindows([], NOW).ok, false);
  assert.equal(parseWindows(Array.from({ length: 4 }, (_, i) => ({ date: `2026-10-0${i + 3}`, from: "09:00", to: "13:00" })), NOW).ok, false);
  const overlap = [
    { date: "2026-10-03", from: "09:00", to: "13:00" },
    { date: "2026-10-03", from: "12:00", to: "16:00" },
  ];
  assert.equal(parseWindows(overlap, NOW).ok, false);
  assert.equal(earliestDate(NOW), "2026-10-02");
});

const body = {
  recipeIds: [1, 2, 3],
  people: 2,
  windows: [{ date: "2026-10-03", from: "09:00", to: "13:00" }],
  acceptedPolicy: true,
  city: "Astoria",
};

test("request: needs 3 to 5 entrées plus up to 1 dessert, a plan that fits, an area we serve and the policy", () => {
  assert.equal(parseRequestInput(body, DEFAULT_PRICING, NOW).ok, true);
  assert.equal(parseRequestInput({ ...body, recipeIds: [1, 2] }, DEFAULT_PRICING, NOW).ok, false);
  assert.equal(parseRequestInput({ ...body, recipeIds: [1, 2, 3, 4, 5] }, DEFAULT_PRICING, NOW).ok, true, "5 entrées");
  const desserts = new Set([90, 91]);
  const withDessert = parseRequestInput({ ...body, recipeIds: [1, 2, 3, 4, 90] }, DEFAULT_PRICING, NOW, [], desserts);
  assert.equal(withDessert.ok, true);
  assert.equal(withDessert.input.entrees, 4, "the dessert doesn't count toward portions or price");
  assert.equal(parseRequestInput({ ...body, recipeIds: [1, 2, 90] }, DEFAULT_PRICING, NOW, [], desserts).ok, false, "2 entrées + dessert");
  assert.equal(parseRequestInput({ ...body, recipeIds: [1, 2, 3, 90, 91] }, DEFAULT_PRICING, NOW, [], desserts).ok, false, "2 desserts");
  assert.equal(parseRequestInput({ ...body, recipeIds: [1, 2, 3, 4, 5, 6] }, DEFAULT_PRICING, NOW).ok, false, "6 entrées");
  assert.equal(parseRequestInput({ ...body, recipeIds: [1, 1, 1] }, DEFAULT_PRICING, NOW).ok, false);
  assert.equal(parseRequestInput({ ...body, people: 9 }, DEFAULT_PRICING, NOW).ok, false);
  assert.equal(parseRequestInput({ ...body, city: "Portland" }, DEFAULT_PRICING, NOW).ok, false);
  assert.equal(parseRequestInput({ ...body, acceptedPolicy: false }, DEFAULT_PRICING, NOW).ok, false);
});

test("profile: name, phone, address, city and an allergy answer are needed before a request", () => {
  const complete = { fullName: "Dana", phone: "(503) 555-0123", city: "Astoria", streetAddress: "1 Marine Dr", dietaryNeeds: "", noAllergies: true };
  assert.deepEqual(profileGaps(complete), []);
  assert.deepEqual(profileGaps({ ...complete, noAllergies: false }), ["your allergies (or confirm there are none)"]);
  assert.deepEqual(profileGaps({ ...complete, noAllergies: false, dietaryNeeds: "peanut allergy" }), []);
  assert.equal(profileGaps({ ...complete, phone: "555" }).length, 1);
});

test("approval: a block, a start time and a chef; visits run three hours unless told otherwise", () => {
  const a = parseApproval({ date: "2026-10-03", startTime: "09:30", chefEmail: "Chef@Example.com" });
  assert.deepEqual(a, { ok: true, date: "2026-10-03", startTime: "09:30", endTime: "12:30", chefEmail: "chef@example.com" });
  assert.equal(parseApproval({ date: "2026-10-03", startTime: "09:30", chefEmail: "" }).ok, false);
  assert.equal(parseApproval({ date: "2026-10-03", startTime: "09:30", chefEmail: "c@x.co", minutes: 300 }).ok, false);
});

test("time blocks: half-hour starts that leave room for the whole visit", () => {
  assert.deepEqual(startTimesIn({ date: "2026-10-03", from: "09:00", to: "13:00" }), ["09:00", "09:30", "10:00"]);
});

test("the full address is held back until the day before the visit", () => {
  assert.equal(chefMaySeeAddress("2026-10-03", "2026-10-01"), false);
  assert.equal(chefMaySeeAddress("2026-10-03", "2026-10-02"), true);
  assert.equal(chefMaySeeAddress("2026-10-03", "2026-10-03"), true);
});

test("availability: blocked days and days where every chef is booked are unavailable", () => {
  assert.deepEqual(unavailableDates(["2026-11-26"], [], 2), ["2026-11-26"]);
  // One chef out of two booked: still open. Both booked: full.
  assert.deepEqual(unavailableDates([], ["2026-10-20"], 2), []);
  assert.deepEqual(unavailableDates([], ["2026-10-20", "2026-10-20"], 2), ["2026-10-20"]);
  // Blocked and full on the same day only appears once, sorted.
  assert.deepEqual(unavailableDates(["2026-10-21", "2026-10-20"], ["2026-10-20", "2026-10-20"], 2), ["2026-10-20", "2026-10-21"]);
  // With no active chefs the rule cannot say a day is full.
  assert.deepEqual(unavailableDates([], ["2026-10-20"], 0), []);
});

test("availability: a window on an unavailable day is refused, and every preset is a valid window", () => {
  const w = [{ date: "2026-10-20", from: "09:00", to: "13:00" }];
  assert.equal(parseWindows(w, NOW, []).ok, true);
  const refused = parseWindows(w, NOW, ["2026-10-20"]);
  assert.equal(refused.ok, false);
  assert.match(refused.error, /741-9630/);
  for (const p of TIME_PRESETS) {
    assert.equal(parseWindows([{ date: "2026-10-20", from: p.from, to: p.to }], NOW).ok, true);
  }
});

test("blocked dates: the owner needs a real day that is not in the past", () => {
  assert.equal(parseBlockedDate({ date: "2026-11-26", note: " Thanksgiving " }, "2026-10-03").note, "Thanksgiving");
  assert.equal(parseBlockedDate({ date: "2026-10-02" }, "2026-10-03").ok, false);
  assert.equal(parseBlockedDate({ date: "nope" }, "2026-10-03").ok, false);
  assert.equal(parseBlockedDate({ date: "2026-02-30" }, "2026-10-03").ok, false);
});

test("calendar starts on the first day the Morning block still has 48 hours of notice", () => {
  // Wed 11:00 PDT now: 48 hours out is Fri 11:00, so Friday morning is too soon and Saturday is first.
  assert.equal(firstBookableDate(NOW), "2026-10-03");
  // Wed 05:00 PDT now: Friday 05:00 is before the 8am Morning start, so Friday works.
  assert.equal(firstBookableDate(Date.UTC(2026, 8, 30, 12, 0)), "2026-10-02");
});

test("a visit less than 48 hours away is inside the cancel window", () => {
  assert.equal(insideCancelWindow("2026-10-02", "10:59", NOW), true);
  assert.equal(insideCancelWindow("2026-10-02", "11:00", NOW), false);
  assert.equal(insideCancelWindow("2026-10-05", "09:00", NOW), false);
});
