"use client";

import Link from "next/link";
import { useState } from "react";
import { CANCELLATION_POLICY, MAX_WINDOWS, MIN_LEAD_HOURS, OUTSIDE_AREA, REQUEST_RESPONSE_HOURS, SERVICE_CITIES } from "../../request-core";

type Win = { date: string; from: string; to: string };
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const blank = (): Win => ({ date: "", from: "09:00", to: "13:00" });

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
}) {
  const { profile, initial } = props;
  const [windows, setWindows] = useState<Win[]>(initial?.windows.length ? initial.windows : [blank()]),
    [other, setOther] = useState(Boolean(initial?.address)),
    [address, setAddress] = useState(initial?.address ?? ""),
    [city, setCity] = useState(profile.city),
    [access, setAccess] = useState(initial?.accessNotes ?? profile.accessNotes),
    [kitchen, setKitchen] = useState(initial?.kitchenNotes ?? profile.kitchenNotes),
    [policy, setPolicy] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const outside = city === OUTSIDE_AREA || (Boolean(city) && !SERVICE_CITIES.some((c) => c === city));
  const set = (i: number, patch: Partial<Win>) => setWindows((w) => w.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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
    <main className="account-page plan-page">
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

        <fieldset>
          <legend>Times that work for you</legend>
          <p className="plan-note">
            Give us up to {MAX_WINDOWS} windows of at least 3 hours, between {props.earliest} and {props.latest}. We need at least {MIN_LEAD_HOURS} hours of notice.
          </p>
          {windows.map((w, i) => (
            <div className="schedule-window" key={i}>
              <input type="date" min={props.earliest} max={props.latest} value={w.date} onChange={(e) => set(i, { date: e.target.value })} required aria-label="Date" />
              <input type="time" step={1800} value={w.from} onChange={(e) => set(i, { from: e.target.value })} required aria-label="From" />
              <span>to</span>
              <input type="time" step={1800} value={w.to} onChange={(e) => set(i, { to: e.target.value })} required aria-label="To" />
              {windows.length > 1 ? (
                <button type="button" onClick={() => setWindows((x) => x.filter((_, j) => j !== i))}>
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          {windows.length < MAX_WINDOWS ? (
            <button type="button" onClick={() => setWindows((x) => [...x, blank()])}>
              + Add another time
            </button>
          ) : null}
        </fieldset>

        <fieldset>
          <legend>Where</legend>
          <p>{profile.address ? `Your home address: ${profile.address}, ${profile.city}` : "No home address on file yet."}</p>
          <label>
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
              We don&apos;t serve that area yet. We cover {SERVICE_CITIES.join(", ")}. Email us and we&apos;ll let you know when that changes.
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

        <label className="wide">
          <input type="checkbox" checked={policy} onChange={(e) => setPolicy(e.target.checked)} required /> {CANCELLATION_POLICY}
        </label>

        {error ? <p className="plan-warning" role="alert">{error}</p> : null}
        <div className="save-row">
          <button disabled={busy || outside || profile.gaps.length > 0}>{busy ? "Sending…" : props.editId ? "Send change request" : "Send request"}<span>→</span></button>
          <p>Nothing is booked yet. We&apos;ll confirm within {REQUEST_RESPONSE_HOURS} hours.</p>
        </div>
      </form>
    </main>
  );
}
