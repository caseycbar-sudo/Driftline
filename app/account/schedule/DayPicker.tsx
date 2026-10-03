"use client";

import { useState } from "react";

const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (n: number) => String(n).padStart(2, "0");
const key = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const monthName = (y: number, m: number) => new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

/**
 * A month calendar for choosing visit days. Days outside the booking range, or that cannot take a visit,
 * are greyed out and cannot be tapped. All dates are YYYY-MM-DD strings.
 */
export default function DayPicker({
  earliest,
  latest,
  unavailable,
  selected,
  full,
  onToggle,
}: {
  earliest: string;
  latest: string;
  unavailable: string[];
  selected: string[];
  full: boolean;
  onToggle: (date: string) => void;
}) {
  const [y0, m0] = earliest.split("-").map(Number);
  const [y1, m1] = latest.split("-").map(Number);
  const last = (y1 - y0) * 12 + (m1 - m0);
  const [offset, setOffset] = useState(0);
  const base = y0 * 12 + (m0 - 1) + offset;
  const year = Math.floor(base / 12),
    month = base % 12;
  const lead = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: days }, (_, i) => i + 1)];

  return (
    <div className="day-picker">
      <div className="day-picker-head">
        <button type="button" onClick={() => setOffset(offset - 1)} disabled={offset <= 0} aria-label="Previous month">
          ‹
        </button>
        <strong>{monthName(year, month)}</strong>
        <button type="button" onClick={() => setOffset(offset + 1)} disabled={offset >= last} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="day-picker-grid" role="grid">
        {WEEK.map((w) => (
          <span key={w} className="day-picker-dow">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`b${i}`} />;
          const date = key(year, month, d);
          const out = date < earliest || date > latest;
          const off = unavailable.includes(date);
          const on = selected.includes(date);
          const disabled = out || off || (!on && full);
          return (
            <button
              type="button"
              key={date}
              className={`${on ? "on" : ""} ${off ? "off" : ""}`}
              disabled={disabled}
              aria-pressed={on}
              aria-label={`${date}${off ? ", not available" : ""}`}
              onClick={() => onToggle(date)}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
