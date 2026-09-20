"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./PrivateChefLeads.css";

type InquiryType = "private_chef" | "catering" | "meal_prep" | "general";
type Lead = {
  id: number;
  inquiryType: InquiryType;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  guestCount: number;
  location: string;
  occasion: string;
  details: string;
  zip: string;
  packageName: string;
  serviceFor: string;
  status: string;
  adminNotes: string;
  notifiedAt: string;
  createdAt: string;
};

const statuses = ["new", "contacted", "consultation", "proposal sent", "booked", "declined"];
const typeLabels: Record<InquiryType, string> = {
  private_chef: "Private chef",
  catering: "Catering",
  meal_prep: "Meal prep",
  general: "Message",
};
const filters: { key: "all" | InquiryType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "private_chef", label: "Private chef" },
  { key: "catering", label: "Catering" },
  { key: "meal_prep", label: "Meal prep" },
  { key: "general", label: "Messages" },
];

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  });
}
function formatReceived(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles",
  });
}
function summary(lead: Lead) {
  if (lead.inquiryType === "general") return lead.occasion || "Message";
  if (lead.inquiryType === "meal_prep") return `${lead.packageName || "Weekly"} · ZIP ${lead.zip}`;
  return `${formatDate(lead.preferredDate)} · ${lead.guestCount} guests`;
}

