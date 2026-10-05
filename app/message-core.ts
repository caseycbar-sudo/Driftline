/**
 * Rules for the message thread on a session request (customer and Driftline).
 * Pure functions only, so they can be unit tested.
 */
export const MAX_MESSAGE_CHARS = 1000;
/** Messages one side may send on one request in an hour, so a thread can't flood an inbox. */
export const MAX_PER_HOUR = 12;
export const MAX_PER_THREAD = 200;

export type Sender = "customer" | "owner";
export type Message = { id: number; requestId: number; sender: Sender; body: string; createdAt: string; readAt: string };

/** The text to save, or why it can't be sent. */
export function parseMessage(value: unknown): { ok: true; body: string } | { ok: false; error: string } {
  const body = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!body) return { ok: false, error: "Type a message first." };
  if (body.length > MAX_MESSAGE_CHARS) return { ok: false, error: `Keep it under ${MAX_MESSAGE_CHARS} characters.` };
  return { ok: true, body };
}

/** True when this side has sent too many messages lately. `sentTimes` are ISO times of their recent messages. */
export function tooManyRecently(sentTimes: string[], now: number): boolean {
  const since = now - 60 * 60 * 1000;
  return sentTimes.filter((t) => Date.parse(t) >= since).length >= MAX_PER_HOUR;
}

/** Messages the other side hasn't opened yet. */
export function unreadFor(viewer: Sender, messages: Pick<Message, "sender" | "readAt">[]): number {
  return messages.filter((m) => m.sender !== viewer && !m.readAt).length;
}
