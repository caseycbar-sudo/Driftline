"use client";

import { FormEvent, useState } from "react";
import { submitInquiry } from "../submit-inquiry";

type Kind = "private_chef" | "catering";

const copy: Record<Kind, {
  guests: { min: number; max: number; placeholder: string; label: string };
  where: { label: string; placeholder: string };
  occasion: string;
  details: { label: string; placeholder: string };
  submit: string;
  doneTitle: string;
  note: string;
}> = {
  private_chef: {
    guests: { min: 2, max: 40, placeholder: "6", label: "Guest count" },
    where: { label: "Where will dinner be held?", placeholder: "City or vacation property" },
    occasion: "Anniversary, birthday, vacation dinner…",
    details: {
      label: "Tell us about the evening",
      placeholder: "The feeling, favorite foods, dietary needs, and anything we should know…",
    },
    submit: "Request a private-chef proposal",
    doneTitle: "Your dinner request is in.",
    note: "We’ll confirm availability before creating your menu. No payment is taken with this request.",
  },
  catering: {
    guests: { min: 10, max: 300, placeholder: "40", label: "Approximate guests" },
    where: { label: "Where is the event?", placeholder: "Venue, home, or city" },
    occasion: "Rehearsal dinner, birthday, company gathering…",
    details: {
      label: "Tell us about the event",
      placeholder: "Style of service (plated, family style, buffet, stations), budget range, dietary needs, rentals…",
    },
    submit: "Request a catering proposal",
    doneTitle: "Your catering request is in.",
    note: "We’ll confirm the date and follow up to design the menu together. No payment is taken with this request.",
  },
};

export default function InquiryForm({ type = "private_chef" }: { type?: Kind }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [badField, setBadField] = useState<string | undefined>();
  const text = copy[type];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("saving");
    setError("");
    setBadField(undefined);
    const result = await submitInquiry({ ...Object.fromEntries(new FormData(form)), inquiryType: type });
    if (result.ok) {
      form.reset();
      setState("done");
      return;
    }
    setError(result.error);
    setBadField(result.field);
    setState("error");
    if (result.field) (form.elements.namedItem(result.field) as HTMLElement | null)?.focus();
  }

  if (state === "done") {
    return (
      <div className="pc-form-success" role="status">
        <b>✓</b>
        <h3>{text.doneTitle}</h3>
        <p>Casey will review the details and get back to you personally, usually within a day. A confirmation is on its way to your inbox.</p>
        <button type="button" onClick={() => setState("idle")}>Send another request</button>
      </div>
    );
  }

  const invalid = (name: string) => (badField === name ? true : undefined);

  return (
    <form onSubmit={submit} noValidate={false}>
      {/* Hidden from people; bots tend to fill it in. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label>
        Your name
        <input required name="fullName" autoComplete="name" placeholder="First and last name" aria-invalid={invalid("fullName")} />
      </label>
      <div>
        <label>
          Email
          <input required type="email" name="email" autoComplete="email" placeholder="you@example.com" aria-invalid={invalid("email")} />
        </label>
        <label>
          Phone
          <input type="tel" name="phone" autoComplete="tel" placeholder="(503) 555-0123" />
        </label>
      </div>
      <div>
        <label>
          Preferred date
          <input required type="date" name="preferredDate" min={today} aria-invalid={invalid("preferredDate")} />
        </label>
        <label>
          {text.guests.label}
          <input
            required
            type="number"
            inputMode="numeric"
            min={text.guests.min}
            max={text.guests.max}
            name="guestCount"
            placeholder={text.guests.placeholder}
            aria-invalid={invalid("guestCount")}
          />
        </label>
      </div>
      <label>
        {text.where.label}
        <input required name="location" placeholder={text.where.placeholder} aria-invalid={invalid("location")} />
      </label>
      <label>
        Occasion
        <input name="occasion" placeholder={text.occasion} />
      </label>
      <label>
        {text.details.label}
        <textarea name="details" rows={4} placeholder={text.details.placeholder} />
      </label>
      <button disabled={state === "saving"}>
        {state === "saving" ? "Sending…" : text.submit} <span aria-hidden="true">→</span>
      </button>
      {state === "error" ? (
        <p className="pc-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <small>{text.note}</small>
    </form>
  );
}
