"use client";

import { FormEvent, useEffect, useState } from "react";
import { REVIEW_BODY_MAX, REVIEW_BODY_MIN, REVIEW_SERVICES } from "../review-core";

type Mine = { id: number; rating: number; service: string; status: string; createdAt: string };

/** Lets a signed-in customer leave a review. Casey approves it before it's public. */
export default function ReviewForm({ defaultName, defaultTown }: { defaultName: string; defaultTown: string }) {
  const [rating, setRating] = useState(0);
  const [service, setService] = useState<string>(REVIEW_SERVICES[2]);
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState(defaultName);
  const [town, setTown] = useState(defaultTown);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [mine, setMine] = useState<Mine[]>([]);

  useEffect(() => {
    fetch("/api/reviews?mine=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((b: { reviews: Mine[] }) => setMine(b.reviews))
      .catch(() => {});
  }, [state]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!rating) {
      setError("Please choose 1 to 5 stars.");
      return;
    }
    setState("sending");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rating, service, body, displayName, town }),
    }).catch(() => null);
    const result = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok) {
      setError(result.error || "Couldn't send your review. Please try again.");
      setState("idle");
      return;
    }
    setState("sent");
  }

  return (
    <section className="review-form" id="review">
      <div className="review-form-head">
        <span>SHARE YOUR EXPERIENCE</span>
        <h2>How was your Driftline meal?</h2>
        <p>Your words help other coastal families find us. Casey reads every review before it goes on the website.</p>
      </div>
      {state === "sent" ? (
        <div className="review-thanks" role="status">
          <b>Thank you!</b>
          <p>Your review is with Casey. It will appear on the website once he&apos;s had a look.</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <fieldset className="review-rating">
            <legend>Your rating</legend>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className={n <= rating ? "on" : ""}>
                <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} />
                <span aria-hidden="true">★</span>
                <span className="sr-only">
                  {n} star{n > 1 ? "s" : ""}
                </span>
              </label>
            ))}
          </fieldset>
          <label>
            What was it for?
            <select value={service} onChange={(e) => setService(e.target.value)}>
              {REVIEW_SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Your review
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              minLength={REVIEW_BODY_MIN}
              maxLength={REVIEW_BODY_MAX}
              rows={5}
              required
              placeholder="What did you have? What stood out?"
            />
          </label>
          <div className="review-form-row">
            <label>
              Name to show
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} required />
              <small>We&apos;ll show your first name and last initial.</small>
            </label>
            <label>
              Town <span>(optional)</span>
              <input value={town} onChange={(e) => setTown(e.target.value)} maxLength={60} placeholder="Astoria" />
            </label>
          </div>
          {error ? (
            <p className="review-error" role="alert">
              {error}
            </p>
          ) : null}
          <button disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send my review"}</button>
        </form>
      )}
      {mine.length ? (
        <ul className="review-mine">
          {mine.map((r) => (
            <li key={r.id}>
              {"★".repeat(r.rating)} · {r.service} ·{" "}
              {r.status === "approved" ? "On the website" : r.status === "hidden" ? "Not shown" : "Waiting for Casey"}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
