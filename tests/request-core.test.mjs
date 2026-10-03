import assert from "node:assert/strict";
import test from "node:test";
import {
  chefMaySeeAddress,
  earliestDate,
  hoursUntil,
  maxPeopleFor,
  oregonInstant,
  parseApproval,
  parseRequestInput,
  parseWindows,
  planFor,
  profileGaps,
  startTimesIn,
} from "../app/request-core.ts";
import { DEFAULT_PRICING } from "../app/pricing-core.ts";

// Wed 2026-09-30 11:00 in Oregon (PDT, UTC-7).
const NOW = Date.UTC(2026, 8, 30, 18, 0);

test("plans: each dish makes 2 portions per person, so every added person raises the plan", () => {
  const name = (items, people) => planFor(items, people, DEFAULT_PRICING).package.name;
  assert.equal(name(3, 1), "Essential"); // 6 portions
  assert.equal(name(3, 2), "Weekly"); // 12
  assert.equal(name(3, 3), "Household"); // 18 -> 20
  assert.equal(name(3, 4), "Family"); // 24
  assert.equal(name(3, 5), "Large Family"); // 30 -> 32
  assert.equal(name(4, 4), "Large Family"); // 32: a family of 4 with 4 dishes
  assert.equal(name(5, 3), "Large Family"); // 30 -> 32
  assert.equal(name(4, 1), "Classic"); // 8
  assert.equal(name(5, 1), "Weekly"); // 10 -> 12
  assert.equal(name(5, 2), "Household"); // 20
  // Price never stays flat as people are added.
  for (const items of [3, 4, 5]) {
    let last = 0;
    for (let people = 1; people <= maxPeopleFor(items, DEFAULT_PRICING); people++) {
      const price = planFor(items, people, DEFAULT_PRICING).package.priceCents;
      assert.ok(price > last);
      last = price;
    }
  }
});

test("plans: nothing under 3 or over 5 dishes, and people are capped by the largest package", () => {
  assert.equal(planFor(2, 2, DEFAULT_PRICING), null);
  assert.equal(planFor(6, 1, DEFAULT_PRICING), null);
  assert.equal(planFor(5, 4, DEFAULT_PRICING), null); // 40 portions > 32
  assert.equal(maxPeopleFor(5, DEFAULT_PRICING), 3);
  assert.equal(maxPeopleFor(4, DEFAULT_PRICING), 4);
  assert.equal(maxPeopleFor(3, DEFAULT_PRICING), 5);
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

test("request: needs 3 to 5 dishes, a plan that fits, an area we serve and the policy", () => {
  assert.equal(parseRequestInput(body, DEFAULT_PRICING, NOW).ok, true);
  assert.equal(parseRequestInput({ ...body, recipeIds: [1, 2] }, DEFAULT_PRICING, NOW).ok, false);
  assert.equal(parseRequestInput({ ...body, recipeIds: [1, 2, 3, 4, 5, 6] }, DEFAULT_PRICING, NOW).ok, false);
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
