"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import "./ChefWork.css";
import VisitCompletion from "./VisitCompletion";

type Job = {
  id: number;
  serviceDate: string;
  startTime: string;
  endTime: string;
  household: string;
  dishes: string[];
  dishDetails: { title: string; ingredients: string[]; allergens: string[] }[];
  customer: { phone: string; dietaryNeeds: string; foodsToAvoid: string } | null;
  packageName: string;
  location: string;
  status: string;
  chefPayCents: number;
  notes: string;
};
type Entry = {
  id: number;
  scheduleEventId: number;
  activityType: string;
  label: string;
  startedAt: string;
  endedAt: string;
  mileageHundredths: number;
};
type View = "Today" | "Time & Mileage" | "Earnings";
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
const clock = (stamp: string) =>
  stamp
    ? new Date(stamp).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";
const duration = (entry: Entry) =>
  entry.endedAt
    ? Math.max(
        0,
        new Date(entry.endedAt).getTime() - new Date(entry.startedAt).getTime(),
      )
    : Math.max(0, Date.now() - new Date(entry.startedAt).getTime());
const durationText = (ms: number) =>
  `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;

export default function ChefWork({ view }: { view: View }) {
  const [jobs, setJobs] = useState<Job[]>([]),
    [entries, setEntries] = useState<Entry[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [miles, setMiles] = useState(""),
    [mileNote, setMileNote] = useState("Approved travel");
  const today = dateKey(new Date()),
    range = useMemo(() => {
      const start = new Date();
      start.setDate(start.getDate() - 90);
      const end = new Date();
      end.setDate(end.getDate() + 90);
      return { start: dateKey(start), end: dateKey(end) };
    }, []);
  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(
        `/api/chef/work?start=${range.start}&end=${range.end}`,
        { cache: "no-store" },
      );
      if (response.status === 401 || response.status === 403) {
        window.location.href = "/signin-with-chatgpt?return_to=%2Fchef%2Fworkspace";
        return;
      }
      if (!response.ok) throw new Error();
      const data = (await response.json()) as {
        events: Job[];
        entries: Entry[];
      };
      setJobs(data.events);
      setEntries(data.entries);
    } catch {
      setError(
        "We could not load your work records. Please refresh and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [range]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function toggle(
    activityType: string,
    scheduleEventId = 0,
    label = activityType,
  ) {
    if (
      activityType === "job" &&
      jobs.find((job) => job.id === scheduleEventId)?.status === "in-progress"
    ) {
      setError(
        "Add the required dish and clean-kitchen photos below to complete this visit.",
      );
      return;
    }
    const key = `${activityType}-${scheduleEventId}`;
    setBusy(key);
    setError("");
    try {
      const response = await fetch("/api/chef/work", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          activityType,
          scheduleEventId,
          label,
        }),
      });
      if (!response.ok) throw new Error();
      await load();
    } catch {
      setError("That work event was not saved. Please try again.");
    } finally {
      setBusy("");
    }
  }
  async function addMiles(event: FormEvent) {
    event.preventDefault();
    setBusy("mileage");
    try {
      const response = await fetch("/api/chef/work", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "mileage",
          miles: Number(miles),
          label: mileNote,
          occurredAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error();
      setMiles("");
      await load();
    } catch {
      setError("Enter a valid mileage amount and try again.");
    } finally {
      setBusy("");
    }
  }
  const todayJobs = jobs.filter((job) => job.serviceDate === today),
    open = (type: string, eventId = 0) =>
      entries.find(
        (entry) =>
          entry.activityType === type &&
          entry.scheduleEventId === eventId &&
          !entry.endedAt,
      ),
    workEntries = entries.filter((entry) => entry.activityType !== "mileage"),
    workedMs = workEntries
      .filter((entry) => entry.activityType !== "break")
      .reduce((sum, entry) => sum + duration(entry), 0),
    breakMs = workEntries
      .filter((entry) => entry.activityType === "break")
      .reduce((sum, entry) => sum + duration(entry), 0),
    totalMiles = entries.reduce(
      (sum, entry) => sum + entry.mileageHundredths / 100,
      0,
    ),
    completed = jobs.filter((job) => job.status === "completed"),
    earnings = completed.reduce((sum, job) => sum + job.chefPayCents, 0);
  if (loading)
    return (
      <WorkPage title={view} sub="Loading your real work records…">
        <div className="chef-work-state">Loading…</div>
      </WorkPage>
    );
  if (view === "Today")
    return (
      <WorkPage
        title="Today’s work"
        sub={`${new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })} · ${todayJobs.length} assigned ${todayJobs.length === 1 ? "job" : "jobs"}`}
      >
        {error ? <p className="chef-work-error">{error}</p> : null}
        <section className={`real-clock ${open("day") ? "active" : ""}`}>
          <div>
            <small>DAY TIMECARD</small>
            <strong>{open("day") ? "Clocked in" : "Not clocked in"}</strong>
            <p>Shopping, breaks, and job time save to your actual record.</p>
          </div>
          <div>
            {open("day") ? (
              <button onClick={() => toggle("break", 0, "Break")}>
                {open("break") ? "End break" : "Start break"}
              </button>
            ) : null}
            <button
              className="solid"
              disabled={busy === "day-0"}
              onClick={() => toggle("day", 0, "Workday")}
            >
              {open("day") ? "Clock out" : "Clock in for day"}
            </button>
          </div>
        </section>
        <div className="real-job-list">
          {todayJobs.length ? (
            todayJobs.map((job) => (
              <article key={job.id}>
                <header>
                  <div>
                    <span className={`real-status ${job.status}`}>
                      {job.status.replace("-", " ")}
                    </span>
                    <h2>
                      {job.startTime}{job.endTime ? `–${job.endTime}` : ""} · {job.household}
                    </h2>
                    <p>{job.packageName}</p>
                  </div>
                  <b>
                    {job.chefPayCents ? money(job.chefPayCents) : "Pay pending"}
                  </b>
                </header>
                <section className="job-destination">
                  <div><small>JOB LOCATION</small><strong>{job.location || "Address not entered—contact operations"}</strong></div>
                  {job.location ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`} target="_blank" rel="noreferrer">Open directions →</a> : null}
                </section>
                {job.customer && (job.customer.phone || job.customer.dietaryNeeds || job.customer.foodsToAvoid) ? <section className="job-customer-notes"><small>CUSTOMER DETAILS</small>{job.customer.phone ? <a href={`tel:${job.customer.phone}`}>{job.customer.phone}</a> : null}{job.customer.dietaryNeeds ? <p><b>Dietary needs:</b> {job.customer.dietaryNeeds}</p> : null}{job.customer.foodsToAvoid ? <p><b>Avoid:</b> {job.customer.foodsToAvoid}</p> : null}</section> : null}
                {job.dishDetails.length ? (
                  <div className="today-menu"><small>MENU &amp; SHOPPING LIST</small>{job.dishDetails.map(dish => <details key={dish.title} open><summary>{dish.title}{dish.allergens.length ? <em>Allergens: {dish.allergens.join(", ")}</em> : null}</summary>{dish.ingredients.length ? <ul>{dish.ingredients.map((ingredient,index) => <li key={`${dish.title}-${index}`}>{ingredient}</li>)}</ul> : <p>Ingredient details need confirmation before shopping.</p>}</details>)}</div>
                ) : (
                  <p className="real-empty">
                    No dishes have been attached to this job yet. Contact operations before shopping.
                  </p>
                )}
                {job.notes ? (
                  <p className="real-notes">
                    <b>Operations note:</b> {job.notes}
                  </p>
                ) : null}
                <footer>
                  <button
                    disabled={!!busy || job.status === "completed"}
                    onClick={() => toggle("shopping", job.id)}
                  >
                    {open("shopping", job.id)
                      ? "Finish shopping"
                      : "Start shopping"}
                  </button>
                  <button
                    className="solid"
                    disabled={!!busy || job.status === "completed"}
                    onClick={() => toggle("job", job.id)}
                  >
                    {job.status === "completed"
                      ? "Job completed ✓"
                      : open("job", job.id)
                        ? "Add photos to complete"
                        : "Arrive & start job"}
                  </button>
                </footer>
                {job.status === "in-progress" ? (
                  <VisitCompletion
                    eventId={job.id}
                    household={job.household}
                    dishes={job.dishes}
                    onSaved={load}
                  />
                ) : null}
              </article>
            ))
          ) : (
            <div className="chef-work-state">
              <strong>No jobs assigned today</strong>
              <p>Future assignments are still available under Upcoming.</p>
            </div>
          )}
        </div>
      </WorkPage>
    );
  if (view === "Time & Mileage")
    return (
      <WorkPage
        title="Time & mileage"
        sub="Your saved hours, breaks, job activity, and travel mileage."
      >
        {error ? <p className="chef-work-error">{error}</p> : null}
        <div className="real-metrics">
          <Metric label="WORK TIME" value={durationText(workedMs)} />
          <Metric label="MILEAGE" value={`${totalMiles.toFixed(2)} mi`} />
          <Metric label="BREAKS" value={durationText(breakMs)} />
          <Metric label="ENTRIES" value={String(entries.length)} />
        </div>
        <section className="real-panel">
          <h2>Add approved mileage</h2>
          <form className="mileage-form" onSubmit={addMiles}>
            <label>
              Miles
              <input
                type="number"
                min="0.01"
                max="1000"
                step="0.01"
                value={miles}
                onChange={(event) => setMiles(event.target.value)}
                required
              />
            </label>
            <label>
              Trip note
              <input
                value={mileNote}
                maxLength={160}
                onChange={(event) => setMileNote(event.target.value)}
                required
              />
            </label>
            <button disabled={busy === "mileage"}>Save mileage</button>
          </form>
        </section>
        <section className="real-panel">
          <h2>Recorded activity</h2>
          {entries.length ? (
            <div className="real-table">
              <div className="head">
                <b>Activity</b>
                <b>Start</b>
                <b>End</b>
                <b>Duration / miles</b>
              </div>
              {entries.map((entry) => (
                <div key={entry.id}>
                  <span>{entry.label}</span>
                  <span>{clock(entry.startedAt)}</span>
                  <span>{clock(entry.endedAt)}</span>
                  <span>
                    {entry.activityType === "mileage"
                      ? `${(entry.mileageHundredths / 100).toFixed(2)} mi`
                      : durationText(duration(entry))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="real-empty">
              No time or mileage has been recorded yet.
            </p>
          )}
        </section>
      </WorkPage>
    );
  return (
    <WorkPage
      title="Earnings"
      sub="Completed jobs and the chef pay entered by operations."
    >
      {error ? <p className="chef-work-error">{error}</p> : null}
      <div className="real-metrics">
        <Metric label="RECORDED EARNINGS" value={money(earnings)} />
        <Metric label="COMPLETED JOBS" value={String(completed.length)} />
        <Metric
          label="PAY PENDING"
          value={String(completed.filter((job) => !job.chefPayCents).length)}
        />
      </div>
      <section className="real-panel">
        <h2>Job earnings</h2>
        {completed.length ? (
          <div className="real-table earnings">
            <div className="head">
              <b>Date</b>
              <b>Household</b>
              <b>Package</b>
              <b>Job pay</b>
            </div>
            {completed.map((job) => (
              <div key={job.id}>
                <span>
                  {new Date(`${job.serviceDate}T12:00:00`).toLocaleDateString()}
                </span>
                <span>{job.household}</span>
                <span>{job.packageName}</span>
                <span>
                  {job.chefPayCents
                    ? money(job.chefPayCents)
                    : "Pending admin entry"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="real-empty">
            Completed assigned jobs will appear here automatically.
          </p>
        )}
      </section>
      <p className="pay-note">
        Only completed jobs count toward this total. Payroll review, overtime,
        and reimbursements remain separate.
      </p>
    </WorkPage>
  );
}

function WorkPage({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
      </header>
      <div className="page-body chef-work">{children}</div>
    </>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
