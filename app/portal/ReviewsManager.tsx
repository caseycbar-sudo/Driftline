"use client";

import { useEffect, useState } from "react";
import "./OwnerTools.css";

type Review = {
  id: number;
  customerEmail: string;
  displayName: string;
  town: string;
  service: string;
  rating: number;
  body: string;
  status: "pending" | "approved" | "hidden";
  verified: boolean;
  createdAt: string;
};

const FILTERS = [
  { key: "pending", label: "Waiting" },
  { key: "approved", label: "On the website" },
  { key: "hidden", label: "Hidden" },
] as const;

const when = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Owner dashboard: approve, hide or delete customer reviews. Nothing is public until approved. */
export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("pending");
  const [message, setMessage] = useState("");

  const load = () =>
    fetch("/api/admin/reviews", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((b: { reviews: Review[] }) => setReviews(b.reviews))
      .catch(() => setReviews([]));

  useEffect(() => {
    void load();
  }, []);

  async function act(review: Review, action: "approve" | "hide" | "delete") {
    if (action === "delete" && !window.confirm(`Delete ${review.displayName}'s review for good?`)) return;
    setMessage("");
    const response = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: review.id, action }),
    });
    if (!response.ok) {
      setMessage("Couldn't update that review. Try again.");
      return;
    }
    setMessage(action === "approve" ? "Approved. It's on the website now." : action === "hide" ? "Hidden from the website." : "Deleted.");
    await load();
  }

  const counts = Object.fromEntries(FILTERS.map((f) => [f.key, (reviews ?? []).filter((r) => r.status === f.key).length]));
  const shown = (reviews ?? []).filter((r) => r.status === filter);

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Reviews</h1>
          <p>Customers leave reviews from their account. Nothing appears on the website until you approve it.</p>
        </div>
      </header>
      <div className="page-body owner-tools">
        <div className="segmented" role="tablist">
          {FILTERS.map((f) => (
            <button key={f.key} role="tab" aria-selected={filter === f.key} className={filter === f.key ? "active" : ""} onClick={() => setFilter(f.key)}>
              {f.label} · {counts[f.key] ?? 0}
            </button>
          ))}
        </div>
        {message ? (
          <p className="owner-message" role="status">
            {message}
          </p>
        ) : null}
        {reviews === null ? <p className="owner-empty">Loading…</p> : null}
        {reviews !== null && shown.length === 0 ? (
          <p className="owner-empty">
            {filter === "pending"
              ? "No reviews waiting. Customers can leave one from their account page; you'll get an email when they do."
              : "Nothing here yet."}
          </p>
        ) : null}
        {shown.map((review) => (
          <article key={review.id} className="owner-card review-card">
            <header>
              <span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                {"★".repeat(review.rating)}
                <span aria-hidden="true">{"★".repeat(5 - review.rating)}</span>
              </span>
              <small>{when(review.createdAt)}</small>
            </header>
            <p className="review-body">{review.body}</p>
            <p className="review-meta">
              <strong>{review.displayName}</strong>
              {review.town ? `, ${review.town}` : ""} · {review.service}
              {review.verified ? <em>Verified client</em> : null}
            </p>
            <p className="review-email">{review.customerEmail}</p>
            <div className="review-actions">
              {review.status !== "approved" ? (
                <button type="button" className="primary" onClick={() => act(review, "approve")}>
                  Approve
                </button>
              ) : null}
              {review.status !== "hidden" ? (
                <button type="button" onClick={() => act(review, "hide")}>
                  Hide
                </button>
              ) : null}
              <button type="button" className="danger" onClick={() => act(review, "delete")}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
