import { env } from "cloudflare:workers";
import type { Message, Sender } from "../app/message-core";

function database() {
  if (!env.DB) throw new Error("Message database unavailable");
  return env.DB;
}

function map(row: Record<string, unknown>): Message {
  return {
    id: Number(row.id),
    requestId: Number(row.request_id),
    sender: String(row.sender) === "owner" ? "owner" : "customer",
    body: String(row.body ?? ""),
    createdAt: String(row.created_at ?? ""),
    readAt: String(row.read_at ?? ""),
  };
}

export async function listMessages(requestId: number): Promise<Message[]> {
  const result = await database().prepare("SELECT * FROM request_messages WHERE request_id = ? ORDER BY id LIMIT 200").bind(requestId).all<Record<string, unknown>>();
  return result.results.map(map);
}

export async function addMessage(requestId: number, sender: Sender, body: string): Promise<Message> {
  const now = new Date().toISOString();
  const result = await database().prepare("INSERT INTO request_messages (request_id, sender, body, created_at) VALUES (?, ?, ?, ?)").bind(requestId, sender, body, now).run();
  return { id: Number(result.meta.last_row_id), requestId, sender, body, createdAt: now, readAt: "" };
}

/** Times of this side's messages in the last hour, newest first, for the send limit. */
export async function recentSent(requestId: number, sender: Sender, sinceIso: string): Promise<string[]> {
  const result = await database()
    .prepare("SELECT created_at FROM request_messages WHERE request_id = ? AND sender = ? AND created_at >= ? ORDER BY id DESC LIMIT 50")
    .bind(requestId, sender, sinceIso)
    .all<{ created_at: string }>();
  return result.results.map((r) => r.created_at);
}

export async function countMessages(requestId: number): Promise<number> {
  const row = await database().prepare("SELECT COUNT(*) AS n FROM request_messages WHERE request_id = ?").bind(requestId).first<{ n: number }>();
  return Number(row?.n ?? 0);
}

/** The viewer opened the thread: mark everything the other side sent as read. */
export async function markRead(requestId: number, viewer: Sender) {
  await database()
    .prepare("UPDATE request_messages SET read_at = ? WHERE request_id = ? AND sender != ? AND read_at = ''")
    .bind(new Date().toISOString(), requestId, viewer)
    .run();
}

/** Unread counts from the other side, by request id, for a set of requests. */
export async function unreadByRequest(viewer: Sender, requestIds: number[]): Promise<Record<number, number>> {
  if (!requestIds.length) return {};
  const marks = requestIds.map(() => "?").join(",");
  const result = await database()
    .prepare(`SELECT request_id, COUNT(*) AS n FROM request_messages WHERE sender != ? AND read_at = '' AND request_id IN (${marks}) GROUP BY request_id`)
    .bind(viewer, ...requestIds)
    .all<{ request_id: number; n: number }>();
  return Object.fromEntries(result.results.map((r) => [Number(r.request_id), Number(r.n)]));
}

/** Conversations for the owner: requests with at least one message, newest activity first. */
export async function listConversations(): Promise<{ requestId: number; last: Message; unread: number }[]> {
  const result = await database()
    .prepare(
      `SELECT m.*, (SELECT COUNT(*) FROM request_messages u WHERE u.request_id = m.request_id AND u.sender = 'customer' AND u.read_at = '') AS unread
       FROM request_messages m
       WHERE m.id IN (SELECT MAX(id) FROM request_messages GROUP BY request_id)
       ORDER BY m.id DESC LIMIT 50`,
    )
    .all<Record<string, unknown>>();
  return result.results.map((row) => ({ requestId: Number(row.request_id), last: map(row), unread: Number(row.unread ?? 0) }));
}
