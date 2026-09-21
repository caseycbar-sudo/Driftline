"use client";

import { useEffect, useState } from "react";
import { MARKET_LABELS, type PublicMarketStatus } from "./market-core";

function useMarketStatus() {
  const [status, setStatus] = useState<PublicMarketStatus | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/market-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => alive && s && setStatus(s as PublicMarketStatus))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return status;
}

/** Home page hero link. Shows the regular schedule until Casey posts today's status. */
export function MarketHeroLink() {
  const live = useMarketStatus();
  const state = live && live.status !== "schedule" ? live.status : null;
  const label = state ? MARKET_LABELS[state] : null;
  return (
    <a className={`dp-hero-market${state ? ` is-${state}` : ""}`} href="/sunday-market">
      <span className="dp-dot" aria-hidden="true" />
      <span aria-live="polite">
        <strong>{label ? label.title : "Award-winning clam chowder"}</strong>
        {label ? live?.note || label.detail : "Sundays at the Astoria Sunday Market"} →
      </span>
    </a>
  );
}

/** Sunday Market page: a clear "today" notice, only when Casey has posted one. */
export function MarketTodayNotice() {
  const live = useMarketStatus();
  if (!live || live.status === "schedule") return null;
  const label = MARKET_LABELS[live.status];
  return (
    <div className={`dp-market-today is-${live.status}`} role="status">
      <span className="dp-dot" aria-hidden="true" />
      <div>
        <strong>{label.title}</strong>
        <span>{live.note || label.detail}</span>
      </div>
    </div>
  );
}
