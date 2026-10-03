"use client";

import { useEffect, useState } from "react";

type Blocked = { date: string; note: string };

const day = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export default function BlockedDays() {
  const [blocked, setBlocked] = useState<Blocked[]>([]),
    [date, setDate] = useState(""),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    fetch("/api/admin/blocked-dates", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<{ blocked: Blocked[] }>) : Promise.reject(new Error("load"))))
      .then((data) => live && setBlocked(data.blocked))
      .catch(() => live && setError("Blocked days could not load. Refresh the page."));
    return () => {
      live = false;
    };
  }, [tick]);

  async function send(body: Record<string, string>) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/blocked-dates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = (await response.json()) as { blocked?: Blocked[]; error?: string };
      if (!response.ok) throw new Error(data.error || "That did not save.");
      setBlocked(data.blocked ?? []);
      setTick((t) => t + 1);
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That did not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (await send({ date, note })) {
      setDate("");
      setNote("");
    }
  }

  return (
    <details className="blocked-days">
      <summary>
        <strong>Days off</strong>
        <span>{blocked.length ? `${blocked.length} blocked` : "None blocked"}. Customers cannot pick these days.</span>
      </summary>
      <form onSubmit={add}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required aria-label="Day to block" />
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} placeholder="Note for you (optional), like Thanksgiving" aria-label="Note" />
        <button disabled={busy || !date}>Block this day</button>
      </form>
      {error ? <p className="dispatch-error">{error}</p> : null}
      {blocked.length ? (
        <ul>
          {blocked.map((b) => (
            <li key={b.date}>
              <span>
                {day(b.date)}
                {b.note ? <em> {b.note}</em> : null}
              </span>
              <button disabled={busy} onClick={() => send({ action: "remove", date: b.date })}>
                Unblock
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="blocked-note">Days also close on their own when every active chef already has a visit.</p>
    </details>
  );
}