export default function PrivateChefLeads({ onOpenCalendar }: { onOpenCalendar: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<"all" | InquiryType>("all");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const response = await fetch("/api/inquiries");
      if (!response.ok) throw new Error(String(response.status));
      setLeads(await response.json());
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (filter === "all" ? leads : leads.filter((lead) => lead.inquiryType === filter)),
    [leads, filter],
  );
  const newCount = leads.filter((lead) => lead.status === "new").length;

  function choose(lead: Lead) {
    setSelected(lead);
    setSaveState("idle");
  }

  function schedule(lead: Lead) {
    const isMealPrep = lead.inquiryType === "meal_prep";
    window.localStorage.setItem(
      "driftlinePrivateChefDraft",
      JSON.stringify({
        ...(lead.preferredDate ? { serviceDate: lead.preferredDate } : {}),
        startTime: isMealPrep ? "10:00" : "17:00",
        endTime: isMealPrep ? "14:00" : "21:00",
        household: lead.fullName,
        customerEmail: lead.email,
        contactName: lead.fullName,
        contactPhone: lead.phone,
        serviceType: lead.inquiryType === "catering" ? "catering" : isMealPrep ? "meal_prep" : "private_dinner",
        guestCount: isMealPrep ? 0 : lead.guestCount,
        inquiryId: lead.id,
        dishes: [],
        chef: "Unassigned",
        chefEmail: "",
        packageName: isMealPrep ? lead.packageName || "" : "",
        location: lead.location,
        status: "scheduled",
        chefPayCents: 0,
        notes: isMealPrep
          ? `Meal prep request · ${lead.serviceFor} · ZIP ${lead.zip}`
          : `${typeLabels[lead.inquiryType]} request · ${lead.occasion || "Event"}\n${lead.details || ""}`,
      }),
    );
    onOpenCalendar();
  }

  async function save(lead: Lead) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/inquiries", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: lead.id, status: lead.status, adminNotes: lead.adminNotes }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const updated = (await response.json()) as Lead;
      setLeads((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Requests</h1>
          <p>Private chef, catering, and meal prep requests from the website.</p>
        </div>
        <span className="live-dot">● {newCount} new</span>
      </header>
      <div className="page-body pc-leads">
        {loadState === "loading" ? (
          <section className="p-card">Loading requests…</section>
        ) : loadState === "error" ? (
          <section className="p-card pc-empty" role="alert">
            <h2>Couldn’t load requests</h2>
            <p>Check your connection, then try again.</p>
            <button className="outline-btn" onClick={load}>Try again</button>
          </section>
        ) : leads.length === 0 ? (
          <section className="p-card pc-empty">
            <h2>No requests yet</h2>
            <p>New requests from the website appear here, and each one is also emailed to you.</p>
          </section>
        ) : (
          <div className="pc-lead-layout">
            <section className="p-card pc-lead-list">
              <header>
                <h3>Requests · {visible.length}</h3>
                <div className="pc-filter" role="tablist" aria-label="Filter requests">
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      role="tab"
                      aria-selected={filter === f.key}
                      className={filter === f.key ? "on" : ""}
                      onClick={() => setFilter(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </header>
              {visible.map((lead) => (
                <button
                  key={lead.id}
                  className={selected?.id === lead.id ? "active" : ""}
                  onClick={() => choose(lead)}
                >
                  <span>
                    <strong>{lead.fullName}</strong>
                    <small>
                      {typeLabels[lead.inquiryType]}{lead.location || lead.zip ? ` · ${lead.location || lead.zip}` : ""}
                    </small>
                  </span>
                  <span>
                    <b className={`status-${lead.status.replace(/\s/g, "-")}`}>{lead.status}</b>
                    <small>{summary(lead)}</small>
                  </span>
                </button>
              ))}
              {visible.length === 0 ? <p className="pc-none">Nothing in this category yet.</p> : null}
            </section>
            {selected ? (
              <section className="p-card pc-lead-detail">
                <header>
                  <div>
                    <small>{typeLabels[selected.inquiryType].toUpperCase()} REQUEST · RECEIVED {formatReceived(selected.createdAt).toUpperCase()}</small>
                    <h2>{selected.fullName}</h2>
                  </div>
                  <a href={`mailto:${selected.email}`}>Email customer →</a>
                </header>
                <div className="lead-facts">
                  {selected.inquiryType === "general" ? (
                    <label><span>About</span><strong>{selected.occasion}</strong></label>
                  ) : selected.inquiryType === "meal_prep" ? (
                    <>
                      <label><span>Package</span><strong>{selected.packageName}</strong></label>
                      <label><span>ZIP</span><strong>{selected.zip}</strong></label>
                      <label><span>Service for</span><strong>{selected.serviceFor}</strong></label>
                    </>
                  ) : (
                    <>
                      <label><span>Date</span><strong>{formatDate(selected.preferredDate)}</strong></label>
                      <label><span>Guests</span><strong>{selected.guestCount}</strong></label>
                      <label><span>Location</span><strong>{selected.location}</strong></label>
                      <label><span>Occasion</span><strong>{selected.occasion || "Not specified"}</strong></label>
                    </>
                  )}
                  <label><span>Email</span><strong>{selected.email}</strong></label>
                  <label><span>Phone</span><strong>{selected.phone ? <a href={`tel:${selected.phone}`}>{selected.phone}</a> : "Not provided"}</strong></label>
                </div>
                {selected.inquiryType !== "meal_prep" ? (
                  <div className="lead-message">
                    <span>{selected.inquiryType === "general" ? "Message" : "Customer notes"}</span>
                    <p>{selected.details || "No additional details provided."}</p>
                  </div>
                ) : null}
                {!selected.notifiedAt ? (
                  <p className="pc-warn">No email alert was sent for this request (email wasn’t set up yet or the send failed).</p>
                ) : null}
                <label className="lead-edit">
                  Follow-up status
                  <select
                    value={selected.status}
                    onChange={(e) => {
                      setSelected({ ...selected, status: e.target.value });
                      setSaveState("idle");
                    }}
                  >
                    {statuses.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </label>
                <label className="lead-edit">
                  Admin notes
                  <textarea
                    rows={5}
                    value={selected.adminNotes}
                    onChange={(e) => {
                      setSelected({ ...selected, adminNotes: e.target.value });
                      setSaveState("idle");
                    }}
                    placeholder="Consultation notes, menu ideas, pricing, next step…"
                  />
                </label>
                <div className="lead-actions">
                  <button className="outline-btn" onClick={() => schedule(selected)}>Schedule &amp; assign chef →</button>
                  <button className="primary-action" disabled={saveState === "saving"} onClick={() => save(selected)}>
                    {saveState === "saving" ? "Saving…" : "Save"}
                  </button>
                </div>
                {saveState === "saved" ? <p className="pc-save-ok" role="status">Saved.</p> : null}
                {saveState === "error" ? <p className="pc-save-err" role="alert">Couldn’t save. Check your connection and try again.</p> : null}
              </section>
            ) : (
              <section className="p-card pc-empty">
                <h2>Select a request</h2>
                <p>Open a request to see the details and manage follow-up.</p>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
