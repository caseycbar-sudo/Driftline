import assert from "node:assert/strict";
import test from "node:test";
import { chefCanMoveTo, findChefConflicts, isRealDate, mapsLink, parseVisit, telLink, weeklyDates } from "../app/schedule-core.ts";
import { DEFAULT_PRICING, dollars, findPackage, lowestMealPrepCents, parsePricing, readPricing } from "../app/pricing-core.ts";

const visit = { serviceDate: "2026-10-01", startTime: "10:00", endTime: "13:00", household: "Henderson", status: "scheduled", serviceType: "meal_prep" };

test("visits: required fields, real dates, time order, known statuses", () => {
  assert.equal(parseVisit(visit).ok, true);
  assert.equal(parseVisit({ ...visit, serviceDate: "2026-02-30" }).ok, false);
  assert.equal(parseVisit({ ...visit, startTime: "25:00" }).ok, false);
  assert.equal(parseVisit({ ...visit, endTime: "09:00" }).ok, false);
  assert.equal(parseVisit({ ...visit, household: "  " }).ok, false);
  assert.equal(parseVisit({ ...visit, status: "partying" }).ok, false);
  assert.equal(parseVisit({ ...visit, serviceType: "hibachi" }).ok, false);
  const r = parseVisit({ ...visit, chefPayCents: -5, guestCount: 9999, customerEmail: " Dana@Example.com " });
  assert.equal(r.visit.chefPayCents, 0);
  assert.equal(r.visit.guestCount, 500);
  assert.equal(r.visit.customerEmail, "dana@example.com");
});

test("partial updates only touch what's sent", () => {
  const r = parseVisit({ status: "confirmed" }, { partial: true });
  assert.deepEqual(Object.keys(r.visit), ["status"]);
  assert.equal(parseVisit({ startTime: "nope" }, { partial: true }).ok, false);
});

test("double-booking: same chef, same day, overlapping times", () => {
  const a = { id: 1, serviceDate: "2026-10-01", startTime: "10:00", endTime: "13:00", chefEmail: "jordan@example.com", status: "scheduled", household: "A" };
  const others = [
    { ...a, id: 2, startTime: "12:30", endTime: "15:00", household: "overlap" },
    { ...a, id: 3, startTime: "13:00", endTime: "15:00", household: "back-to-back" },
    { ...a, id: 4, startTime: "11:00", endTime: "12:00", household: "cancelled", status: "cancelled" },
    { ...a, id: 5, chefEmail: "mia@example.com", household: "other chef" },
    { ...a, id: 6, serviceDate: "2026-10-02", household: "other day" },
    { ...a, id: 7, startTime: "08:00", endTime: "", household: "no end time = 3h" },
  ];
  assert.deepEqual(findChefConflicts(a, others).map((c) => c.household), ["overlap", "no end time = 3h"]);
  assert.deepEqual(findChefConflicts({ ...a, chefEmail: "" }, others), []);
});

test("weekly repeats", () => {
  assert.deepEqual(weeklyDates("2026-10-29", 3), ["2026-10-29", "2026-11-05", "2026-11-12"]);
  assert.equal(weeklyDates("2026-10-01", 100).length, 26);
  assert.deepEqual(weeklyDates("bad", 3), []);
  assert.equal(isRealDate("2028-02-29"), true);
  assert.equal(isRealDate("2027-02-29"), false);
});

test("maps and phone links", () => {
  assert.equal(mapsLink("88 Irving Ave, Astoria"), "https://maps.apple.com/?q=88%20Irving%20Ave%2C%20Astoria");
  assert.equal(mapsLink(""), "");
  assert.equal(telLink("(503) 555-0142"), "tel:5035550142");
  assert.equal(telLink("+1 503 555 0142"), "tel:+15035550142");
  assert.equal(telLink("call me"), "");
});

test("chef status changes only move forward", () => {
  assert.equal(chefCanMoveTo("scheduled", "shopping"), true);
  assert.equal(chefCanMoveTo("in-progress", "completed"), true);
  assert.equal(chefCanMoveTo("completed", "in-progress"), false);
  assert.equal(chefCanMoveTo("cancelled", "shopping"), false);
});

test("prices: validation and fallbacks", () => {
  const form = {
    mealPrep: [
      { name: "Weekly", portions: 12, price: "240", featured: true },
      { name: "Family", portions: 24, price: 365.5 },
    ],
    privateChef: { perGuest: "185", minGuests: 6, smallTableMin: 1100 },
  };
  const r = parsePricing(form);
  assert.equal(r.ok, true);
  assert.equal(r.pricing.mealPrep[1].priceCents, 36550);
  assert.equal(r.pricing.privateChef.perGuestCents, 18500);
  assert.equal(parsePricing({ ...form, mealPrep: [] }).ok, false);
  assert.equal(parsePricing({ ...form, mealPrep: [...form.mealPrep, { name: "weekly", portions: 1, price: 5 }] }).ok, false);
  assert.equal(parsePricing({ ...form, mealPrep: [{ name: "X", portions: 0, price: 10 }] }).ok, false);
  assert.equal(parsePricing({ ...form, mealPrep: [{ name: "X", portions: 5, price: 0.5 }] }).ok, false);
  assert.equal(parsePricing({ ...form, mealPrep: form.mealPrep.map((m) => ({ ...m, featured: true })) }).ok, false);
  assert.equal(parsePricing({ ...form, privateChef: { perGuest: 5, minGuests: 6, smallTableMin: 0 } }).ok, false);
  assert.equal(readPricing("not json"), DEFAULT_PRICING);
  assert.equal(readPricing(null), DEFAULT_PRICING);
  assert.equal(findPackage(DEFAULT_PRICING, " weekly ").portions, 12);
  assert.equal(lowestMealPrepCents(DEFAULT_PRICING), 17500);
  assert.equal(dollars(32450), "$324.50");
  assert.equal(dollars(111000), "$1,110");
});
