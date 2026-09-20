/**
 * Schedule rules shared by the owner dashboard, the chef app and the server.
 * Pure functions only (no database or framework imports) so they can be unit tested.
 */

export const VISIT_STATUSES = ["scheduled", "confirmed", "shopping", "in-progress", "completed", "cancelled"] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const SERVICE_TYPES = [
  { value: "meal_prep", label: "Weekly meal prep" },
  { value: "private_dinner", label: "Private dinner" },
  { value: "catering", label: "Catering" },
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number]["value"];

export type VisitInput = {
  serviceDate: string;
  startTime: string;
  endTime: string;
  household: string;
  customerEmail: string;
  dishes: string[];
  chef: string;
  chefEmail: string;
  packageName: string;
  location: string;
  status: VisitStatus;
  chefPayCents: number;
  notes: string;
  serviceType: ServiceType;
  guestCount: number;
  contactName: string;
  contactPhone: string;
  address: string;
  accessNotes: string;
  inquiryId: number;
  priceCents: number;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const text = (value: unknown, max: number) =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
const cents = (value: unknown, max = 10_000_000) => Math.max(0, Math.min(max, Math.round(Number(value) || 0)));

export function isRealDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Validate a visit from the dashboard. `partial` validates only the fields
 * present, for small updates like changing the chef or the status.
 */
export function parseVisit(
  body: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {},
): { ok: true; visit: Partial<VisitInput> } | { ok: false; error: string } {
  const has = (key: string) => !partial || Object.prototype.hasOwnProperty.call(body, key);
  const visit: Partial<VisitInput> = {};

  if (has("serviceDate")) {
    const d = text(body.serviceDate, 10);
    if (!isRealDate(d)) return { ok: false, error: "Pick a valid date." };
    visit.serviceDate = d;
  }
  if (has("startTime")) {
    const t = text(body.startTime, 5);
    if (!TIME.test(t)) return { ok: false, error: "Pick a start time." };
    visit.startTime = t;
  }
  if (has("endTime")) {
    const t = text(body.endTime, 5);
    if (t && !TIME.test(t)) return { ok: false, error: "The end time isn't valid." };
    visit.endTime = t;
  }
  if (visit.startTime && visit.endTime && visit.endTime <= visit.startTime) {
    return { ok: false, error: "The end time has to be after the start time." };
  }
  if (has("household")) {
    const h = text(body.household, 120);
    if (!h) return { ok: false, error: "Add the household or client name." };
    visit.household = h;
  }
  if (has("status")) {
    const s = text(body.status, 30) || "scheduled";
    if (!(VISIT_STATUSES as readonly string[]).includes(s)) return { ok: false, error: "Unknown status." };
    visit.status = s as VisitStatus;
  }
  if (has("serviceType")) {
    const s = text(body.serviceType, 30) || "meal_prep";
    if (!SERVICE_TYPES.some((t) => t.value === s)) return { ok: false, error: "Unknown service type." };
    visit.serviceType = s as ServiceType;
  }
  if (has("dishes")) {
    visit.dishes = Array.isArray(body.dishes)
      ? body.dishes.map((d) => text(d, 160)).filter(Boolean).slice(0, 30)
      : [];
  }
  if (has("customerEmail")) visit.customerEmail = text(body.customerEmail, 200).toLowerCase();
  if (has("chef")) visit.chef = text(body.chef, 100) || "Unassigned";
  if (has("chefEmail")) visit.chefEmail = text(body.chefEmail, 200).toLowerCase();
  if (has("packageName")) visit.packageName = text(body.packageName, 50);
  if (has("location")) visit.location = text(body.location, 160);
  if (has("notes")) visit.notes = text(body.notes, 2000);
  if (has("chefPayCents")) visit.chefPayCents = cents(body.chefPayCents, 1_000_000);
  if (has("priceCents")) visit.priceCents = cents(body.priceCents);
  if (has("guestCount")) visit.guestCount = Math.max(0, Math.min(500, Math.round(Number(body.guestCount) || 0)));
  if (has("contactName")) visit.contactName = text(body.contactName, 120);
  if (has("contactPhone")) visit.contactPhone = text(body.contactPhone, 40);
  if (has("address")) visit.address = text(body.address, 240);
  if (has("accessNotes")) visit.accessNotes = text(body.accessNotes, 1000);
  if (has("inquiryId")) visit.inquiryId = Math.max(0, Math.round(Number(body.inquiryId) || 0));
  return { ok: true, visit };
}

/** Minutes since midnight for "HH:MM". */
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

export type SlotLike = { id: number; serviceDate: string; startTime: string; endTime: string; chefEmail: string; status: string; household: string };

/**
 * Visits for the same chef on the same day whose times overlap. A visit with
 * no end time is treated as three hours long.
 */
export function findChefConflicts(visit: SlotLike, others: SlotLike[]): SlotLike[] {
  if (!visit.chefEmail || visit.status === "cancelled") return [];
  const start = minutes(visit.startTime);
  const end = visit.endTime ? minutes(visit.endTime) : start + 180;
  return others.filter((o) => {
    if (o.id === visit.id || o.status === "cancelled") return false;
    if (o.chefEmail.toLowerCase() !== visit.chefEmail.toLowerCase() || o.serviceDate !== visit.serviceDate) return false;
    const oStart = minutes(o.startTime);
    const oEnd = o.endTime ? minutes(o.endTime) : oStart + 180;
    return start < oEnd && oStart < end;
  });
}

/** Dates for a weekly repeat: the first date plus (count - 1) more, 7 days apart. Max 26. */
export function weeklyDates(first: string, count: number): string[] {
  if (!isRealDate(first)) return [];
  const n = Math.max(1, Math.min(26, Math.round(count) || 1));
  const base = new Date(`${first}T12:00:00Z`);
  return Array.from({ length: n }, (_, i) => new Date(base.getTime() + i * 7 * 86_400_000).toISOString().slice(0, 10));
}

/** A maps link that opens Apple Maps on iPhone and Google Maps elsewhere. */
export function mapsLink(address: string): string {
  return address ? `https://maps.apple.com/?q=${encodeURIComponent(address)}` : "";
}

/** Digits-only tel: link, or "" when there's no usable number. */
export function telLink(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 7 ? `tel:${digits}` : "";
}

/** Status changes a chef may make from the field app. */
export function chefCanMoveTo(from: string, to: string): boolean {
  const order: Record<string, string[]> = {
    scheduled: ["shopping", "in-progress"],
    confirmed: ["shopping", "in-progress"],
    shopping: ["in-progress"],
    "in-progress": ["completed"],
  };
  return (order[from] ?? []).includes(to);
}
