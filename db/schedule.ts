import { env } from "cloudflare:workers";
import type { ServiceType, VisitInput, VisitStatus } from "../app/schedule-core";

export type ScheduleEvent = VisitInput & {
  id: number;
  seriesId: string;
  groceryCents: number;
  receiptKey: string;
  createdAt: string;
  updatedAt: string;
};

function database() {
  if (!env.DB) throw new Error("Schedule database unavailable");
  return env.DB;
}

/** Visit field -> column. Only these columns can ever be written from a request. */
const COLUMNS: Record<keyof VisitInput, string> = {
  serviceDate: "service_date",
  startTime: "start_time",
  endTime: "end_time",
  household: "household",
  customerEmail: "customer_email",
  dishes: "dishes",
  chef: "chef",
  chefEmail: "chef_email",
  packageName: "package_name",
  location: "location",
  status: "status",
  chefPayCents: "chef_pay_cents",
  notes: "notes",
  serviceType: "service_type",
  guestCount: "guest_count",
  contactName: "contact_name",
  contactPhone: "contact_phone",
  address: "address",
  accessNotes: "access_notes",
  inquiryId: "inquiry_id",
  priceCents: "price_cents",
};

const toColumnValue = (key: keyof VisitInput, value: unknown) => (key === "dishes" ? JSON.stringify(value ?? []) : value);

export const VISIT_DEFAULTS: VisitInput = {
  serviceDate: "",
  startTime: "",
  endTime: "",
  household: "",
  customerEmail: "",
  dishes: [],
  chef: "Unassigned",
  chefEmail: "",
  packageName: "",
  location: "",
  status: "scheduled",
  chefPayCents: 0,
  notes: "",
  serviceType: "meal_prep",
  guestCount: 0,
  contactName: "",
  contactPhone: "",
  address: "",
  accessNotes: "",
  inquiryId: 0,
  priceCents: 0,
};

export async function listEvents(start: string, end: string) {
  const result = await database()
    .prepare("SELECT * FROM schedule_events WHERE service_date >= ? AND service_date <= ? ORDER BY service_date, start_time")
    .bind(start, end)
    .all<Record<string, unknown>>();
  return result.results.map(map);
}

/** A chef's visits on one day, for double-booking checks. */
export async function listChefDay(chefEmail: string, date: string) {
  const result = await database()
    .prepare("SELECT * FROM schedule_events WHERE lower(chef_email) = ? AND service_date = ? AND status != 'cancelled'")
    .bind(chefEmail.toLowerCase(), date)
    .all<Record<string, unknown>>();
  return result.results.map(map);
}

export async function createEvent(createdBy: string, visit: VisitInput, seriesId = "") {
  const now = new Date().toISOString();
  const keys = Object.keys(COLUMNS) as (keyof VisitInput)[];
  const cols = [...keys.map((k) => COLUMNS[k]), "series_id", "created_by", "created_at", "updated_at"];
  const values = [...keys.map((k) => toColumnValue(k, visit[k])), seriesId, createdBy.toLowerCase(), now, now];
  const result = await database()
    .prepare(`INSERT INTO schedule_events (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`)
    .bind(...values)
    .run();
  return (await getEvent(Number(result.meta.last_row_id)))!;
}

/** Update only the fields given, so a screen that's out of date can't undo someone else's change. */
export async function patchEvent(id: number, patch: Partial<VisitInput>) {
  const keys = (Object.keys(patch) as (keyof VisitInput)[]).filter((k) => k in COLUMNS);
  if (keys.length) {
    const sets = keys.map((k) => `${COLUMNS[k]} = ?`).join(", ");
    await database()
      .prepare(`UPDATE schedule_events SET ${sets}, updated_at = ? WHERE id = ?`)
      .bind(...keys.map((k) => toColumnValue(k, patch[k])), new Date().toISOString(), id)
      .run();
  }
  return getEvent(id);
}

