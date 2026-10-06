"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import "./MessageThread.css";
import { MAX_MESSAGE_CHARS, type Message, type Sender } from "./message-core";

const stamp = (iso: string) => new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** A simple chat for one request. `me` is whose screen this is; `endpoint` is the matching API. */
function Thread({ endpoint, requestId, me, onRead, draft = "" }: { endpoint: string; requestId: number; me: Sender; onRead?: () => void; draft?: string }) {
  const [messages, setMessages] = useState<Message[] | null>(null),
    [text, setText] = useState(draft),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  });

  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    fetch(`${endpoint}?id=${requestId}`, { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<{ messages: Message[] }>) : Promise.reject(new Error("load"))))
      .then((data) => {
        if (!live) return;
        setMessages(data.messages);
        setError("");
        onReadRef.current?.();
      })
      .catch(() => live && setError("We couldn't load the messages. Try again in a moment."));
    return () => {
      live = false;
    };
  }, [endpoint, requestId, tick]);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((t) => t + 1), 20000);
    return () => window.clearInterval(timer);
  }, []);
  // Braces matter: an effect must not return a value, and some browsers' scrollIntoView does.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages?.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: requestId, body: text }) });
      const data = (await response.json()) as { message?: Message; error?: string };
      if (!response.ok || !data.message) throw new Error(data.error || "That didn't send.");
      setMessages((current) => [...(current ?? []), data.message!]);
      setText("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That didn't send.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="msg-thread">
      <div className="msg-list" role="log" aria-live="polite">
        {messages === null ? <p className="msg-empty">Loading…</p> : null}
        {messages?.length === 0 ? <p className="msg-empty">{me === "customer" ? "No messages yet. Ask us anything about this session, or tell us what time works." : "No messages yet."}</p> : null}
        {messages?.map((m) => (
          <div key={m.id} className={`msg ${m.sender === me ? "mine" : "theirs"}`}>
            <p>{m.body}</p>
            <small>
              {m.sender === me ? "You" : m.sender === "owner" ? "Driftline" : "Customer"} · {stamp(m.createdAt)}
            </small>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      {error ? <p className="msg-error">{error}</p> : null}
      <form onSubmit={send}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX_MESSAGE_CHARS} rows={2} placeholder={me === "customer" ? "Write to Driftline…" : "Write to the customer…"} aria-label="Message" />
        <button type="submit" disabled={busy || !text.trim()}>
          {busy ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}

/** If anything in the thread breaks, show a short note instead of taking the whole page down with it. */
class Safe extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[messages] thread failed", error);
  }
  render() {
    if (this.state.failed) {
      return (
        <p className="msg-error">
          Messages aren&apos;t working right now. Please refresh the page, or call or text Driftline at (503) 741-9630.
        </p>
      );
    }
    return this.props.children;
  }
}

export default function MessageThread(props: { endpoint: string; requestId: number; me: Sender; onRead?: () => void; draft?: string }) {
  return (
    <Safe>
      <Thread {...props} />
    </Safe>
  );
}
