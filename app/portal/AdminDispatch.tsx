"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Visit = {
  id: number;
  serviceDate: string;
  startTime: string;
  endTime: string;
  household: string;
  customerEmail: string;
  dishes: string[];
  chef: string;
  chefEmail: string;
  packageName: string;
  location: string;
  status: string;
  chefPayCents: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};
type Chef = { email: string; fullName: string; role: string; status: string };
const key = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function AdminDispatch({
  onOpenCalendar,
  onOpenPeople,
}: {
  onOpenCalendar: () => void;
  onOpenPeople: () => void;
}) {
  const [visits, setVisits] = useState<Visit[]>([]),
    [chefs, setChefs] = useState<Chef[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(0);
  const today = key(new Date()),
    endDate = useMemo(() => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return key(date);
    }, []);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [scheduleResponse, staffResponse] = await Promise.all([
        fetch(`/api/schedule?start=${today}&end=${endDate}`, {
          cache: "no-store",
        }),
        fetch("/api/staff", { cache: "no-store" }),
      ]);
      if (!scheduleResponse.ok || !staffResponse.ok) throw new Error();
      setVisits(await scheduleResponse.json());
      setChefs(
        (await staffResponse.json()).filter(
          (person: Chef) =>
            person.role === "chef" && person.status === "active",
        ),
      );
    } catch {
      setError(
        "Dispatch could not load. Refresh the page or check staff access.",
      );
    } finally {
      setLoading(false);
    }
  }, [today, endDate]);
  useEffect(() => {
    void load();
  }, [load]);
  async function updateVisit(visit: Visit, changes: Partial<Visit>) {
    setBusy(visit.id);
    setError("");
    const payload = { ...visit, ...changes };
    try {
      const response = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      const saved = (await response.json()) as Visit;
      setVisits((current) =>
        current.map((item) =>
          item.id === visit.id ? { ...item, ...saved } : item,
        ),
      );
    } catch {
      setError("That dispatch change was not saved. Please try again.");
    } finally {
      setBusy(0);
    }
  }
  const todayVisits = visits.filter((visit) => visit.serviceDate === today),
    upcoming = visits.filter((visit) => visit.serviceDate !== today),
    unassigned = visits.filter(
      (visit) => !visit.chefEmail && visit.status !== "cancelled",
    ),
    active = todayVisits.filter((visit) =>
      ["shopping", "in-progress"].includes(visit.status),
    );
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Live dispatch</h1>
          <p>
            Today’s visits, chef coverage, job status, addresses, and menus from
            the operations calendar.
          </p>
        </div>
        <button className="primary-action" onClick={onOpenCalendar}>
          Open calendar
        </button>
      </header>
      <div className="page-body live-dispatch">
        {error ? <p className="dispatch-error">{error}</p> : null}
        <div className="calendar-summary">
          <div>
            <small>TODAY</small>
            <strong>{todayVisits.length}</strong>
            <span>scheduled visits</span>
          </div>
          <div>
            <small>ACTIVE NOW</small>
            <strong>{active.length}</strong>
            <span>shopping or cooking</span>
          </div>
          <div>
            <small>UNASSIGNED</small>
            <strong>{unassigned.length}</strong>
            <span>need chef coverage</span>
          </div>
          <div>
            <small>NEXT 30 DAYS</small>
            <strong>{visits.length}</strong>
            <span>total visits</span>
          </div>
        </div>
        {loading ? (
          <section className="dispatch-state">Loading live schedule…</section>
        ) : visits.length === 0 ? (
          <section className="dispatch-state">
            <h2>No visits on the schedule</h2>
            <p>Add the first meal-prep or private-chef visit in Calendar.</p>
            <button onClick={onOpenCalendar}>Schedule a visit</button>
          </section>
        ) : (
          <>
            <DispatchGroup
              title="Today’s route"
              visits={todayVisits}
              chefs={chefs}
              busy={busy}
              updateVisit={updateVisit}
              onOpenCalendar={onOpenCalendar}
            />
            <DispatchGroup
              title="Coming up"
              visits={upcoming}
              chefs={chefs}
              busy={busy}
              updateVisit={updateVisit}
              onOpenCalendar={onOpenCalendar}
            />
          </>
        )}
        {!loading && chefs.length === 0 ? (
          <aside className="dispatch-no-chefs">
            <strong>No active chefs are available for assignment.</strong>
            <button onClick={onOpenPeople}>Add a chef in People →</button>
          </aside>
        ) : null}
      </div>
    </>
  );
}

function DispatchGroup({
  title,
  visits,
  chefs,
  busy,
  updateVisit,
  onOpenCalendar,
}: {
  title: string;
  visits: Visit[];
  chefs: Chef[];
  busy: number;
  updateVisit: (visit: Visit, changes: Partial<Visit>) => Promise<void>;
  onOpenCalendar: () => void;
}) {
  return (
    <section className="dispatch-group">
      <header>
        <h2>{title}</h2>
        <span>
          {visits.length} visit{visits.length === 1 ? "" : "s"}
        </span>
      </header>
      {visits.length === 0 ? (
        <p className="dispatch-empty">Nothing scheduled here.</p>
      ) : (
        <div>
          {visits.map((visit) => (
            <article key={visit.id}>
              <time>
                <strong>
                  {new Date(`${visit.serviceDate}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </strong>
                <span>
                  {visit.startTime}
                  {visit.endTime ? `–${visit.endTime}` : ""}
                </span>
              </time>
              <div className="dispatch-visit">
                <span className={`real-status ${visit.status}`}>
                  {visit.status.replace("-", " ")}
                </span>
                <h3>{visit.household}</h3>
                <p>
                  {visit.packageName} · {visit.location || "Address needed"}
                </p>
                <small>
                  {visit.dishes.length
                    ? `${visit.dishes.length} dishes: ${visit.dishes.join(", ")}`
                    : "Menu not attached"}
                </small>
              </div>
              <label>
                Assigned chef
                <select
                  value={visit.chefEmail}
                  disabled={busy === visit.id}
                  onChange={(event) => {
                    const chef = chefs.find(
                      (item) => item.email === event.target.value,
                    );
                    void updateVisit(visit, {
                      chefEmail: chef?.email || "",
                      chef: chef?.fullName || "Unassigned",
                    });
                  }}
                >
                  <option value="">Unassigned</option>
                  {chefs.map((chef) => (
                    <option key={chef.email} value={chef.email}>
                      {chef.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={visit.status}
                  disabled={busy === visit.id}
                  onChange={(event) =>
                    void updateVisit(visit, { status: event.target.value })
                  }
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shopping">Shopping</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <button onClick={onOpenCalendar}>Full details</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
