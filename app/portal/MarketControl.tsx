"use client";

import { useEffect, useState } from "react";
import { MARKET_LABELS, MARKET_NOTE_MAX, type MarketStatus, type PublicMarketStatus } from "../market-core";
import "./OwnerTools.css";

const CHOICES: { status: MarketStatus; button: string }[] = [
  { status: "open", button: "We're here today" },
  { status: "sold_out", button: "Sold out" },
  { status: "closed", button: "Not at market this week" },
  { status: "schedule", button: "Back to regular schedule" },
];

/** Owner dashboard: set today's Sunday Market status. Built for a phone at the stand. */
export default function MarketControl() {
  const [live, setLive] = useState<PublicMarketStatus | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState<MarketStatus | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/market-status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: PublicMarketStatus | null) => {
        if (s) {
          setLive(s);
          setNote(s.note);
        }
      })
      .catch(() => setMessage("Couldn't load the current status."));
  }, []);

  async function choose(status: MarketStatus) {
    setSaving(status);
    setMessage("");
    try {
      const response = await fetch("/api/market-status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Couldn't save.");
      setLive(body as PublicMarketStatus);
      if (status === "schedule") setNote("");
      setMessage("Updated. The website shows it now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't save.");
    } finally {
      setSaving(null);
    }
  }

  const current = live?.status ?? "schedule";
  const label = MARKET_LABELS[current];

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Sunday Market</h1>
          <p>Tell visitors what&apos;s happening at the stand today. It resets to the regular schedule at midnight.</p>
        </div>
      </header>
      <div className="page-body owner-tools">
        <section className={`owner-card market-now is-${current}`}>
          <small>WEBSITE SHOWS RIGHT NOW</small>
          <div className="market-now-line">
            <span className="dp-dot" aria-hidden="true" />
            <div>
              <strong>{label.title}</strong>
              <span>{live?.note || label.detail}</span>
            </div>
          </div>
        </section>

        <section className="owner-card">
          <label htmlFor="market-note">
            Add a short note <span>(optional)</span>
          </label>
          <input
            id="market-note"
            value={note}
            maxLength={MARKET_NOTE_MAX}
            placeholder="e.g. Smoked salmon chowder special today!"
            onChange={(e) => setNote(e.target.value)}
          />
          <small className="owner-count">
            {note.length}/{MARKET_NOTE_MAX}
          </small>
          <div className="market-choices">
            {CHOICES.map((choice) => (
              <button
                key={choice.status}
                type="button"
                className={`market-choice is-${choice.status}${current === choice.status ? " active" : ""}`}
                disabled={saving !== null}
                onClick={() => choose(choice.status)}
              >
                {saving === choice.status ? "Saving…" : choice.button}
              </button>
            ))}
          </div>
          {message ? (
            <p className="owner-message" role="status">
              {message}
            </p>
          ) : null}
        </section>
      </div>
    </>
  );
}
