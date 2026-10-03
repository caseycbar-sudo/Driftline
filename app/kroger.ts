/**
 * Fred Meyer ordering through the Kroger API: product search at the Warrenton store,
 * and adding items to a linked Fred Meyer account's cart for pickup. Checkout (pickup
 * time and payment) happens in the Fred Meyer app; Kroger's public API can't place orders.
 *
 * Switched on by the Worker secrets KROGER_CLIENT_ID and KROGER_CLIENT_SECRET.
 */
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../db/index";
import { groceryPicks, krogerAccounts } from "../db/schema";
import { KROGER_API, WARRENTON_LOCATION_ID, toStoreProduct, type StoreProduct } from "./kroger-core";

type KrogerEnv = { KROGER_CLIENT_ID?: string; KROGER_CLIENT_SECRET?: string; KROGER_LOCATION_ID?: string; KROGER_API_URL?: string };

/** KROGER_API_URL is only for local testing against a stand-in server. */
export const krogerApi = () => ((env as unknown as KrogerEnv).KROGER_API_URL || KROGER_API).replace(/\/$/, "");

export function krogerConfig() {
  const e = env as unknown as KrogerEnv;
  const clientId = (e.KROGER_CLIENT_ID || "").trim();
  const clientSecret = (e.KROGER_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret, locationId: (e.KROGER_LOCATION_ID || WARRENTON_LOCATION_ID).trim() };
}

const basic = (id: string, secret: string) => `Basic ${btoa(`${id}:${secret}`)}`;

async function tokenRequest(body: Record<string, string>) {
  const config = krogerConfig();
  if (!config) throw new Error("Fred Meyer isn't connected yet.");
  const response = await fetch(`${krogerApi()}/connect/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", authorization: basic(config.clientId, config.clientSecret) },
    body: new URLSearchParams(body),
  });
  if (!response.ok) throw new Error(`Fred Meyer sign-in failed (${response.status})`);
  return (await response.json()) as { access_token: string; refresh_token?: string; expires_in: number };
}

/* ---------- encryption for stored tokens (key derived from the client secret) ---------- */

async function key() {
  const config = krogerConfig();
  if (!config) throw new Error("not configured");
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`driftline-kroger:${config.clientSecret}`));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function seal(value: object) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), new TextEncoder().encode(JSON.stringify(value)));
  return `${b64(iv)}.${b64(new Uint8Array(data))}`;
}
async function open<T>(box: string): Promise<T | null> {
  try {
    const [iv, data] = box.split(".");
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await key(), unb64(data));
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}

/* ---------- linked account ---------- */

type Tokens = { access: string; refresh: string; expiresAt: number };

export async function saveAccountTokens(email: string, t: { access_token: string; refresh_token?: string; expires_in: number }, previousRefresh = "") {
  const tokens: Tokens = { access: t.access_token, refresh: t.refresh_token || previousRefresh, expiresAt: Date.now() + (t.expires_in - 60) * 1000 };
  const row = { email: email.toLowerCase(), tokenBox: await seal(tokens), expiresAt: new Date(tokens.expiresAt).toISOString(), updatedAt: new Date().toISOString() };
  await getDb().insert(krogerAccounts).values(row).onConflictDoUpdate({ target: krogerAccounts.email, set: row });
}

export async function exchangeCode(code: string, redirectUri: string) {
  return tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
}

export async function isLinked(email: string) {
  const rows = await getDb().select({ email: krogerAccounts.email }).from(krogerAccounts).where(eq(krogerAccounts.email, email.toLowerCase())).limit(1);
  return rows.length > 0;
}

export async function unlink(email: string) {
  await getDb().delete(krogerAccounts).where(eq(krogerAccounts.email, email.toLowerCase()));
}

async function userAccessToken(email: string): Promise<string | null> {
  const rows = await getDb().select().from(krogerAccounts).where(eq(krogerAccounts.email, email.toLowerCase())).limit(1);
  if (!rows[0]) return null;
  const tokens = await open<Tokens>(rows[0].tokenBox);
  if (!tokens) return null;
  if (tokens.expiresAt > Date.now()) return tokens.access;
  if (!tokens.refresh) return null;
  try {
    const fresh = await tokenRequest({ grant_type: "refresh_token", refresh_token: tokens.refresh });
    await saveAccountTokens(email, fresh, tokens.refresh);
    return fresh.access_token;
  } catch {
    return null; // refresh expired: they need to link again
  }
}

/* ---------- store search (app token) ---------- */

let appToken: { value: string; expiresAt: number } | null = null;
async function productToken() {
  if (appToken && appToken.expiresAt > Date.now()) return appToken.value;
  const t = await tokenRequest({ grant_type: "client_credentials", scope: "product.compact" });
  appToken = { value: t.access_token, expiresAt: Date.now() + (t.expires_in - 60) * 1000 };
  return appToken.value;
}

export async function searchProducts(term: string, limit = 6): Promise<StoreProduct[]> {
  const config = krogerConfig();
  if (!config) return [];
  const url = new URL(`${krogerApi()}/products`);
  url.searchParams.set("filter.term", term);
  url.searchParams.set("filter.locationId", config.locationId);
  url.searchParams.set("filter.limit", String(limit));
  const response = await fetch(url, { headers: { authorization: `Bearer ${await productToken()}`, accept: "application/json" } });
  if (!response.ok) throw new Error(`Fred Meyer search failed (${response.status})`);
  const body = (await response.json()) as { data?: unknown[] };
  return (body.data ?? []).map((p) => toStoreProduct(p as never)).filter((p): p is StoreProduct => Boolean(p));
}

/** Add items to the linked account's Fred Meyer cart, marked for pickup. */
export async function addToCart(email: string, items: { upc: string; quantity: number }[]) {
  const token = await userAccessToken(email);
  if (!token) return { ok: false as const, relink: true };
  const response = await fetch(`${krogerApi()}/cart/add`, {
    method: "PUT",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ items: items.map((i) => ({ upc: i.upc, quantity: i.quantity, modality: "PICKUP" })) }),
  });
  if (response.status === 401) return { ok: false as const, relink: true };
  if (!response.ok) throw new Error(`Fred Meyer cart failed (${response.status})`);
  return { ok: true as const };
}

/* ---------- remembered picks ---------- */

export async function getPicks(keys: string[]) {
  if (!keys.length) return {};
  const rows = await getDb().select().from(groceryPicks);
  const wanted = new Set(keys);
  return Object.fromEntries(rows.filter((r) => wanted.has(r.itemKey)).map((r) => [r.itemKey, r]));
}

export async function savePick(itemKey: string, product: { upc: string; description: string; size: string; image: string }, email: string) {
  const row = { itemKey, ...product, updatedBy: email.toLowerCase(), updatedAt: new Date().toISOString() };
  await getDb().insert(groceryPicks).values(row).onConflictDoUpdate({ target: groceryPicks.itemKey, set: row });
}
