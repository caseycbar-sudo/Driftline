"use client";

import { useCallback, useEffect, useState } from "react";

type Window = { date: string; from: string; to: string };
type Card = {
  id: number;
  status: "requested" | "change_requested";
  dishes: string[];
  people: number;
  packageName: string;
  priceCents: number;
  address: string;
  city: string;
  windows: Window[];
  accessNotes: string;
  kitchenNotes: string;
  createdAt: string;
  customer: { name: string; email: string; phone: string; city: string; householdSize: number; dietaryNeeds: string; foodsToAvoid: string; noAllergies: boolean };
  currentVisit: { id: number; serviceDate: string; startTime: string; endTime: string; chef: string; chefEmail: string } | null;
  blocks: (Window & { starts: string[] })[];
};
type Waiting = { id: number; serviceDate: string; startTime: string; endTime: string; household: string; chef: string; chefEmail: string; chefResponse: string };
type ChefChoice = { email: string; fullName: string; busy: boolean; clashWith: string[] };

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const day = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const clock = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export default function NewRequests() {
  const [cards, setCards] = useState<Card[]>([]),
    [waiting, setWaiting] = useState<Waiting[]>([]),
    [error, setError] = useState(""),
    [open, setOpen] = useState(0);
  const [tick, setTick] = useState(0);
  const load = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    let live = true;
    fetch("/api/admin/requests", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<{ requests: Card[]; awaitingChef: Waiting[] }>) : Promise.reject(new Error("load"))))
      .then((data) => {
        if (!live) return;
        setCards(data.requests);
        setWaiting(data.awaitingChef);
        setError("");
      })
      .catch(() => live && setError("New requests could not load. Refresh the page."));
    return () => {
      live = false;
    };
  }, [tick]);

  return (
    <section className="request-inbox" aria-label="New requests">
      <header>
        <div>
          <small>NEW REQUESTS</small>
          <h2>
            {cards.length ? `${cards.length} waiting for you` : "No new requests"}
          </h2>
        </div>
      </header>
      {error ? <p className="dispatch-error">{error}</p> : null}
      {cards.map((card) => (
        <RequestCard key={card.id} card={card} open={open === card.id} toggle={() => setOpen(open === card.id ? 0 : card.id)} done={load} />
      ))}
      {waiting.length ? (
        <div className="request-waiting">
          <small>WAITING ON A CHEF</small>
          {waiting.map((visit) => (
            <WaitingRow key={visit.id} visit={visit} done={load} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function RequestCard({ card, open, toggle, done }: { card: Card; open: boolean; toggle: () => void; done: () => void }) {
  const [pick, setPick] = useState<{ date: string; start: string; end: string } | null>(null),
    [chefs, setChefs] = useState<ChefChoice[]>([]),
    [chef, setChef] = useState(""),
    [note, setNote] = useState(""),
    [mode, setMode] = useState<"" | "suggest" | "decline">(""),
    [times, setTimes] = useState<Window[]>([{ date: "", from: "09:00", to: "13:00" }]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");

  async function choose(date: string, start: string, minutes = 180) {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const end = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    setPick({ date, start, end });
    setChef("");
    setError("");
    const response = await fetch(`/api/admin/requests?date=${date}&start=${start}&end=${end}&ignore=${card.currentVisit?.id ?? 0}`, { cache: "no-store" });
    if (response.ok) setChefs(((await response.json()) as { chefs: ChefChoice[] }).chefs);
  }

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: card.id, ...body }) });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "That didn't save.");
      done();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  const c = card.customer;
  const hasAllergy = Boolean(c.dietaryNeeds || c.foodsToAvoid);
  return (
    <article className={`request-card ${open ? "open" : ""}`}>
      <button className="request-summary" onClick={toggle} aria-expanded={open}>
        <span>
          <strong>{c.name}</strong>
          {card.status === "change_requested" ? <b className="request-tag">Change request</b> : null}
        </span>
        <span>
          {card.dishes.length} dishes · {card.people} {card.people === 1 ? "person" : "people"} · {card.packageName} {money(card.priceCents)}
        </span>
        <i>{open ? "−" : "+"}</i>
      </button>
      {open ? (
        <div className="request-body">
          <section>
            <small>CUSTOMER</small>
            <p>
              {c.name} · {c.email}
              {c.phone ? ` · ${c.phone}` : ""}
            </p>
            <p>{[card.address, card.city].filter(Boolean).join(", ")}</p>
            <p className={hasAllergy ? "request-alert" : ""}>
              {hasAllergy ? `Allergies and diet: ${[c.dietaryNeeds, c.foodsToAvoid && `avoid ${c.foodsToAvoid}`].filter(Boolean).join("; ")}` : c.noAllergies ? "Customer confirmed: no allergies." : "No allergy answer on file."}
            </p>
            {card.accessNotes ? <p>Access: {card.accessNotes}</p> : null}
            {card.kitchenNotes ? <p>Kitchen: {card.kitchenNotes}</p> : null}
          </section>
          <section>
            <small>MENU</small>
            <p>{card.dishes.join(", ")}</p>
          </section>
          {card.currentVisit ? (
            <section>
              <small>CURRENTLY BOOKED</small>
              <p>
                {day(card.currentVisit.serviceDate)}, {clock(card.currentVisit.startTime)} with {card.currentVisit.chef || "no chef"}. Approving a new time moves this visit.
              </p>
            </section>
          ) : null}
          <section>
            <small>TIMES THE CUSTOMER CAN DO (PICK A START)</small>
            {card.blocks.map((block) => (
              <div className="request-block" key={`${block.date}${block.from}`}>
                <strong>
                  {day(block.date)}, {clock(block.from)} to {clock(block.to)}
                </strong>
                <div>
                  {block.starts.map((start) => (
                    <button key={start} className={pick?.date === block.date && pick.start === start ? "on" : ""} onClick={() => choose(block.date, start)}>
                      {clock(start)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
          {pick ? (
            <section>
              <small>
                ASSIGN A CHEF · {day(pick.date)}, {clock(pick.start)} to {clock(pick.end)}
              </small>
              {chefs.length ? (
                <div className="request-chefs">
                  {chefs.map((option) => (
                    <label key={option.email} className={option.busy ? "busy" : ""}>
                      <input type="radio" name={`chef-${card.id}`} checked={chef === option.email} onChange={() => setChef(option.email)} /> {option.fullName}
                      {option.busy ? ` (booked: ${option.clashWith.join(", ")})` : " (free)"}
                    </label>
                  ))}
                </div>
              ) : (
                <p>No active chefs yet. Add one under People.</p>
              )}
              <button
                className="primary-action"
                disabled={busy || !chef}
                onClick={() => send({ action: "approve", date: pick.date, startTime: pick.start, chefEmail: chef, note, force: chefs.find((x) => x.email === chef)?.busy === true })}
              >
                {busy ? "Saving…" : "Approve and send to chef"}
              </button>
              <p className="request-hint">The chef gets an email and has to accept. The customer is told once the chef accepts.</p>
            </section>
          ) : null}
          <section>
            <small>CAN&apos;T MAKE IT WORK?</small>
            <div className="request-actions">
              <button onClick={() => setMode(mode === "suggest" ? "" : "suggest")}>Suggest other times</button>
              <button onClick={() => setMode(mode === "decline" ? "" : "decline")}>Decline</button>
            </div>
            {mode ? (
              <div className="request-form">
                {mode === "suggest"
                  ? times.map((t, i) => (
                      <div key={i}>
                        <input type="date" value={t.date} onChange={(e) => setTimes(times.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} />
                        <input type="time" value={t.from} onChange={(e) => setTimes(times.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))} />
                        <input type="time" value={t.to} onChange={(e) => setTimes(times.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))} />
                      </div>
                    ))
                  : null}
                {mode === "suggest" && times.length < 5 ? <button onClick={() => setTimes([...times, { date: "", from: "09:00", to: "13:00" }])}>Add another time</button> : null}
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A note for the customer" rows={3} />
                <button className="primary-action" disabled={busy} onClick={() => send(mode === "suggest" ? { action: "suggest", note, times: times.filter((t) => t.date) } : { action: "decline", note })}>
                  {mode === "suggest" ? "Send to customer" : "Decline and tell the customer"}
                </button>
              </div>
            ) : null}
          </section>
          {error ? <p className="dispatch-error">{error}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function WaitingRow({ visit, done }: { visit: Waiting; done: () => void }) {
  const [chefs, setChefs] = useState<ChefChoice[]>([]),
    [show, setShow] = useState(false),
    [error, setError] = useState("");
  async function toggle() {
    setShow(!show);
    if (!show) {
      const response = await fetch(`/api/admin/requests?date=${visit.serviceDate}&start=${visit.startTime}&end=${visit.endTime}&ignore=${visit.id}`, { cache: "no-store" });
      if (response.ok) setChefs(((await response.json()) as { chefs: ChefChoice[] }).chefs);
    }
  }
  async function reassign(chefEmail: string, force: boolean) {
    setError("");
    const response = await fetch("/api/admin/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "reassign", eventId: visit.id, chefEmail, force }) });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) return setError(data.error || "That didn't save.");
    setShow(false);
    done();
  }
  const declined = !visit.chefEmail;
  return (
    <div className="request-wait-row">
      <span>
        <strong>{visit.household}</strong> {day(visit.serviceDate)}, {clock(visit.startTime)} · {declined ? "needs a chef" : `waiting on ${visit.chef}`}
      </span>
      <button onClick={toggle}>{declined ? "Choose chef" : "Pick someone else"}</button>
      {show ? (
        <div className="request-chefs">
          {chefs.map((c) => (
            <button key={c.email} onClick={() => reassign(c.email, c.busy)}>
              {c.fullName} {c.busy ? "(booked)" : "(free)"}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="dispatch-error">{error}</p> : null}
    </div>
  );
}