/** Hard delete is only for visits that never happened; everything else is cancelled instead. */
export async function deleteEvent(id: number): Promise<"deleted" | "has-history" | "missing"> {
  const event = await getEvent(id);
  if (!event) return "missing";
  const history = await database()
    .prepare(
      "SELECT (SELECT count(*) FROM visit_completions WHERE schedule_event_id = ?) + (SELECT count(*) FROM payments WHERE schedule_event_id = ?) + (SELECT count(*) FROM chef_time_entries WHERE schedule_event_id = ?) AS n",
    )
    .bind(id, id, id)
    .first<{ n: number }>();
  if (event.status === "completed" || Number(history?.n ?? 0) > 0) return "has-history";
  await database().prepare("DELETE FROM schedule_events WHERE id = ?").bind(id).run();
  return "deleted";
}

export async function getEvent(id: number) {
  const row = await database().prepare("SELECT * FROM schedule_events WHERE id = ?").bind(id).first<Record<string, unknown>>();
  return row ? map(row) : null;
}

/**
 * Chef-driven status change. Only moves forward from the expected status, so a
 * late tap or a second phone can't send a finished visit backwards.
 */
export async function setChefEventStatus(id: number, chefEmail: string, status: VisitStatus, from: VisitStatus[]) {
  const now = new Date().toISOString(),
    email = chefEmail.toLowerCase();
  const result = await database()
    .prepare(
      `UPDATE schedule_events SET status = ?, updated_at = ? WHERE id = ? AND lower(chef_email) = ? AND status IN (${from.map(() => "?").join(",")})`,
    )
    .bind(status, now, id, email, ...from)
    .run();
  if (status === "completed")
    await database()
      .prepare(
        "UPDATE chef_time_entries SET ended_at = ?, updated_at = ? WHERE schedule_event_id = ? AND lower(chef_email) = ? AND activity_type = 'job' AND ended_at = ''",
      )
      .bind(now, now, id, email)
      .run();
  return (result.meta.changes ?? 0) > 0;
}

export async function setGroceries(id: number, groceryCents: number, receiptKey: string) {
  await database()
    .prepare("UPDATE schedule_events SET grocery_cents = ?, receipt_key = ?, updated_at = ? WHERE id = ?")
    .bind(groceryCents, receiptKey, new Date().toISOString(), id)
    .run();
}

/** Visits happening on a given date (for day-before reminders). */
export async function listForDate(date: string) {
  const result = await database()
    .prepare("SELECT * FROM schedule_events WHERE service_date = ? AND status IN ('scheduled','confirmed') ORDER BY start_time")
    .bind(date)
    .all<Record<string, unknown>>();
  return result.results.map(map);
}

/** A customer's upcoming visits (today onward, not cancelled). */
export async function listUpcomingForCustomer(email: string, fromDate: string) {
  const result = await database()
    .prepare(
      "SELECT * FROM schedule_events WHERE lower(customer_email) = ? AND service_date >= ? AND status NOT IN ('cancelled','completed') ORDER BY service_date, start_time LIMIT 12",
    )
    .bind(email.toLowerCase(), fromDate)
    .all<Record<string, unknown>>();
  return result.results.map(map);
}

function map(row: Record<string, unknown>): ScheduleEvent {
  let dishes: string[] = [];
  try {
    dishes = JSON.parse(String(row.dishes || "[]")) as string[];
  } catch {}
  return {
    id: Number(row.id),
    serviceDate: String(row.service_date),
    startTime: String(row.start_time),
    endTime: String(row.end_time ?? ""),
    household: String(row.household),
    customerEmail: String(row.customer_email ?? ""),
    dishes,
    chef: String(row.chef ?? "Unassigned"),
    chefEmail: String(row.chef_email ?? ""),
    packageName: String(row.package_name ?? ""),
    location: String(row.location ?? ""),
    status: String(row.status ?? "scheduled") as VisitStatus,
    chefPayCents: Number(row.chef_pay_cents ?? 0),
    notes: String(row.notes ?? ""),
    serviceType: String(row.service_type ?? "meal_prep") as ServiceType,
    guestCount: Number(row.guest_count ?? 0),
    contactName: String(row.contact_name ?? ""),
    contactPhone: String(row.contact_phone ?? ""),
    address: String(row.address ?? ""),
    accessNotes: String(row.access_notes ?? ""),
    inquiryId: Number(row.inquiry_id ?? 0),
    priceCents: Number(row.price_cents ?? 0),
    seriesId: String(row.series_id ?? ""),
    groceryCents: Number(row.grocery_cents ?? 0),
    receiptKey: String(row.receipt_key ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}
