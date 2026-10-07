"use client";

import { useState } from "react";
import "./portal.css";
import AdminCalendar from "./AdminCalendar";
import ChefSchedule from "./ChefSchedule";
import ChefWork from "./ChefWork";
import StaffManager from "./StaffManager";
import PrivateChefLeads from "./PrivateChefLeads";
import AdminDispatch from "./AdminDispatch";
import MarketControl from "./MarketControl";
import BillingManager from "./BillingManager";
import CookbookManager from "./CookbookManager";
import ReviewsManager from "./ReviewsManager";
import DisclosureGate from "../disclosures/DisclosureGate";
import BrandLogo from "../BrandLogo";
import ChefFieldApp from "./ChefFieldApp";
import Link from "next/link";

type Role = "chef" | "admin";
type Notice = { title: string; detail: string } | null;

const recipes = [
  {
    name: "Cider-braised chicken",
    portions: 12,
    active: 35,
    total: 95,
    allergens: "None",
    ingredients: [
      ["Chicken thighs", "6 lb"],
      ["Yukon potatoes", "4.5 lb"],
      ["Apple cider", "3 cups"],
      ["Green beans", "3 lb"],
    ],
  },
  {
    name: "Coastal salmon cakes",
    portions: 12,
    active: 45,
    total: 70,
    allergens: "Fish, egg",
    ingredients: [
      ["Salmon", "4.5 lb"],
      ["Rice", "4 cups"],
      ["Eggs", "6"],
      ["Lemon", "3"],
    ],
  },
  {
    name: "Slow-cooked beef ragù",
    portions: 12,
    active: 30,
    total: 180,
    allergens: "Dairy",
    ingredients: [
      ["Beef chuck", "5 lb"],
      ["Tomatoes", "6 cups"],
      ["Polenta", "4 cups"],
      ["Carrots", "3 lb"],
    ],
  },
];

const chefTabs = ["Today", "Upcoming", "Recipes", "Time & Mileage", "Earnings"];
const adminTabs = ["Dispatch", "Calendar", "Requests", "Billing", "Cookbook", "Market", "Reviews", "People"];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="p-icon" aria-hidden="true">
      {children}
    </span>
  );
}
function Status({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span className={`status ${tone}`}>
      <i />
      {children}
    </span>
  );
}

export default function Portal({
  staff,
}: {
  staff: { email: string; fullName: string; role: Role };
}) {
  // Each workspace is its own component so that neither one's hooks are
  // skipped when the other renders.
  if (staff.role === "chef") return <ChefFieldApp staff={staff} />;
  return <AdminPortal staff={staff} />;
}

function AdminPortal({
  staff,
}: {
  staff: { email: string; fullName: string; role: Role };
}) {
  const role = staff.role;
  const [tab, setTab] = useState(role === "chef" ? "Today" : "Dispatch");
  const [notice, setNotice] = useState<Notice>(null);
  const [clocked, setClocked] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [portions, setPortions] = useState(12);
  const tabs = role === "chef" ? chefTabs : adminTabs;

  const toast = (title: string, detail: string) => {
    setNotice({ title, detail });
    window.setTimeout(() => setNotice(null), 3500);
  };

  return (
    <main className="portal">
      {role === "chef" ? <DisclosureGate scope="chef" /> : null}
      <header className="portal-top">
        <Link className="portal-brand" href="/">
          <BrandLogo />
        </Link>
        <Link className="staff-home-link" href="/">
          ← Public website
        </Link>
        <div className="role-switch staff-role-label">
          {role === "chef" ? "CHEF WORKSPACE" : "ADMIN WORKSPACE"}
        </div>
        <a
          href="/cookbook"
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#bd6643",
            textDecoration: "none",
          }}
        >
          Cookbook →
        </a>
        <div className="portal-user">
          <button aria-label="Notifications" onClick={() => toast("Notifications", "You have no new staff notifications.")}>●</button>
          <span>
            {staff.fullName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <div>
            <strong>{staff.fullName}</strong>
            <small>{role === "chef" ? "Approved chef" : "Administrator"}</small>
          </div>
          <a className="staff-signout" href="/signout?return_to=%2Fchef">
            Sign out
          </a>
        </div>
      </header>
      <aside className="portal-side">
        <div className="side-title">
          <small>{role === "chef" ? "CHEF WORKSPACE" : "OPERATIONS"}</small>
          <strong>{role === "chef" ? staff.fullName : "North Coast"}</strong>
        </div>
        <nav>
          {tabs.map((item, i) => (
            <button
              key={item}
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
            >
              <Icon>{({ Market: "◎", Reviews: "★", Requests: "✉", Billing: "$", Cookbook: "❧", People: "☺" } as Record<string, string>)[item] ?? (["⌂", "♨", "□", "◎", "$", "◷", "↗"][i] || "·")}</Icon>
              {item}
              {item === "Safety" ? <b>2</b> : null}
            </button>
          ))}
        </nav>

      </aside>
      <section className="portal-main">
        {role === "chef" ? (
          <Chef
            tab={tab}
            clocked={clocked}
            setClocked={setClocked}
            onBreak={onBreak}
            setOnBreak={setOnBreak}
            portions={portions}
            setPortions={setPortions}
            toast={toast}
          />
        ) : (
          <Admin tab={tab} setTab={setTab} />
        )}
      </section>
      {notice ? (
        <div className="toast">
          <span>✓</span>
          <div>
            <strong>{notice.title}</strong>
            <small>{notice.detail}</small>
          </div>
          <button onClick={() => setNotice(null)}>×</button>
        </div>
      ) : null}
    </main>
  );
}

