"use client";
import { useEffect, useMemo, useState } from "react";
import { recipes } from "../cookbook/recipes";

type EventItem = {
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
type CustomerDish = { key: string; title: string; type: string };
type CustomerAccount = {
  email: string;
  fullName: string;
  city: string;
  serviceFor: string;
  preferredPackage: string;
};
type StaffChef = {
  email: string;
  fullName: string;
  role: string;
  status: string;
};
const empty = (
  date: string,
): Omit<EventItem, "id" | "createdAt" | "updatedAt"> => ({
  serviceDate: date,
  startTime: "09:00",
  endTime: "12:00",
  household: "",
  customerEmail: "",
  dishes: [],
  chef: "Unassigned",
  chefEmail: "",
  packageName: "Weekly",
  location: "",
  status: "scheduled",
  chefPayCents: 0,
  notes: "",
});
const packages = [
  "Private Chef",
  "Essential · 6",
  "Classic · 8",
  "Weekly · 12",
  "Couples · 16",
  "Household · 20",
  "Family · 24",
];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export default function AdminCalendar({ onOpenPeople }: { onOpenPeople: () => void }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [events, setEvents] = useState<EventItem[]>([]),
    [selectedDate, setSelectedDate] = useState(() => iso(new Date())),
    [editing, setEditing] = useState<
      (EventItem | ReturnType<typeof empty>) | null
    >(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [customerChoices, setCustomerChoices] = useState<CustomerDish[]>([]),
    [choiceMessage, setChoiceMessage] = useState(""),
    [recipeSearch, setRecipeSearch] = useState(""),
    [accounts, setAccounts] = useState<CustomerAccount[]>([]),
    [staffChefs, setStaffChefs] = useState<StaffChef[]>([]);
  const activeChefs = staffChefs.filter(
    (staff) => staff.role === "chef" && staff.status === "active",
  );
  const first = iso(new Date(month.getFullYear(), month.getMonth(), 1)),
    last = iso(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/schedule?start=${first}&end=${last}`)
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = "/signin-with-chatgpt?return_to=%2Fportal";
          throw new Error("signin");
        }
        if (!response.ok) throw new Error("load");
        return response.json();
      })
      .then(setEvents)
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [first, last]);
  useEffect(() => {
    fetch("/api/schedule/accounts")
      .then((response) => (response.ok ? response.json() : []))
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, []);
  useEffect(() => {
    fetch("/api/staff")
      .then((response) => (response.ok ? response.json() : []))
      .then(setStaffChefs)
      .catch(() => setStaffChefs([]));
  }, []);
  useEffect(() => {
    const raw = window.localStorage.getItem("driftlinePrivateChefDraft");
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as Partial<ReturnType<typeof empty>>;
      const date = draft.serviceDate || selectedDate;
      setSelectedDate(date);
      setEditing({ ...empty(date), ...draft });
    } finally {
      window.localStorage.removeItem("driftlinePrivateChefDraft");
    }
  }, []);
  const days = useMemo(() => {
    const leading = new Date(month.getFullYear(), month.getMonth(), 1).getDay(),
      count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: count }, (_, index) => index + 1),
    ];
  }, [month]);
  const selected = events.filter((event) => event.serviceDate === selectedDate);
  const recipeMatches = useMemo(() => {
    const query = recipeSearch.trim().toLowerCase();
    return recipes
      .filter(
        (recipe) =>
          !query ||
          `${recipe.title} ${recipe.category} ${recipe.main} ${recipe.tags.join(" ")}`
            .toLowerCase()
            .includes(query),
      )
      .slice(0, 12);
  }, [recipeSearch]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const isExisting = "id" in editing,
      payload = { ...editing };
    const response = await fetch("/api/schedule", {
      method: isExisting ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 401) {
      window.location.href = "/signin-with-chatgpt?return_to=%2Fportal";
      return;
    }
    if (!response.ok) {
      setError("save");
      return;
    }
    const saved = (await response.json()) as EventItem;
    setEvents((current) =>
      isExisting
        ? current.map((item) =>
            item.id === saved.id ? { ...item, ...saved } : item,
          )
        : [...current, saved].sort((a, b) =>
            (a.serviceDate + a.startTime).localeCompare(
              b.serviceDate + b.startTime,
            ),
          ),
    );
    setSelectedDate(saved.serviceDate);
    setEditing(null);
  }
  async function remove(id: number) {
    if (!window.confirm("Remove this scheduled visit?")) return;
    const response = await fetch(`/api/schedule?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok)
      setEvents((current) => current.filter((item) => item.id !== id));
  }
  const update = (key: string, value: string) =>
    setEditing((current) => (current ? { ...current, [key]: value } : current));
  const assignChef = (email: string) => {
    const chef = activeChefs.find((item) => item.email === email);
    setEditing((current) =>
      current ? { ...current, chef: chef?.fullName || "Unassigned", chefEmail: chef?.email || "" } : current,
    );
  };
  async function loadCustomerChoices(email = editing?.customerEmail || "") {
    if (!email) {
      setChoiceMessage("Choose a customer account first.");
      return;
    }
    setChoiceMessage("Loading customer choices…");
    const response = await fetch(
      `/api/schedule/customer-meals?email=${encodeURIComponent(email)}`,
    );
    if (!response.ok) {
      setChoiceMessage("Could not load this customer’s dishes.");
      return;
    }
    const data = (await response.json()) as { dishes: CustomerDish[] };
    setCustomerChoices(data.dishes);
    setEditing((current) =>
      current
        ? {
            ...current,
            dishes: Array.from(
              new Set([
                ...current.dishes,
                ...data.dishes.map((dish) => dish.title),
              ]),
            ),
          }
        : current,
    );
    setChoiceMessage(
      data.dishes.length
        ? `${data.dishes.length} customer choice${data.dishes.length === 1 ? "" : "s"} loaded and attached.`
        : "This customer has not selected any dishes yet.",
    );
  }
  function chooseAccount(email: string) {
    const account = accounts.find((item) => item.email === email);
    if (!account) return;
    setEditing((current) =>
      current
        ? {
            ...current,
            customerEmail: account.email,
            household: `${account.fullName} household`,
            location: account.city || current.location,
            packageName: account.preferredPackage || current.packageName,
          }
        : current,
    );
    void loadCustomerChoices(account.email);
  }
  const toggleDish = (title: string) =>
    setEditing((current) =>
      current
        ? {
            ...current,
            dishes: current.dishes.includes(title)
              ? current.dishes.filter((dish) => dish !== title)
              : [...current.dishes, title],
          }
        : current,
    );
  const openEditor = (event: EventItem | ReturnType<typeof empty>) => {
    setCustomerChoices([]);
    setChoiceMessage("");
    setRecipeSearch("");
    setEditing(event);
  };
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Operations calendar</h1>
          <p>
            Schedule visits, assign chefs, and attach the dishes selected by
            each household.
          </p>
        </div>
        <button
          className="calendar-add"
          onClick={() => openEditor(empty(selectedDate))}
        >
          + Schedule visit
        </button>
      </header>
      <div className="page-body">
        <div className="calendar-summary">
          <div>
            <small>THIS MONTH</small>
            <strong>{events.length}</strong>
            <span>scheduled visits</span>
          </div>
          <div>
            <small>UNASSIGNED</small>
            <strong>
              {events.filter((event) => event.chef === "Unassigned").length}
            </strong>
            <span>need chef coverage</span>
          </div>
          <div>
            <small>CONFIRMED</small>
            <strong>
              {events.filter((event) => event.status === "confirmed").length}
            </strong>
            <span>households ready</span>
          </div>
          <div>
            <small>COMPLETED</small>
            <strong>
              {events.filter((event) => event.status === "completed").length}
            </strong>
            <span>visits finished</span>
          </div>
        </div>
        {error === "signin" ? (
          <div className="schedule-signin">
            <h2>Staff sign-in required</h2>
            <p>Sign in before opening or changing the operations calendar.</p>
            <a href="/signin-with-chatgpt?return_to=%2Fportal">
              Sign in to continue →
            </a>
          </div>
        ) : (
          <div className="ops-calendar-layout">
            <section className="ops-calendar">
              <header>
                <button
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                    )
                  }
                >
                  ‹
                </button>
                <div>
                  <small>OPERATIONS SCHEDULE</small>
                  <h2>
                    {month.toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                </div>
                <button
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                    )
                  }
                >
                  ›
                </button>
              </header>
              <div className="weekday-row">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <b key={day}>{day}</b>
                  ),
                )}
              </div>
              <div className="month-grid">
                {days.map((day, index) =>
                  day === null ? (
                    <span className="empty-day" key={`empty-${index}`} />
                  ) : (
                    <button
                      key={day}
                      className={`${selectedDate === iso(new Date(month.getFullYear(), month.getMonth(), day)) ? "selected" : ""} ${iso(new Date()) === iso(new Date(month.getFullYear(), month.getMonth(), day)) ? "today" : ""}`}
                      onClick={() =>
                        setSelectedDate(
                          iso(
                            new Date(
                              month.getFullYear(),
                              month.getMonth(),
                              day,
                            ),
                          ),
                        )
                      }
                    >
                      <strong>{day}</strong>
                      <div>
                        {events
                          .filter(
                            (event) =>
                              event.serviceDate ===
                              iso(
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth(),
                                  day,
                                ),
                              ),
                          )
                          .slice(0, 3)
                          .map((event) => (
                            <i
                              className={`event-dot ${event.status}`}
                              key={event.id}
                            >
                              {event.startTime} {event.household}
                            </i>
                          ))}
                      </div>
                      {events.filter(
                        (event) =>
                          event.serviceDate ===
                          iso(
                            new Date(
                              month.getFullYear(),
                              month.getMonth(),
                              day,
                            ),
                          ),
                      ).length > 3 ? (
                        <small>
                          +
                          {events.filter(
                            (event) =>
                              event.serviceDate ===
                              iso(
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth(),
                                  day,
                                ),
                              ),
                          ).length - 3}{" "}
                          more
                        </small>
                      ) : null}
                    </button>
                  ),
                )}
              </div>
            </section>
            <aside className="day-agenda">
              <header>
                <div>
                  <small>DAY SCHEDULE</small>
                  <h2>
                    {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                      "en-US",
                      { weekday: "long", month: "long", day: "numeric" },
                    )}
                  </h2>
                </div>
                <button onClick={() => openEditor(empty(selectedDate))}>
                  +
                </button>
              </header>
              {loading ? (
                <p className="agenda-empty">Loading calendar…</p>
              ) : selected.length === 0 ? (
                <div className="agenda-empty">
                  <strong>No visits scheduled</strong>
                  <p>
                    This day is open. Add a household when you&apos;re ready.
                  </p>
                  <button onClick={() => openEditor(empty(selectedDate))}>
                    Schedule a visit
                  </button>
                </div>
              ) : (
                <div className="agenda-list">
                  {selected.map((event) => (
                    <article key={event.id}>
                      <span className={`agenda-time ${event.status}`}>
                        {event.startTime}
                      </span>
                      <div>
                        <StatusLabel status={event.status} />
                        <h3>{event.household}</h3>
                        <p>
                          {event.packageName} ·{" "}
                          {event.location || "Location pending"}
                        </p>
                        <small>{event.chef}</small>
                        {event.dishes.length ? (
                          <div className="agenda-dishes">
                            <b>COOKING TODAY</b>
                            {event.dishes.map((dish) => (
                              <span key={dish}>• {dish}</span>
                            ))}
                          </div>
                        ) : (
                          <div className="agenda-dishes empty">
                            <span>No dishes attached yet</span>
                          </div>
                        )}
                        <div>
                          <button onClick={() => openEditor(event)}>
                            Edit
                          </button>
                          <button onClick={() => remove(event.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
      {editing ? (
        <div
          className="schedule-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-title"
        >
          <form onSubmit={save}>
            <button
              className="schedule-close"
              type="button"
              onClick={() => setEditing(null)}
            >
              ×
            </button>
            <small>DRIFTLINE OPERATIONS</small>
            <h2 id="schedule-title">
              {"id" in editing ? "Edit scheduled visit" : "Schedule a visit"}
            </h2>
            <div className="schedule-form-grid">
              <label>
                Date
                <input
                  type="date"
                  value={editing.serviceDate}
                  onChange={(e) => update("serviceDate", e.target.value)}
                  required
                />
              </label>
              <label>
                Status
                <select
                  value={editing.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shopping">Shopping</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label>
                Start time
                <input
                  type="time"
                  value={editing.startTime}
                  onChange={(e) => update("startTime", e.target.value)}
                  required
                />
              </label>
              <label>
                End time
                <input
                  type="time"
                  value={editing.endTime}
                  onChange={(e) => update("endTime", e.target.value)}
                />
              </label>
              <label>
                Household
                <input
                  value={editing.household}
                  onChange={(e) => update("household", e.target.value)}
                  placeholder="Barella household"
                  required
                />
              </label>
              <label>
                Location
                <input
                  value={editing.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="Astoria"
                />
              </label>
              <label>
                Assigned chef
                <select
                  value={editing.chefEmail}
                  onChange={(e) => assignChef(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {activeChefs.map((chef) => (
                    <option key={chef.email} value={chef.email}>{chef.fullName}</option>
                  ))}
                </select>
                {activeChefs.length === 0 ? <small className="chef-picker-help">No active chefs yet. <button type="button" onClick={onOpenPeople}>Add a chef in People</button></small> : null}
              </label>
              <label>
                Package
                <select
                  value={editing.packageName}
                  onChange={(e) => update("packageName", e.target.value)}
                >
                  {packages.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <section className="customer-dish-picker">
              <div>
                <label>
                  Customer account
                  <select
                    value={editing.customerEmail}
                    onChange={(e) => chooseAccount(e.target.value)}
                  >
                    <option value="">Select a customer account…</option>
                    {accounts.map((account) => (
                      <option key={account.email} value={account.email}>
                        {account.fullName} · {account.serviceFor}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={() => loadCustomerChoices()}>
                  Refresh choices
                </button>
              </div>
              {accounts.length === 0 ? (
                <p>
                  No customer accounts have been created yet. Once a customer
                  completes their profile, their name will appear here.
                </p>
              ) : null}
              {choiceMessage ? <p>{choiceMessage}</p> : null}
              {customerChoices.length ? (
                <div className="dish-options">
                  {customerChoices.map((dish) => (
                    <label key={dish.key}>
                      <input
                        type="checkbox"
                        checked={editing.dishes.includes(dish.title)}
                        onChange={() => toggleDish(dish.title)}
                      />
                      <span>
                        <strong>{dish.title}</strong>
                        <small>{dish.type}</small>
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}
              <div className="calendar-recipe-picker">
                <header>
                  <div>
                    <strong>Choose from the cookbook</strong>
                    <small>
                      Select dishes directly while building this calendar visit.
                    </small>
                  </div>
                  <input
                    type="search"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder="Search 100 recipes…"
                    aria-label="Search cookbook recipes"
                  />
                </header>
                <div>
                  {recipeMatches.map((recipe) => (
                    <button
                      type="button"
                      key={recipe.id}
                      className={
                        editing.dishes.includes(recipe.title) ? "selected" : ""
                      }
                      onClick={() => toggleDish(recipe.title)}
                    >
                      <img src={recipe.image} alt="" />
                      <span>
                        <strong>{recipe.title}</strong>
                        <small>
                          {recipe.category} · {recipe.total} min
                        </small>
                      </span>
                      <b>{editing.dishes.includes(recipe.title) ? "✓" : "+"}</b>
                    </button>
                  ))}
                </div>
              </div>
              <label>
                Dishes for this visit
                <textarea
                  value={editing.dishes.join("\n")}
                  onChange={(e) =>
                    setEditing((current) =>
                      current
                        ? {
                            ...current,
                            dishes: e.target.value
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          }
                        : current,
                    )
                  }
                  placeholder="One dish per line. Choose from the cookbook above or type a special request."
                />
              </label>
            </section>
            <label>
              Operations notes
              <textarea
                value={editing.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Access instructions, allergy flags, shopping timing, or coverage notes."
              />
            </label>
            <button className="schedule-save">
              {"id" in editing ? "Save changes" : "Add to calendar"} →
            </button>
          </form>
        </div>
      ) : null}
      {editing ? (
        <aside className="schedule-pay-field">
          <label>
            Chef pay for this visit ($)
            <input
              type="number"
              min="0"
              max="10000"
              step="0.01"
              value={editing.chefPayCents / 100}
              onChange={(event) =>
                setEditing((current) =>
                  current
                    ? {
                        ...current,
                        chefPayCents: Math.round(
                          Math.max(0, Number(event.target.value) || 0) * 100,
                        ),
                      }
                    : current,
                )
              }
            />
          </label>
          <small>
            This appears in the assigned chef&apos;s earnings after the job is
            completed.
          </small>
        </aside>
      ) : null}
    </>
  );
}
function StatusLabel({ status }: { status: string }) {
  return (
    <span className={`calendar-status ${status}`}>
      {status.replace("-", " ")}
    </span>
  );
}
