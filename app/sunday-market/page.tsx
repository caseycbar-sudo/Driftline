import type { Metadata } from "next";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import "../home.css";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "/sunday-market",
  "Astoria Sunday Market · Award-Winning Clam Chowder · Driftline Provisions",
  "Find Driftline Provisions' award-winning clam chowder at the Astoria Sunday Market on 12th Street, Sundays 10am to 3pm, Mother's Day through mid-October.",
);

export default function SundayMarketPage() {
  return (
    <main className="dp">
      <SiteHeader current="/sunday-market" />

      <section className="dp-hero dp-hero-short">
        <div className="dp-hero-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> Sundays · In season
          </p>
          <h1>
            Chowder on
            <em>12th Street.</em>
          </h1>
          <p className="dp-lede">
            Our award-winning clam chowder, made fresh and served hot every
            Sunday at the Astoria Sunday Market. Come say hi, grab a bowl, and
            ask about a dinner.
          </p>
          <div className="dp-hero-actions">
            <a
              className="dp-btn dp-btn-gold"
              href="https://www.astoriasundaymarket.com/"
              target="_blank"
              rel="noreferrer"
            >
              Astoria Sunday Market site <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <figure className="dp-hero-photo dp-hero-photo-market">
          <img src="/gallery/chowder-stand.webp" alt="Chef Casey at the Driftline clam chowder stand" />
        </figure>
      </section>

      <section className="dp-section">
        <div className="dp-market-grid">
          <div>
            <h2>
              When &amp; <em>where</em>
            </h2>
            <dl className="dp-facts">
              <div>
                <dt>Where</dt>
                <dd>12th Street, downtown Astoria</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>Sundays, 10am to 3pm</dd>
              </div>
              <div>
                <dt>Season</dt>
                <dd>Mother&apos;s Day through mid-October</dd>
              </div>
              <div>
                <dt>What</dt>
                <dd>Award-winning clam chowder and coastal comfort food</dd>
              </div>
            </dl>
          </div>
          <div className="dp-market-note">
            <h3>The chowder with a history</h3>
            <p>
              This is the same handcrafted clam chowder that earned The Chowder
              Stop top honors year after year. Casey still makes it the same
              way, fresh for every market day.
            </p>
            <h3>Off season?</h3>
            <p>
              After mid-October, the best way to taste Casey&apos;s cooking is a
              private dinner, catering for your event, or weekly meal prep at
              home.
            </p>
            <div className="dp-hero-actions">
              <a className="dp-btn dp-btn-navy" href="/private-chef">
                Private chef dinners <span aria-hidden="true">→</span>
              </a>
              <a className="dp-btn dp-btn-line" href="/contact">
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
