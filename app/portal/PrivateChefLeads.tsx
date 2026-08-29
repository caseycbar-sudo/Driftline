"use client";
import { useEffect, useState } from "react";
import "./PrivateChefLeads.css";
type Lead = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  guestCount: number;
  location: string;
  occasion: string;
  details: string;
  status: string;
  adminNotes: string;
  createdAt: string;
};
const statuses = [
  "new",
  "contacted",
  "consultation",
  "proposal sent",
  "booked",
  "declined",
];
export default function PrivateChefLeads({
  onOpenCalendar,
}: {
  onOpenCalendar: () => void;
}) {
  const [leads, setLeads] = useState<Lead[]>([]),
    [loading, setLoading] = useState(true),
    [selected, setSelected] = useState<Lead | null>(null);
  useEffect(() => {
    fetch("/api/private-chef")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setLeads(data);
        setLoading(false);
      });
  }, []);
  function schedule(lead: Lead) {
    window.localStorage.setItem(
      "driftlinePrivateChefDraft",
      JSON.stringify({serviceDate:lead.preferredDate,startTime:"17:00",endTime:"21:00",household:lead.fullName,customerEmail:lead.email,dishes:[],chef:"Unassigned",chefEmail:"",packageName:"Private Chef",location:lead.location,status:"scheduled",chefPayCents:0,notes:`Private chef inquiry · ${lead.occasion || "Dinner"} · ${lead.guestCount} guests\n${lead.details || ""}`}),
    );
    onOpenCalendar();
  }
  async function save(lead: Lead) {
    const r = await fetch("/api/private-chef", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: lead.id,
        status: lead.status,
        adminNotes: lead.adminNotes,
      }),
    });
    if (r.ok) {
      const updated = await r.json();
      setLeads((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelected(updated);
    }
  }
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Private Chef Leads</h1>
          <p>QR-card and website inquiries for private dinners.</p>
        </div>
        <span className="live-dot">
          ● {leads.filter((x) => x.status === "new").length} new
        </span>
      </header>
      <div className="page-body pc-leads">
        {loading ? (
          <section className="p-card">Loading inquiries…</section>
        ) : leads.length === 0 ? (
          <section className="p-card pc-empty">
            <h2>No private-chef inquiries yet</h2>
            <p>
              New requests from the QR page and Private Chef page will appear
              here automatically.
            </p>
          </section>
        ) : (
          <div className="pc-lead-layout">
            <section className="p-card pc-lead-list">
              <header>
                <h3>Inquiries · {leads.length}</h3>
              </header>
              {leads.map((lead) => (
                <button
                  key={lead.id}
                  className={selected?.id === lead.id ? "active" : ""}
                  onClick={() => setSelected(lead)}
                >
                  <span>
                    <strong>{lead.fullName}</strong>
                    <small>
                      {lead.occasion || "Private dinner"} · {lead.location}
                    </small>
                  </span>
                  <span>
                    <b>{lead.status}</b>
                    <small>
                      {lead.preferredDate} · {lead.guestCount} guests
                    </small>
                  </span>
                </button>
              ))}
            </section>
            {selected ? (
              <section className="p-card pc-lead-detail">
                <header>
                  <div>
                    <small>PRIVATE CHEF INQUIRY</small>
                    <h2>{selected.fullName}</h2>
                  </div>
                  <a href={`mailto:${selected.email}`}>Email customer →</a>
                </header>
                <div className="lead-facts">
                  <label>
                    <span>Preferred date</span>
                    <strong>{selected.preferredDate}</strong>
                  </label>
                  <label>
                    <span>Guests</span>
                    <strong>{selected.guestCount}</strong>
                  </label>
                  <label>
                    <span>Location</span>
                    <strong>{selected.location}</strong>
                  </label>
                  <label>
                    <span>Occasion</span>
                    <strong>{selected.occasion || "Not specified"}</strong>
                  </label>
                  <label>
                    <span>Email</span>
                    <strong>{selected.email}</strong>
                  </label>
                  <label>
                    <span>Phone</span>
                    <strong>{selected.phone || "Not provided"}</strong>
                  </label>
                </div>
                <div className="lead-message">
                  <span>Customer notes</span>
                  <p>{selected.details || "No additional details provided."}</p>
                </div>
                <label className="lead-edit">
                  Follow-up status
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      setSelected({ ...selected, status: e.target.value })
                    }
                  >
                    {statuses.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label className="lead-edit">
                  Admin notes
                  <textarea
                    rows={5}
                    value={selected.adminNotes}
                    onChange={(e) =>
                      setSelected({ ...selected, adminNotes: e.target.value })
                    }
                    placeholder="Consultation notes, menu ideas, pricing, next step…"
                  />
                </label>
                <div className="lead-actions">
                  <button className="outline-btn" onClick={() => schedule(selected)}>Schedule &amp; assign chef →</button>
                  <button className="primary-action" onClick={() => save(selected)}>Save inquiry</button>
                </div>
              </section>
            ) : (
              <section className="p-card pc-empty">
                <h2>Select an inquiry</h2>
                <p>
                  Open a lead to see the dinner details and manage follow-up.
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