function Chef({
  tab,
  clocked,
  setClocked,
  onBreak,
  setOnBreak,
  portions,
  setPortions,
  toast,
}: {
  tab: string;
  clocked: boolean;
  setClocked: (v: boolean) => void;
  onBreak: boolean;
  setOnBreak: (v: boolean) => void;
  portions: number;
  setPortions: (v: number) => void;
  toast: (a: string, b: string) => void;
}) {
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [recipeQuery, setRecipeQuery] = useState("");
  if (tab === "Today" || tab === "Time & Mileage" || tab === "Earnings")
    return <ChefWork view={tab} />;
  if (tab === "Upcoming") return <ChefSchedule />;
  if (tab === "Today")
    return (
      <Page title="Today’s route" sub="Tuesday, August 25 · Two households">
        <div className={`clock-banner ${clocked ? "active" : ""}`}>
          <div>
            <small>DAY TIMECARD</small>
            <strong>
              {clocked
                ? onBreak
                  ? "On break · 00:18"
                  : "Clocked in · 03:42:16"
                : "Not clocked in"}
            </strong>
            <p>Shopping, inter-client travel, and job time are recorded.</p>
          </div>
          <div>
            {clocked ? (
              <button
                className="break-btn"
                onClick={() => {
                  setOnBreak(!onBreak);
                  toast(
                    onBreak ? "Break ended" : "Break started",
                    "Your actual timecard has been updated.",
                  );
                }}
              >
                {onBreak ? "End break" : "Start break"}
              </button>
            ) : null}
            <button
              className="clock-btn"
              onClick={() => {
                setClocked(!clocked);
                setOnBreak(false);
                toast(
                  clocked ? "Day complete" : "Day started",
                  clocked
                    ? "Your timecard was submitted for review."
                    : "GPS and mileage tracking are active.",
                );
              }}
            >
              {clocked ? "Clock out" : "Clock in for day"}
            </button>
          </div>
        </div>
        <Card title="9:00 AM · Barella household">
          <div className="job-head">
            <div>
              <Status>In progress</Status>
              <h2>Weekly · 12 portions</h2>
              <p>Astoria · 4.2 miles away · Side door access</p>
            </div>
            <button
              className="primary-action"
              onClick={() =>
                toast(
                  "Job timeline updated",
                  "Arrival, GPS location, and job start were recorded.",
                )
              }
            >
              Arrive & start job
            </button>
          </div>
          <div className="job-steps">
            {[
              "Shopping complete",
              "Arrived & checked in",
              "Kitchen safety check",
              "Cook & portion meals",
              "Label & photograph",
              "Cleanup attestation",
              "Send family update",
            ].map((s, i) => (
              <button
                key={s}
                className={i < 3 ? "done" : ""}
                onClick={() => toast("Task recorded", s)}
              >
                <span>{i < 3 ? "✓" : i + 1}</span>
                {s}
              </button>
            ))}
          </div>
          <div className="alert-line">
            <b>!</b>
            <span>
              <strong>Shellfish allergy</strong>Do not bring shellfish into this
              household.
            </span>
          </div>
        </Card>
        <Card title="1:00 PM · Morrison household">
          <div className="job-head">
            <div>
              <Status tone="gray">Upcoming</Status>
              <h2>Classic · 8 portions</h2>
              <p>Seaside · 16.8 compensable travel miles</p>
            </div>
            <button
              className="outline-btn"
              onClick={() =>
                toast(
                  "Navigation ready",
                  "Route and travel tracking are prepared.",
                )
              }
            >
              View route
            </button>
          </div>
        </Card>
      </Page>
    );
  if (tab === "Recipes") {
    const base = recipes[recipeIndex];
    const factor = portions / base.portions;
    const visibleRecipes = recipes
      .map((recipe, index) => ({ recipe, index }))
      .filter(({ recipe }) => recipe.name.toLowerCase().includes(recipeQuery.toLowerCase()));
    return (
      <Page
        title="Recipe book"
        sub="Standardized recipes, approved scales, safety, and pairing efficiency."
      >
        <div className="recipe-layout">
          <aside className="recipe-list">
            <input aria-label="Search recipes" value={recipeQuery} onChange={(event) => setRecipeQuery(event.target.value)} placeholder="Search recipes…" />
            {visibleRecipes.map(({ recipe: r, index: i }) => (
              <button key={r.name} className={i === recipeIndex ? "active" : ""} onClick={() => { setRecipeIndex(i); setPortions(r.portions); }}>
                <span className={`recipe-thumb r${i + 1}`} />
                <div>
                  <strong>{r.name}</strong>
                  <small>
                    {r.active} min active · {r.allergens}
                  </small>
                </div>
              </button>
            ))}
          </aside>
          <article className="recipe-card">
            <div className="recipe-hero">
              <div>
                <Status>Approved recipe</Status>
                <h2>{base.name}</h2>
                <p>Pairs efficiently with slow-cooked beef ragù.</p>
              </div>
              <div className="scale-control">
                <label>PORTIONS</label>
                <button onClick={() => setPortions(Math.max(2, portions - 2))}>
                  −
                </button>
                <strong>{portions}</strong>
                <button onClick={() => setPortions(portions + 2)}>+</button>
              </div>
            </div>
            <div className="recipe-meta">
              <span>
                <small>ACTIVE</small>
                {base.active} min
              </span>
              <span>
                <small>TOTAL</small>
                {base.total} min
              </span>
              <span>
                <small>EQUIPMENT</small>Oven · 2 burners
              </span>
              <span>
                <small>ALLERGENS</small>
                {base.allergens}
              </span>
            </div>
            <h3>Scaled ingredients</h3>
            <div className="ingredients">
              {base.ingredients.map(([n, a]) => (
                <div key={n}>
                  <span>{n}</span>
                  <strong>
                    {a.replace(/[0-9.]+/, (m) =>
                      (Number(m) * factor).toFixed(1).replace(".0", ""),
                    )}
                  </strong>
                </div>
              ))}
            </div>
            <div className="recipe-notes">
              <div>
                <h3>Food safety</h3>
                <p>
                  Cook chicken to 165°F. Cool portions promptly and refrigerate
                  within two hours.
                </p>
              </div>
              <div>
                <h3>Storage & reheating</h3>
                <p>Refrigerate up to four days. Reheat covered to 165°F.</p>
              </div>
            </div>
            <button
              className="primary-action"
              onClick={() =>
                toast(
                  "Recipe added",
                  "Scaled ingredients were added to today’s consolidated shopping list.",
                )
              }
            >
              Add scaled recipe to job
            </button>
          </article>
        </div>
      </Page>
    );
  }
  if (tab === "Time & Mileage")
    return (
      <Page
        title="Time & mileage"
        sub="Daily hours, breaks, shopping, jobs, travel, and corrections."
      >
        <div className="metric-row">
          <Metric
            label="THIS WEEK"
            value="26h 18m"
            note="All compensable time"
            tone="navy"
          />
          <Metric
            label="MILEAGE"
            value="74.6 mi"
            note="Inter-client & approved"
            tone="sea"
          />
          <Metric
            label="BREAKS"
            value="1h 12m"
            note="Recorded unpaid"
            tone="sand"
          />
          <Metric
            label="EST. PAY"
            value="$812.00"
            note="Before mileage"
            tone="rust"
          />
        </div>
        <Card title="Tuesday timecard">
          <Table
            heads={["Activity", "Start", "End", "Duration", "Status"]}
            rows={[
              [
                "Shopping · Barella",
                "8:10 AM",
                "8:46 AM",
                "0:36",
                "GPS verified",
              ],
              ["Barella household", "9:01 AM", "12:42 PM", "3:41", "Completed"],
              ["Break", "12:42 PM", "1:00 PM", "0:18", "Recorded"],
              [
                "Travel · Astoria→Seaside",
                "1:00 PM",
                "1:32 PM",
                "0:32",
                "16.8 miles",
              ],
              ["Morrison household", "1:33 PM", "—", "In progress", "Live"],
            ]}
          />
          <button
            className="outline-btn"
            onClick={() =>
              toast(
                "Correction requested",
                "The original entry remains in the audit trail pending admin review.",
              )
            }
          >
            Request time correction
          </button>
        </Card>
        <Card title="GPS job timeline">
          <div className="timeline">
            {[
              "8:10 Shopping started · Astoria Safeway",
              "8:46 Receipt uploaded · $84.62",
              "9:01 Arrived · Barella household",
              "12:42 Job completed · family update sent",
              "1:00 Compensable travel started",
              "1:32 Arrived · Morrison household",
            ].map((x, i) => (
              <p key={x}>
                <i className={i < 5 ? "done" : ""} />
                {x}
              </p>
            ))}
          </div>
        </Card>
      </Page>
    );
  if (tab === "Earnings")
    return (
      <Page
        title="Earnings"
        sub="Package pay, actual-hours compliance, mileage, and payment history."
      >
        <div className="metric-row">
          <Metric
            label="CURRENT PERIOD"
            value="$812.00"
            note="6 completed jobs"
            tone="rust"
          />
          <Metric
            label="MILEAGE"
            value="$49.98"
            note="74.6 approved miles"
            tone="sea"
          />
          <Metric
            label="NEXT PAYDAY"
            value="Sep 4"
            note="Direct deposit"
            tone="navy"
          />
          <Metric
            label="YTD"
            value="$18,420"
            note="Gross earnings"
            tone="sand"
          />
        </div>
        <Card title="Job-based earnings">
          <Table
            heads={["Date", "Household", "Package", "Actual time", "Job pay"]}
            rows={[
              ["Aug 25", "Barella", "Weekly · 12", "3h 41m", "$126.00"],
              ["Aug 25", "Morrison", "Classic · 8", "—", "$94.00"],
              ["Aug 24", "Nguyen", "Household · 20", "5h 08m", "$164.00"],
              ["Aug 22", "Franklin", "Essential · 6", "2h 56m", "$82.00"],
            ]}
          />
        </Card>
        <Card title="Compliance note">
          <p className="message">
            Package-based job pay never replaces actual-hours, overtime, break,
            and compensable-travel tracking. Driftline reviews every pay period
            against recorded time.
          </p>
        </Card>
      </Page>
    );
  return (
    <Page
      title="Chef profile & credentials"
      sub="Qualifications, availability, service area, and marketplace standing."
    >
      <div className="profile-hero">
        <span>MC</span>
        <div>
          <h2>Maya Chen</h2>
          <p>Approved Driftline chef · Seafood & family meals</p>
          <Status>Available for matching</Status>
        </div>
        <div className="rating-box">
          <strong>4.9</strong>
          <small>38 household ratings</small>
        </div>
      </div>
      <div className="portal-grid two">
        <Card title="Credentials">
          <Credential
            name="Oregon Food Handler"
            date="Valid through May 2028"
          />
          <Credential name="Background check" date="Cleared July 2026" />
          <Credential name="References" date="3 verified" />
          <Credential
            name="In-home safety training"
            date="Completed August 2026"
          />
        </Card>
        <Card title="Availability & area">
          <KeyRow label="Regular days" value="Tue–Sat" />
          <KeyRow label="Daily capacity" value="2 compatible households" />
          <KeyRow label="Service area" value="Astoria to Cannon Beach" />
          <KeyRow label="Same-chef clients" value="8 households" />
          <button
            className="outline-btn"
            onClick={() =>
              toast(
                "Availability editor opened",
                "Update days, blackout dates, or service radius.",
              )
            }
          >
            Edit availability
          </button>
        </Card>
      </div>
    </Page>
  );
}

