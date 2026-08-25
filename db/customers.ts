import { env } from "cloudflare:workers";

export type CustomerProfile = {
  email: string;
  fullName: string;
  phone: string;
  city: string;
  householdSize: number;
  serviceFor: string;
  dietaryNeeds: string;
  favoriteFoods: string;
  foodsToAvoid: string;
  preferredPackage: string;
  createdAt: string;
  updatedAt: string;
};

const createTableSql = `CREATE TABLE IF NOT EXISTS customer_profiles (
  email TEXT PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  household_size INTEGER NOT NULL DEFAULT 1,
  service_for TEXT NOT NULL DEFAULT 'My household',
  dietary_needs TEXT NOT NULL DEFAULT '',
  favorite_foods TEXT NOT NULL DEFAULT '',
  foods_to_avoid TEXT NOT NULL DEFAULT '',
  preferred_package TEXT NOT NULL DEFAULT 'Weekly',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

function database() {
  if (!env.DB) throw new Error("Customer database is unavailable");
  return env.DB;
}

async function ensureCustomerTable() {
  await database().prepare(createTableSql).run();
}

export async function getOrCreateCustomer(email: string, displayName: string): Promise<CustomerProfile> {
  await ensureCustomerTable();
  const db = database();
  const existing = await db.prepare("SELECT * FROM customer_profiles WHERE email = ?").bind(email).first<Record<string, unknown>>();
  if (!existing) {
    const now = new Date().toISOString();
    await db.prepare("INSERT INTO customer_profiles (email, full_name, created_at, updated_at) VALUES (?, ?, ?, ?)").bind(email, displayName, now, now).run();
  }
  const row = await db.prepare("SELECT * FROM customer_profiles WHERE email = ?").bind(email).first<Record<string, unknown>>();
  if (!row) throw new Error("Unable to create customer profile");
  return mapCustomer(row);
}

export async function updateCustomer(email: string, profile: Omit<CustomerProfile, "email" | "createdAt" | "updatedAt">): Promise<CustomerProfile> {
  await ensureCustomerTable();
  const now = new Date().toISOString();
  await database().prepare(`UPDATE customer_profiles SET
    full_name = ?, phone = ?, city = ?, household_size = ?, service_for = ?,
    dietary_needs = ?, favorite_foods = ?, foods_to_avoid = ?, preferred_package = ?, updated_at = ?
    WHERE email = ?`).bind(
      profile.fullName, profile.phone, profile.city, profile.householdSize, profile.serviceFor,
      profile.dietaryNeeds, profile.favoriteFoods, profile.foodsToAvoid, profile.preferredPackage, now, email,
    ).run();
  return getOrCreateCustomer(email, profile.fullName);
}

function mapCustomer(row: Record<string, unknown>): CustomerProfile {
  return {
    email: String(row.email), fullName: String(row.full_name), phone: String(row.phone), city: String(row.city),
    householdSize: Number(row.household_size), serviceFor: String(row.service_for), dietaryNeeds: String(row.dietary_needs),
    favoriteFoods: String(row.favorite_foods), foodsToAvoid: String(row.foods_to_avoid), preferredPackage: String(row.preferred_package),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}
