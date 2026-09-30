import { env } from "cloudflare:workers";
import type { RequestStatus, TimeWindow } from "../app/request-core";

export type SessionRequest = {
  id: number;
  customerEmail: string;
  status: RequestStatus;
  recipeIds: number[];
  dishes: string[];
  people: number;
  packageName: string;
  priceCents: number;
  address: string;
  city: string;
  windows: TimeWindow[];
  accessNotes: string;
  kitchenNotes: string;
  policyAcceptedAt: string;
  adminNote: string;
  suggestedTimes: TimeWindow[];
  scheduleEventId: number;
  remindedAt: string;
  createdAt: string;
  updatedAt: string;
};

function database() {
  if (!env.DB) throw new Error("Request database unavailable");
  return env.DB;
}

function json<T>(value: unknown, fallback: T): T {
  try {
    const parsed = JSON.parse(String(value ?? ""));
    return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

function map(row: Record<string, unknown>): SessionRequest {
  return {
    id: Number(row.id),
    customerEmail: String(row.customer_email),
    status: String(row.status) as RequestStatus,
    recipeIds: json<number[]>(row.recipe_ids, []),
    dishes: json<string[]>(row.dishes, []),
    people: Number(row.people ?? 2),
    packageName: String(row.package_name ?? ""),
    priceCents: Number(row.price_cents ?? 0),
    address: String(row.address ?? ""),
    city: String(row.city ?? ""),
    windows: json<TimeWindow[]>(row.windows, []),
    accessNotes: String(row.access_notes ?? ""),
    kitchenNotes: String(row.kitchen_notes ?? ""),
    policyAcceptedAt: String(row.policy_accepted_at ?? ""),
    adminNote: String(row.admin_note ?? ""),
    suggestedTimes: json<TimeWindow[]>(row.suggested_times, []),
    scheduleEventId: Number(row.schedule_event_id ?? 0),
    remindedAt: String(row.reminded_at ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export type NewRequest = Pick<SessionRequest, "recipeIds" | "dishes" | "people" | "packageName" | "priceCents" | "address" | "city" | "windows" | "accessNotes" | "kitchenNotes">;

export async function createRequest(email: string, data: NewRequest) {
  const now = new Date().toISOString();
  const result = await database()
    .prepare(
      `INSERT INTO session_requests
       (customer_email, status, recipe_ids, dishes, people, package_name, price_cents, address, city, windows, access_notes, kitchen_notes, policy_accepted_at, created_at, updated_at)
       VALUES (?, 'requested', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      email.toLowerCase(),
      JSON.stringify(data.recipeIds),
      JSON.stringify(data.dishes),
      data.people,
      data.packageName,
      data.priceCents,
      data.address,
      data.city,
      JSON.stringify(data.windows),
      data.accessNotes,
      data.kitchenNotes,
      now,
      now,
      now,
    )
    .run();
  return (await getRequest(Number(result.meta.last_row_id)))!;
}

export async function getRequest(id: number) {
  const row = await database().prepare("SELECT * FROM session_requests WHERE id = ?").bind(id).first<Record<string, unknown>>();
  return row ? map(row) : null;
}

/** A customer's requests that still matter (not cancelled or declined), soonest first. */
export async function listForCustomer(email: string) {
  const result = await database()
    .prepare("SELECT * FROM session_requests WHERE lower(customer_email) = ? AND status NOT IN ('cancelled') ORDER BY created_at DESC LIMIT 50")
    .bind(email.toLowerCase())
    .all<Record<string, unknown>>();
  return result.results.map(map);
}

/** What the admin inbox shows: new requests and change requests, oldest first. */
export async function listInbox() {
  const result = await database()
    .prepare("SELECT * FROM session_requests WHERE status IN ('requested','change_requested') ORDER BY created_at")
    .all<Record<string, unknown>>();
  return result.results.map(map);
}

const COLUMNS = {
  status: "status",
  recipeIds: "recipe_ids",
  dishes: "dishes",
  people: "people",
  packageName: "package_name",
  priceCents: "price_cents",
  address: "address",
  city: "city",
  windows: "windows",
  accessNotes: "access_notes",
  kitchenNotes: "kitchen_notes",
  adminNote: "admin_note",
  suggestedTimes: "suggested_times",
  scheduleEventId: "schedule_event_id",
  remindedAt: "reminded_at",
} as const;
const JSON_FIELDS = new Set(["recipeIds", "dishes", "windows", "suggestedTimes"]);

/** Update only the fields given. */
export async function patchRequest(id: number, patch: Partial<Record<keyof typeof COLUMNS, unknown>>) {
  const keys = (Object.keys(patch) as (keyof typeof COLUMNS)[]).filter((k) => k in COLUMNS);
  if (keys.length) {
    await database()
      .prepare(`UPDATE session_requests SET ${keys.map((k) => `${COLUMNS[k]} = ?`).join(", ")}, updated_at = ? WHERE id = ?`)
      .bind(...keys.map((k) => (JSON_FIELDS.has(k) ? JSON.stringify(patch[k]) : patch[k])), new Date().toISOString(), id)
      .run();
  }
  return getRequest(id);
}

/** Requests that have waited since before `before` and haven't triggered a reminder yet. */
export async function listNeedingReminder(before: string) {
  const result = await database()
    .prepare("SELECT * FROM session_requests WHERE status IN ('requested','change_requested') AND reminded_at = '' AND updated_at < ? ORDER BY created_at")
    .bind(before)
    .all<Record<string, unknown>>();
  return result.results.map(map);
}

/** The request behind a visit, if any. */
export async function getRequestForEvent(eventId: number) {
  const row = await database().prepare("SELECT * FROM session_requests WHERE schedule_event_id = ?").bind(eventId).first<Record<string, unknown>>();
  return row ? map(row) : null;
}
