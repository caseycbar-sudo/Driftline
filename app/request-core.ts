/**
 * Rules for a customer's meal prep session request, shared by the customer
 * pages, the admin inbox and the server. Pure functions only (no database or
 * framework imports) so they can be unit tested.
 */
import type { MealPrepPackage, Pricing } from "./pricing-core";

export const MIN_ITEMS = 3;
export const MAX_ITEMS = 5;
export const DEFAULT_PEOPLE = 2;
/** The most people the plan picker offers, however many portions a package holds. */
export const MAX_PEOPLE = 8;
export const MIN_LEAD_HOURS = 48;
export const MAX_LEAD_DAYS = 60;
export const MAX_WINDOWS = 3;
export const MIN_WINDOW_MINUTES = 180;
/** A visit is planned for three hours; four is the most. */
export const VISIT_MINUTES = 180;
export const REQUEST_RESPONSE_HOURS = 24;

export const SERVICE_CITIES = ["Astoria", "Warrenton", "Gearhart", "Seaside", "Cannon Beach"] as const;
export const OUTSIDE_AREA = "Outside current area";

export const CANCELLATION_POLICY =
  "Cancel or reschedule at least 48 hours before your visit at no charge. For changes closer than that, contact Driftline and we'll work it out together.";

export const PRICE_COVERS =
  "The price is for the chef's time and skill. Groceries are billed separately at actual cost, with the receipt.";

export const REQUEST_STATUSES = ["requested", "change_requested", "needs_new_time", "awaiting_chef", "scheduled", "declined", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  requested: "Request received",
  change_requested: "Change requested",
  needs_new_time: "Needs a new time",
  awaiting_chef: "Request received",
  scheduled: "Scheduled",
  declined: "Couldn't be scheduled",
  cancelled: "Cancelled",
};

export type TimeWindow = { date: string; from: string; to: string };

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const ZONE = "America/Los_Angeles";

export const inServiceArea = (city: string) => SERVICE_CITIES.some((c) => c.toLowerCase() === city.trim().toLowerCase());

/* ---------------------------------------------------------------- plans */

/** The most people a customer can pick for this many dishes, so the portions stay inside the largest package. */
export function maxPeopleFor(items: number, pricing: Pricing): number {
  const cap = Math.max(...pricing.mealPrep.map((p) => p.portions));
  return Math.max(1, Math.min(MAX_PEOPLE, Math.floor(cap / Math.max(1, items))));
}

export type Plan = { package: MealPrepPackage; portionsNeeded: number };

/**
 * The plan for a menu: one portion of each dish per person, in the smallest
 * package that holds them. Null until there are enough dishes.
 */
export function planFor(items: number, people: number, pricing: Pricing): Plan | null {
  if (!Number.isInteger(items) || items < MIN_ITEMS || items > MAX_ITEMS) return null;
  if (!Number.isInteger(people) || people < 1 || people > maxPeopleFor(items, pricing)) return null;
  const portionsNeeded = items * people;
  const pkg = [...pricing.mealPrep].sort((a, b) => a.portions - b.portions).find((p) => p.portions >= portionsNeeded);
  return pkg ? { package: pkg, portionsNeeded } : null;
}

/* ---------------------------------------------------------------- time */

function zoneOffsetMinutes(utcMs: number): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(utcMs))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
  return Math.round((asUtc - utcMs) / 60000);
}

/** The instant (ms since epoch) of a date and time on the Oregon clock. */
export function oregonInstant(date: string, time: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, h, mi);
  let ms = naive - zoneOffsetMinutes(naive) * 60000;
  ms = naive - zoneOffsetMinutes(ms) * 60000;
  return ms;
}

const oregonDate = (ms: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));

/** The first date a visit can start on, given the 48 hour notice. */
export const earliestDate = (now = Date.now()) => oregonDate(now + MIN_LEAD_HOURS * 3_600_000);
/** The last date a visit can be requested for. */
export const latestDate = (now = Date.now()) => oregonDate(now + MAX_LEAD_DAYS * 86_400_000);

export const hoursUntil = (date: string, time: string, now = Date.now()) => (oregonInstant(date, time || "00:00") - now) / 3_600_000;

export function addMinutes(time: string, plus: number): string {
  const total = minutes(time) + plus;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/* ------------------------------------------------------------ requests */

const text = (value: unknown, max: number) =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);

export function parseWindows(input: unknown, now = Date.now()): { ok: true; windows: TimeWindow[] } | { ok: false; error: string } {
  const raw = Array.isArray(input) ? input : [];
  if (raw.length < 1) return { ok: false, error: "Pick at least one day and time that works for you." };
  if (raw.length > MAX_WINDOWS) return { ok: false, error: `Offer up to ${MAX_WINDOWS} date ranges.` };
  const windows: TimeWindow[] = [];
  for (const item of raw as Record<string, unknown>[]) {
    const date = text(item?.date, 10),
      from = text(item?.from, 5),
      to = text(item?.to, 5);
    if (!isRealDate(date)) return { ok: false, error: "Pick a valid date for each range." };
    if (!TIME.test(from) || !TIME.test(to)) return { ok: false, error: "Pick a start and end time for each range." };
    if (minutes(to) - minutes(from) < MIN_WINDOW_MINUTES) return { ok: false, error: "Each range needs at least 3 hours, so your chef has room to cook." };
    if (oregonInstant(date, from) < now + MIN_LEAD_HOURS * 3_600_000) {
      return { ok: false, error: `We need at least 48 hours' notice. The earliest date is ${earliestDate(now)}.` };
    }
    if (date > latestDate(now)) return { ok: false, error: `We're booking up to ${MAX_LEAD_DAYS} days ahead. The latest date is ${latestDate(now)}.` };
    if (windows.some((w) => w.date === date && w.from < to && from < w.to)) return { ok: false, error: "Two of your ranges overlap." };
    windows.push({ date, from, to });
  }
  windows.sort((a, b) => (a.date + a.from).localeCompare(b.date + b.from));
  return { ok: true, windows };
}

