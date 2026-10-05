"use client";

import { useCallback, useEffect, useState } from "react";
import MessageThread from "../MessageThread";
import type { Message } from "../message-core";

type Conversation = { requestId: number; customer: string; email: string; status: string; dishes: string[]; last: Message; unread: number };

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** Customer conversations, newest first. Opening one marks it read. */
export default function Messages() {
  const [items, setItems] = useState<Conversation[]>([]),
    [open, setOpen] = useState(0),
    [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    let live = true;
    fetch("/api/admin/messages", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<{ conversations: Conversation[] }>) : Promise.reject(new Error("load"))))
      .then((data) => {
        if (!live) return;
        setItems(data.conversations);
        setError("");
      })
      .catch(() => live && setError("Messages could not load. Refresh the page."));
    return () => {
      live = false;
    };
  }, [tick]);
  const unread = items.reduce((n, c) => n + c.unread, 0);
  if (!items.length && !error) return null;
  return (
    <section className="request-inbox" aria-label="Messages">
      <header>
        <small>MESSAGES</small>
        <h2>{unread ? `${unread} unread` : "Customer messages"}</h2>
      </header>
      {error ? <p className="dispatch-error">{error}</p> : null}
      {items.map((c) => (
        <div key={c.requestId} className="request-card">
          <button className="request-summary" onClick={() => setOpen(open === c.requestId ? 0 : c.requestId)} aria-expanded={open === c.requestId}>
            <span>
              <b>{c.customer}</b>
              {c.unread ? <span className="request-tag">{c.unread} new</span> : null}
              <span>{c.last.sender === "owner" ? "You: " : ""}{c.last.body.length > 60 ? `${c.last.body.slice(0, 60)}…` : c.last.body}</span>
            </span>
            <small>{when(c.last.createdAt)}</small>
          </button>
          {open === c.requestId ? (
            <div className="request-body">
              <p>{c.dishes.join(", ")}</p>
              <MessageThread endpoint="/api/admin/messages" requestId={c.requestId} me="owner" onRead={refresh} />
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
