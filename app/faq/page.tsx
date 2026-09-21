import type { Metadata } from "next";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { pageMetadata } from "../site-config";
import { QUESTION_GROUPS } from "./questions";
import "../home.css";

export const metadata: Metadata = pageMetadata(
  "/faq",
  "Questions · Driftline Provisions",
  "Answers about private chef dinners, weekly meal prep, catering, groceries, allergies, service area and the Sunday Market chowder.",
);

/** Structured data so search engines can show these answers directly. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: QUESTION_GROUPS.flatMap((group) =>
    group.questions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
};

export default function FaqPage() {
  return (
    <main className="dp">
      <SiteHeader current="/faq" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <section className="dp-page-head">
        <p className="dp-eyebrow">
          <span aria-hidden="true" /> Good questions
        </p>
        <h1>
          Before you <em>book.</em>
        </h1>
        <p className="dp-lede">The things people ask most. Don&apos;t see yours? Casey&apos;s happy to answer it himself.</p>
        <nav className="dp-faq-jump" aria-label="Jump to a topic">
          {QUESTION_GROUPS.map((group) => (
            <a key={group.id} href={`#${group.id}`}>
              {group.title}
            </a>
          ))}
        </nav>
      </section>

      <div className="dp-faq">
        {QUESTION_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="dp-faq-group" aria-labelledby={`${group.id}-title`}>
            <h2 id={`${group.id}-title`}>{group.title}</h2>
            {group.questions.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <div>
                  <p>{item.a}</p>
                  {item.link ? (
                    <a href={item.link.href}>
                      {item.link.label} <span aria-hidden="true">→</span>
                    </a>
                  ) : null}
                </div>
              </details>
            ))}
          </section>
        ))}
      </div>

      <section className="dp-faq-cta">
        <h2>
          Still wondering <em>about something?</em>
        </h2>
        <a className="dp-btn dp-btn-gold" href="/contact">
          Ask Casey <span aria-hidden="true">→</span>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