function Admin({
  tab,
  setTab,
}: {
  tab: string;
  setTab: (tab: string) => void;
}) {
  if (tab === "Calendar")
    return <AdminCalendar onOpenPeople={() => setTab("People")} />;
  if (tab === "Requests")
    return <PrivateChefLeads onOpenCalendar={() => setTab("Calendar")} />;
  if (tab === "People") return <StaffManager />;
  if (tab === "Billing") return <BillingManager />;
  if (tab === "Cookbook") return <CookbookManager />;
  if (tab === "Market") return <MarketControl />;
  if (tab === "Reviews") return <ReviewsManager />;
  if (tab === "Dispatch")
    return (
      <AdminDispatch
        onOpenCalendar={() => setTab("Calendar")}
        onOpenPeople={() => setTab("People")}
      />
    );
  return null;
}

function Page({
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
        <span className="live-dot">● Live workspace</span>
      </header>
      <div className="page-body">{children}</div>
    </>
  );
}
function Card({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="p-card">
      <header>
        <h3>{title}</h3>
        {action ? <button onClick={onAction}>{action} →</button> : null}
      </header>
      {children}
    </section>
  );
}
function Metric({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <div className={`metric ${tone}`}>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}
function KeyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="key-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function Credential({ name, date }: { name: string; date: string }) {
  return (
    <div className="credential">
      <span>✓</span>
      <div>
        <strong>{name}</strong>
        <small>{date}</small>
      </div>
      <Status>Current</Status>
    </div>
  );
}
function Table({ heads, rows }: { heads: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
