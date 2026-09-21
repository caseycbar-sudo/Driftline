"use client";

import { useEffect, useState } from "react";

type PublicReview = { id: number; displayName: string; town: string; service: string; rating: number; body: string; verified: boolean };

/**
 * "Kind words" section. Shows only reviews Casey has approved, and renders
 * nothing at all until there is at least one.
 */
export default function ReviewsShowcase({ service }: { service?: string }) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((b: { reviews: PublicReview[] }) => setReviews(b.reviews))
      .catch(() => {});
  }, []);
  const list = (service ? reviews.filter((r) => r.service === service) : reviews).slice(0, 3);
  if (!list.length) return null;
  return (
    <section className="dp-section dp-reviews" aria-labelledby="reviews-heading">
      <div className="dp-section-head">
        <p className="dp-eyebrow">
          <span aria-hidden="true" /> Kind words
        </p>
        <h2 id="reviews-heading">
          From the people <em>we&apos;ve cooked for.</em>
        </h2>
      </div>
      <div className="dp-review-grid">
        {list.map((r) => (
          <figure key={r.id} className="dp-review">
            <div className="dp-review-stars" aria-label={`${r.rating} out of 5 stars`}>
              {"★".repeat(r.rating)}
            </div>
            <blockquote>{r.body}</blockquote>
            <figcaption>
              <strong>{r.displayName}</strong>
              {r.town ? `, ${r.town}` : ""}
              <span>
                {r.service}
                {r.verified ? " · Verified client" : ""}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
