import assert from "node:assert/strict";
import test from "node:test";

import { isLikelySpam, todayInOregon, validateInquiry } from "../app/inquiry-validation.ts";

const NOW = new Date("2026-09-19T18:00:00Z"); // 11am in Oregon
const base = { fullName: "Pat Doe", email: "Pat@Example.com", location: "Astoria", preferredDate: "2026-10-01" };

test("private chef: valid request is cleaned up", () => {
  const r = validateInquiry({ ...base, guestCount: "6", fullName: "  Pat   Doe " }, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.inquiry.inquiryType, "private_chef");
  assert.equal(r.inquiry.fullName, "Pat Doe");
  assert.equal(r.inquiry.email, "pat@example.com");
  assert.equal(r.inquiry.guestCount, 6);
});

test("private chef: guest count must be 2 to 40", () => {
  assert.equal(validateInquiry({ ...base, guestCount: 1 }, NOW).field, "guestCount");
  assert.equal(validateInquiry({ ...base, guestCount: 41 }, NOW).field, "guestCount");
  assert.equal(validateInquiry({ ...base, guestCount: "" }, NOW).field, "guestCount");
});

test("catering: guest count must be 10 to 300", () => {
  assert.equal(validateInquiry({ ...base, inquiryType: "catering", guestCount: 8 }, NOW).ok, false);
  assert.equal(validateInquiry({ ...base, inquiryType: "catering", guestCount: 120 }, NOW).ok, true);
});

test("dates: past dates are rejected, today is allowed (Oregon time)", () => {
  assert.equal(todayInOregon(NOW), "2026-09-19");
  assert.equal(validateInquiry({ ...base, guestCount: 4, preferredDate: "2026-09-18" }, NOW).field, "preferredDate");
  assert.equal(validateInquiry({ ...base, guestCount: 4, preferredDate: "2026-09-19" }, NOW).ok, true);
  assert.equal(validateInquiry({ ...base, guestCount: 4, preferredDate: "next week" }, NOW).field, "preferredDate");
});

test("meal prep: needs a 5-digit ZIP; unknown package/options fall back to defaults", () => {
  const good = validateInquiry({ inquiryType: "meal_prep", fullName: "Morgan", email: "m@example.com", zip: "97103", packageName: "Mega", serviceFor: "??" }, NOW);
  assert.equal(good.ok, true);
  assert.equal(good.inquiry.packageName, "Weekly");
  assert.equal(good.inquiry.serviceFor, "My household");
  assert.equal(good.inquiry.location, "97103");
  assert.equal(validateInquiry({ inquiryType: "meal_prep", fullName: "M", email: "m@example.com", zip: "9710" }, NOW).field, "zip");
});

test("required fields and unknown types", () => {
  assert.equal(validateInquiry({ ...base, fullName: "", guestCount: 4 }, NOW).field, "fullName");
  assert.equal(validateInquiry({ ...base, email: "not-an-email", guestCount: 4 }, NOW).field, "email");
  assert.equal(validateInquiry({ ...base, location: "", guestCount: 4 }, NOW).field, "location");
  assert.equal(validateInquiry({ ...base, inquiryType: "wedding", guestCount: 4 }, NOW).ok, false);
});

test("honeypot field flags bots", () => {
  assert.equal(isLikelySpam({ website: "" }), false);
  assert.equal(isLikelySpam({}), false);
  assert.equal(isLikelySpam({ website: "http://spam.example" }), true);
});

test("general contact message needs a message; unknown topics become 'Something else'", () => {
  const ok = validateInquiry({ inquiryType: "general", fullName: "Chris", email: "c@example.com", details: "Hello there", occasion: "Weddings??" }, NOW);
  assert.equal(ok.ok, true);
  assert.equal(ok.inquiry.occasion, "Something else");
  assert.equal(validateInquiry({ inquiryType: "general", fullName: "Chris", email: "c@example.com", details: "" }, NOW).field, "details");
});
