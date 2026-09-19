"use client";

import { FormEvent, useState } from "react";
import { submitInquiry } from "../submit-inquiry";

const topics = ["Private chef dinner", "Catering", "Weekly meal prep", "Sunday Market", "Something else"];

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [badField, setBadField] = useState<string | undefined>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("saving");
    setError("");
    setBadField(undefined);
    const result = await submitInquiry({ ...Object.fromEntries(new FormData(form)), inquiryType: "general" });
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
        <h3>Message sent.</h3>
        <p>Casey will get back to you personally, usually within a day. A confirmation is on its way to your inbox.</p>
        <button type="button" onClick={() => setState("idle")}>Send another message</button>
      </div>
    );
  }

  const invalid = (name: string) => (badField === name ? true : undefined);

  return (
    <form onSubmit={submit}>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label>
        Your name
        <input id="contact-name" required name="fullName" autoComplete="name" placeholder="First and last name" aria-invalid={invalid("fullName")} />
      </label>
      <div>
        <label>
          Email
          <input id="contact-email" required type="email" name="email" autoComplete="email" placeholder="you@example.com" aria-invalid={invalid("email")} />
        </label>
        <label>
          <span>
            Phone <small>(optional)</small>
          </span>
          <input id="contact-phone" type="tel" name="phone" autoComplete="tel" placeholder="(503) 555-0123" />
        </label>
      </div>
      <label>
        What can we help with?
        <select id="contact-topic" name="occasion" defaultValue="Something else">
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Message
        <textarea id="contact-message" required name="details" rows={5} placeholder="Dates, questions, ideas, anything at all…" aria-invalid={invalid("details")} />
      </label>
      <button disabled={state === "saving"}>
        {state === "saving" ? "Sending…" : "Send message"} <span aria-hidden="true">→</span>
      </button>
      {state === "error" ? (
        <p className="pc-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <small>Casey reads every message himself.</small>
    </form>
  );
}
