/**
 * Validation for public inquiry forms (private chef, catering, meal prep).
 * Pure functions with no Worker or database imports, so they can be unit tested.
 */

export const INQUIRY_TYPES = ["private_chef", "catering", "meal_prep", "general"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INQUIRY_LABELS: Record<InquiryType, string> = {
  private_chef: "Private chef dinner",
  catering: "Catering",
  meal_prep: "Weekly meal prep",
  general: "General message",
};

export const CONTACT_TOPICS = ["Private chef dinner", "Catering", "Weekly meal prep", "Sunday Market", "Something else"];

export const MEAL_PREP_PACKAGES = ["Essential", "Classic", "Weekly", "Couples", "Household", "Family"];
export const SERVICE_FOR_OPTIONS = ["My household", "A parent or loved one", "A client I care for"];

export type CleanInquiry = {
  inquiryType: InquiryType;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  guestCount: number;
  location: string;
  occasion: string;
  details: string;
  zip: string;
  packageName: string;
  serviceFor: string;
};

export type ValidationResult =
  | { ok: true; inquiry: CleanInquiry }
  | { ok: false; error: string; field?: string };

const clean = (value: unknown, limit = 500) =>
  String(value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
const cleanLong = (value: unknown, limit = 2000) =>
  String(value ?? "").replace(/\r\n/g, "\n").trim().slice(0, limit);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ZIP = /^\d{5}$/;

/** Today's date in Oregon as YYYY-MM-DD, so "no past dates" matches what the customer sees. */
export function todayInOregon(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** True when the hidden honeypot field was filled in, which people never do but bots often do. */
export function isLikelySpam(body: Record<string, unknown>) {
  return clean(body.website, 200) !== "";
}

export function validateInquiry(body: Record<string, unknown>, now = new Date()): ValidationResult {
  const rawType = clean(body.inquiryType, 30) || "private_chef";
  if (!INQUIRY_TYPES.includes(rawType as InquiryType)) {
    return { ok: false, error: "Unknown request type." };
  }
  const inquiryType = rawType as InquiryType;

  const inquiry: CleanInquiry = {
    inquiryType,
    fullName: clean(body.fullName, 120),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 40),
    preferredDate: clean(body.preferredDate, 10),
    guestCount: 0,
    location: clean(body.location, 180),
    occasion: clean(body.occasion, 120),
    details: cleanLong(body.details),
    zip: clean(body.zip, 10),
    packageName: clean(body.packageName, 40),
    serviceFor: clean(body.serviceFor, 60),
  };

  if (!inquiry.fullName) return { ok: false, error: "Please add your name.", field: "fullName" };
  if (!EMAIL.test(inquiry.email)) return { ok: false, error: "Please enter a valid email address.", field: "email" };

  if (inquiryType === "general") {
    if (inquiry.details.length < 5) return { ok: false, error: "Please add a short message.", field: "details" };
    if (!CONTACT_TOPICS.includes(inquiry.occasion)) inquiry.occasion = "Something else";
    inquiry.preferredDate = "";
    inquiry.location = "";
    return { ok: true, inquiry };
  }

  if (inquiryType === "meal_prep") {
    if (!ZIP.test(inquiry.zip)) return { ok: false, error: "Please enter a 5-digit ZIP code.", field: "zip" };
    if (!MEAL_PREP_PACKAGES.includes(inquiry.packageName)) inquiry.packageName = "Weekly";
    if (!SERVICE_FOR_OPTIONS.includes(inquiry.serviceFor)) inquiry.serviceFor = "My household";
    inquiry.location = inquiry.location || inquiry.zip;
    inquiry.preferredDate = "";
    return { ok: true, inquiry };
  }

  // Private chef and catering both need a date, place and headcount.
  if (!DATE.test(inquiry.preferredDate)) return { ok: false, error: "Please choose a date.", field: "preferredDate" };
  if (inquiry.preferredDate < todayInOregon(now)) {
    return { ok: false, error: "That date has already passed. Please pick an upcoming date.", field: "preferredDate" };
  }
  if (!inquiry.location) return { ok: false, error: "Please tell us where the event will be.", field: "location" };

  const [min, max] = inquiryType === "catering" ? [10, 300] : [2, 40];
  const guests = Math.round(Number(body.guestCount));
  if (!Number.isFinite(guests) || guests < min || guests > max) {
    return {
      ok: false,
      error: `Please enter a guest count between ${min} and ${max}.`,
      field: "guestCount",
    };
  }
  inquiry.guestCount = guests;
  return { ok: true, inquiry };
}