export type RequestInput = {
  recipeIds: number[];
  people: number;
  windows: TimeWindow[];
  /** Where the visit happens. Empty means the profile address. */
  address: string;
  city: string;
  accessNotes: string;
  kitchenNotes: string;
  acceptedPolicy: boolean;
};

/** Validate what a customer sends when they request (or change) a session. */
export function parseRequestInput(body: Record<string, unknown>, pricing: Pricing, now = Date.now()): { ok: true; input: RequestInput } | { ok: false; error: string; field?: string } {
  const ids = Array.isArray(body.recipeIds) ? body.recipeIds.map((v) => Math.round(Number(v))).filter((n) => Number.isInteger(n) && n > 0) : [];
  const recipeIds = [...new Set(ids)];
  if (recipeIds.length < MIN_ITEMS) return { ok: false, error: `Pick at least ${MIN_ITEMS} dishes for your plan.`, field: "menu" };
  if (recipeIds.length > MAX_ITEMS) return { ok: false, error: `A visit has up to ${MAX_ITEMS} dishes.`, field: "menu" };
  const people = Math.round(Number(body.people) || DEFAULT_PEOPLE);
  if (!planFor(recipeIds.length, people, pricing)) return { ok: false, error: "That many people is more than one visit can cook for. Try fewer dishes or people.", field: "people" };
  const city = text(body.city, 40);
  if (city && !inServiceArea(city)) {
    return { ok: false, error: "We don't cook in that area yet. Email us and we'll tell you when that changes.", field: "city" };
  }
  const windows = parseWindows(body.windows, now);
  if (!windows.ok) return { ok: false, error: windows.error, field: "windows" };
  if (body.acceptedPolicy !== true) return { ok: false, error: "Please read and accept the cancellation policy.", field: "policy" };
  return {
    ok: true,
    input: {
      recipeIds,
      people,
      windows: windows.windows,
      address: text(body.address, 240),
      city,
      accessNotes: text(body.accessNotes, 1000),
      kitchenNotes: text(body.kitchenNotes, 1000),
      acceptedPolicy: true,
    },
  };
}

/** What has to be true of a profile before a first request can be sent. */
export function profileGaps(profile: { fullName: string; phone: string; city: string; streetAddress: string; dietaryNeeds: string; noAllergies: boolean }): string[] {
  const gaps: string[] = [];
  if (!profile.fullName.trim()) gaps.push("your name");
  if (profile.phone.replace(/\D/g, "").length < 10) gaps.push("a phone number");
  if (!profile.streetAddress.trim()) gaps.push("your street address");
  if (!profile.city.trim()) gaps.push("your city");
  if (!profile.dietaryNeeds.trim() && !profile.noAllergies) gaps.push("your allergies (or confirm there are none)");
  return gaps;
}

/** Admin picks a block for a request. */
export function parseApproval(body: Record<string, unknown>): { ok: true; date: string; startTime: string; endTime: string; chefEmail: string } | { ok: false; error: string } {
  const date = text(body.date, 10),
    startTime = text(body.startTime, 5),
    chefEmail = text(body.chefEmail, 200).toLowerCase();
  if (!isRealDate(date)) return { ok: false, error: "Pick a day from the calendar." };
  if (!TIME.test(startTime)) return { ok: false, error: "Pick a start time." };
  const minutesLong = Math.round(Number(body.minutes) || VISIT_MINUTES);
  if (minutesLong < 60 || minutesLong > 240) return { ok: false, error: "A visit runs one to four hours." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chefEmail)) return { ok: false, error: "Choose a chef." };
  const endTime = addMinutes(startTime, minutesLong);
  if (endTime <= startTime) return { ok: false, error: "That visit runs past midnight." };
  return { ok: true, date, startTime, endTime, chefEmail };
}

/** Half-hour start times inside a window that leave room for a whole visit. */
export function startTimesIn(window: TimeWindow, visitMinutes = VISIT_MINUTES): string[] {
  const out: string[] = [];
  for (let t = minutes(window.from); t + visitMinutes <= minutes(window.to); t += 30) out.push(addMinutes("00:00", t));
  return out;
}

/** Whether the chef may see the full address and door codes yet: from the day before the visit. */
export function chefMaySeeAddress(serviceDate: string, today: string): boolean {
  const before = new Date(new Date(`${serviceDate}T12:00:00Z`).getTime() - 86_400_000).toISOString().slice(0, 10);
  return today >= before;
}

export const isOpenForCustomerChange = (status: string) => ["requested", "change_requested", "needs_new_time", "awaiting_chef", "scheduled"].includes(status);
