"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { STATUS_LABELS, isOpenForCustomerChange, type RequestStatus } from "../request-core";

type Win = { date: string; from: string; to: string };
type Req = {
  id: number;
  status: RequestStatus;
  recipeIds: number[];
  dishes: string[];
  people: number;
  packageName: string;
  windows: Win[];
  adminNote: string;
  suggestedTimes: Win[];
  visit?: { id: number; serviceDate: string; startTime: string; endTime: string; chefFirstName: string; status: string } | null;
};

const day = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const clock = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const span = (w: Win) => `${day(w.date)}, ${clock(w.from)} to ${clock(w.to)}`;

export default function SessionCards({ sent }: { sent: boolean }) {
  const [requests, setRequests] = useState<Req[] | null>(null),
    [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const load = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    let live = true;
    fetch("/api/requests", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<Req[]>) : Promise.reject(new Error("load"))))
      .then((data) => live && setRequests(data))
      .catch(() => live && setError("We couldn't load your sessions. Refresh the page."));
    return () => {
      live = false;
    };
  }, [tick]);

  async function cancel(r: Req) {
    if (!window.confirm("Cancel this session request?")) return;
    setError("");
    const response = await fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "cancel", id: r.id }) });
    if (!response.ok) setError(((await response.json()) as { error?: string }).error || "That didn't save.");
    load();
  }

  if (!requests) return <section className="session-cards"><p>{error || "Loading your sessions…"}</p></section>;
  const active = requests.filter((r) => r.status !== "declined" || r.adminNote);
  const when = (r: Req) => (r.visit ? `${r.visit.serviceDate} ${r.visit.startTime}` : r.windows[0] ? `${r.windows[0].date} ${r.windows[0].from}` : "");
  const sorted = [...active].sort((a, b) => when(a).localeCompare(when(b)));
  const next = sorted[0];
  const later = sorted.slice(1);

  return (
    <>
      <section className="session-cards">
        <span>NEXT SESSION</span>
        {sent ? <p className="plan-note">Thanks! We received your request.</p> : null}
        {error ? <p className="plan-warning">{error}</p> : null}
        {next ? <Card r={next} cancel={cancel} /> : (
          <div className="empty-meals">
            <b>Nothing scheduled yet.</b>
            <p>Pick 3 to 5 dishes and tell us when you&apos;re free.</p>
            <Link href="/account/plan">Plan a session →</Link>
          </div>
        )}
      </section>
      {later.length ? (
        <section className="session-cards">
          <span>LATER SESSIONS</span>
          {later.map((r) => (
            <Card key={r.id} r={r} cancel={cancel} />
          ))}
        </section>
      ) : null}
      <section className="session-cards">
        <Link className="plan-schedule" href="/account/plan">
          + Schedule a new session
        </Link>
      </section>
    </>
  );
}

function Card({ r, cancel }: { r: Req; cancel: (r: Req) => void }) {
  const open = isOpenForCustomerChange(r.status);
  const resched = `/account/schedule?items=${r.recipeIds.join(",")}&people=${r.people}&edit=${r.id}`;
  return (
    <article className={`session-card status-${r.status}`}>
      <header>
        <b>{r.status === "scheduled" && r.visit ? `${day(r.visit.serviceDate)}, ${clock(r.visit.startTime)}` : "Meal prep session"}</b>
        <small>{r.status === "scheduled" ? "Scheduled" : STATUS_LABELS[r.status]}</small>
      </header>
      {r.status === "requested" || r.status === "awaiting_chef" ? <p>We received your request and will update you when it&apos;s scheduled.</p> : null}
      {r.status === "change_requested" ? <p>We received your change request. Your current time stands until we confirm.</p> : null}
      {r.status === "scheduled" && r.visit ? (
        <p>
          {clock(r.visit.startTime)} to {clock(r.visit.endTime)}
          {r.visit.chefFirstName ? ` · Your chef: ${r.visit.chefFirstName}` : ""}
        </p>
      ) : null}
      {r.status === "needs_new_time" || r.status === "declined" ? (
        <>
          {r.adminNote ? <p className="plan-warning">{r.adminNote}</p> : null}
          {r.suggestedTimes.length ? <p>We can do: {r.suggestedTimes.map(span).join("; ")}</p> : null}
        </>
      ) : null}
      <p>
        {r.dishes.join(", ")} · {r.packageName} for {r.people} {r.people === 1 ? "person" : "people"}
      </p>
      {!r.visit && r.windows.length ? <small>You offered: {r.windows.map(span).join("; ")}</small> : null}
      {open ? (
        <footer>
          <Link href={`/account/plan?edit=${r.id}`}>Edit menu</Link>
          <Link href={resched}>{r.status === "needs_new_time" ? "Choose new times" : "Reschedule"}</Link>
          <button onClick={() => cancel(r)}>Cancel</button>
        </footer>
      ) : (
        <footer>
          <Link href={`/account/schedule?items=${r.recipeIds.join(",")}&people=${r.people}`}>Book this menu again</Link>
        </footer>
      )}
    </article>
  );
}
