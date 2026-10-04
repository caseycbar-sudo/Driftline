"use client";

import Link from "next/link";
import { useState } from "react";
import DishBackdrop from "../DishBackdrop";
import DayPicker from "./DayPicker";
import { BUSINESS_PHONE, CANCELLATION_POLICY, MAX_WINDOWS, MIN_LEAD_HOURS, OUTSIDE_AREA, REQUEST_RESPONSE_HOURS, SERVICE_CITIES, TIME_PRESETS } from "../../request-core";

type Win = { date: string; from: string; to: string };
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const dayLabel = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
const byDate = (a: Win, b: Win) => (a.date + a.from).localeCompare(b.date + b.from);

export default function ScheduleForm(props: {
  recipeIds: number[];
  dishes: string[];
  people: number;
  planName: string;
  priceCents: number;
  editId: number;
  initial: { windows: Win[]; address: string; kitchenNotes: string; accessNotes: string } | null;
  profile: { address: string; city: string; accessNotes: string; kitchenNotes: string; gaps: string[] };
  earliest: string;
  latest: string;
  unavailable: string[];
  needsCard: boolean;
  backdrop: string[];
}) {
  const { profile, initial } = props;
  const [windows, setWindows] = useState<Win[]>(initial?.windows ?? []),
    [other, setOther] = useState(Boolean(initial?.address)),
    [address, setAddress] = useState(initial?.address ?? ""),
    [city, setCity] = useState(profile.city),
    [access, setAccess] = useState(initial?.accessNotes ?? profile.accessNotes),
    [kitchen, setKitchen] = useState(initial?.kitchenNotes ?? profile.kitchenNotes),
    [policy, setPolicy] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [waitlisted, setWaitlisted] = useState(false);
  const outside = city === OUTSIDE_AREA || (Boolean(city) && !SERVICE_CITIES.some((c) => c === city));
  const set = (i: number, patch: Partial<Win>) => setWindows((w) => w.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const toggleDate = (date: string) =>
    setWindows((w) =>
      w.some((x) => x.date === date)
        ? w.filter((x) => x.date !== date)
        : w.length >= MAX_WINDOWS
          ? w
          : [...w, { date, from: TIME_PRESETS[0].from, to: TIME_PRESETS[0].to }].sort(byDate),
    );

  async function joinWaitlist() {
    const response = await fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "waitlist", city: city === OUTSIDE_AREA ? address || "another area" : city }) });
    if (response.ok) setWaitlisted(true);
    else setError("We couldn't save that. Please try again.");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!windows.length) {
      setError("Tap at least one day on the calendar that works for you.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: props.editId ? "change" : "create",
          id: props.editId,
          recipeIds: props.recipeIds,
          people: props.people,
          windows,
          address: other ? address : "",
          city,
          accessNotes: access,
          kitchenNotes: kitchen,
          acceptedPolicy: policy,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "We couldn't send that. Please try again.");
      window.location.href = "/account?sent=1";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't send that. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="account-page plan-page has-dishes">
      <DishBackdrop images={props.backdrop} />
      <header className="account-nav">
        <Link className="account-brand" href="/account">
          Driftline
        </Link>
        <nav>
          <Link href="/account">My account</Link>
        </nav>
      </header>
      <form className="profile-form schedule-form" onSubmit={submit}>
        <div className="form-heading">
          <div>
            <span>{props.editId ? "Change your visit" : "Schedule your prep"}</span>
            <h2>When can we come?</h2>
          </div>
          <p>
            {props.planName} · {money(props.priceCents)} · {props.dishes.length} dishes for {props.people} {props.people === 1 ? "person" : "people"}. <Link href={`/account/plan?items=${props.recipeIds.join(",")}&people=${props.people}${props.editId ? `&edit=${props.editId}` : ""}`}>Change menu</Link>
          </p>
        </div>
        <p>{props.dishes.join(", ")}</p>

        {profile.gaps.length ? (
          <p className="plan-warning">
            Add {profile.gaps.join(", ")} to <Link href="/account#profile">your profile</Link> before sending a request.
          </p>
        ) : null}

        {props.needsCard ? (
          <p className="plan-warning">
            Save a card under <Link href="/account#billing">Card &amp; receipts</Link> before sending a request. It is only charged after your visit is done, for the package price plus groceries.
          </p>
        ) : null}

        <p className="plan-note schedule-callout">
          <strong>This is a request, not a booking yet.</strong> Tell us when you could be home. We will match you with a chef and confirm within {REQUEST_RESPONSE_HOURS} hours. Sending this does not charge you.
        </p>

        <fieldset>
          <legend>Days that work for you</legend>
          <p className="plan-note">
            Tap up to {MAX_WINDOWS} days. The more options you give us, the faster we can book you. We need at least {MIN_LEAD_HOURS} hours of notice. Greyed out days are not available. If you need one of those, call or text us at {BUSINESS_PHONE}.
          </p>
          <DayPicker earliest={props.earliest} latest={props.latest} unavailable={props.unavailable} selected={windows.map((w) => w.date)} full={windows.length >= MAX_WINDOWS} onToggle={toggleDate} />
          {windows.length ? <h3 className="schedule-sub">What part of each day?</h3> : null}
          {windows.map((w, i) => {
            const preset = TIME_PRESETS.find((p) => p.from === w.from && p.to === w.to);
            return (
              <div className="schedule-window" key={w.date + i}>
                <strong>{dayLabel(w.date)}</strong>
                <div className="schedule-presets" role="group" aria-label={`Time of day on ${dayLabel(w.date)}`}>
                  {TIME_PRESETS.map((p) => (
                    <button type="button" key={p.key} className={preset?.key === p.key ? "on" : ""} aria-pressed={preset?.key === p.key} onClick={() => set(i, { from: p.from, to: p.to })}>
                      {p.label}
                      <small>{p.sub}</small>
                    </button>
                  ))}
                </div>
                <details open={!preset}>
                  <summary>Set exact times</summary>
                  <div className="schedule-exact">
                    <input type="time" step={1800} value={w.from} onChange={(e) => set(i, { from: e.target.value })} required aria-label="From" />
                    <span>to</span>
                    <input type="time" step={1800} value={w.to} onChange={(e) => set(i, { to: e.target.value })} required aria-label="To" />
                    <small>At least 3 hours, so your chef has room to cook.</small>
                  </div>
                </details>
                <button type="button" className="schedule-remove" onClick={() => toggleDate(w.date)}>
                  Remove this day
                </button>
              </div>
            );
          })}
        </fieldset>

        <fieldset>
          <legend>Where</legend>
          <p>{profile.address ? `Your home address: ${profile.address}, ${profile.city}` : "No home address on file yet."}</p>
          <label className="check">
            <input type="checkbox" checked={other} onChange={(e) => setOther(e.target.checked)} /> Use a different address for this visit
          </label>
          {other ? (
            <div className="visit-grid">
              <label className="wide">
                Address for this visit
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Marine Dr, Astoria, OR 97103" />
              </label>
              <label>
                City
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">Choose a city</option>
                  {SERVICE_CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                  <option>{OUTSIDE_AREA}</option>
                </select>
              </label>
            </div>
          ) : null}
          {outside ? (
            <p className="plan-warning">
              We don&apos;t serve that area yet. We cover {SERVICE_CITIES.join(", ")}. We can let you know when that changes.{" "}
              {waitlisted ? (
                <strong>Thank you, we have your email and will be in touch.</strong>
              ) : (
                <button type="button" className="link" onClick={joinWaitlist}>
                  Tell me when you serve my area
                </button>
              )}
            </p>
          ) : null}
        </fieldset>

        <div className="visit-grid">
          <label>
            Getting in
            <textarea value={access} onChange={(e) => setAccess(e.target.value)} placeholder="Door code, parking, pets." />
          </label>
          <label>
            Your kitchen
            <textarea value={kitchen} onChange={(e) => setKitchen(e.target.value)} placeholder="Anything the chef should know." />
          </label>
        </div>

        <label className="wide check">
          <input type="checkbox" checked={policy} onChange={(e) => setPolicy(e.target.checked)} required /> {CANCELLATION_POLICY}
        </label>

        {error ? <p className="plan-warning" role="alert">{error}</p> : null}
        <div className="save-row">
          <button disabled={busy || outside || profile.gaps.length > 0 || props.needsCard || windows.length === 0}>{busy ? "Sending…" : props.editId ? "Send change request" : "Send request"}<span>→</span></button>
          <p>Nothing is booked yet. We&apos;ll confirm within {REQUEST_RESPONSE_HOURS} hours.</p>
        </div>
      </form>
    </main>
  );
}
