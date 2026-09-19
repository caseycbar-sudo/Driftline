import type { Metadata } from "next";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import "./home.css";
import { CONTACT_EMAIL, SITE_ORIGIN, pageMetadata, smallImage } from "./site-config";

export const metadata: Metadata = pageMetadata(
  "/",
  "Driftline Provisions · Private Chef & Catering in Astoria, Oregon",
  "Private chef dinners, catering, and weekly in-home meal prep from Chef Casey Barella on Oregon's North Coast. Home of award-winning clam chowder at the Astoria Sunday Market.",
);

const services = [
  {
    id: "private-chef",
    kicker: "Special occasions",
    title: "Private Chef Dinners",
    body: "Multi-course dinners cooked in your kitchen or vacation rental, from a table for two to a full house. Menus built around what the coast is giving us that week.",
    detail: "From $175 per guest",
    image: "/gallery/scallops.webp",
    alt: "Seared scallops with beurre blanc on a white plate",
    href: "/private-chef",
    cta: "Plan a dinner",
  },
  {
    id: "catering",
    kicker: "Gatherings",
    title: "Catering",
    body: "Rehearsal dinners, birthdays, and coastal get-togethers. We design the menu with you, then show up and take care of the food so you can take care of your guests.",
    detail: "Menus designed together",
    image: "/gallery/salad-prep.webp",
    alt: "Toasted crostini, blistered cherry tomatoes and sweet corn on a cutting board",
    href: "/catering",
    cta: "Plan your event",
  },
  {
    id: "meal-prep",
    kicker: "Everyday support",
    title: "Weekly Meal Prep",
    body: "A chef comes to your home, cooks a week of meals in your kitchen, portions and labels everything, and leaves the kitchen clean. Groceries at actual cost.",
    detail: "From $175 per visit",
    image: "/hero-food-v2.webp",
    alt: "Containers of prepared meals with roasted vegetables and grains",
    href: "/meal-prep",
    cta: "See how it works",
  },
];

const gallery = [
  { src: "/gallery/salmon.webp", alt: "Roasted salmon with asparagus and saffron orzo" },
  { src: "/gallery/shortrib.webp", alt: "Braised short rib over creamy polenta" },
  { src: "/gallery/dessert.webp", alt: "Dessert plated with chocolate drizzle and whipped cream" },
];

/** Business details in the format search engines read (shown in Google's business panels). */
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_ORIGIN}/#business`,
  name: "Driftline Provisions",
  description:
    "Private chef dinners, small-scale catering, and weekly in-home meal prep on Oregon's North Coast, plus award-winning clam chowder at the Astoria Sunday Market.",
  url: SITE_ORIGIN,
  email: CONTACT_EMAIL,
  image: `${SITE_ORIGIN}/og.jpg`,
  logo: `${SITE_ORIGIN}/brand/driftline-logo-reversed.png`,
  address: { "@type": "PostalAddress", addressLocality: "Astoria", addressRegion: "OR", addressCountry: "US" },
  areaServed: ["Astoria, OR", "Warrenton, OR", "Gearhart, OR", "Seaside, OR", "Cannon Beach, OR"],
  founder: { "@type": "Person", name: "Casey Barella", jobTitle: "Chef" },
};

export default function Home() {
  return (
    <main className="dp">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />

      {/* HERO */}
      <section className="dp-hero" id="top">
        <div className="dp-hero-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> Crafted on the Oregon Coast
          </p>
          <h1>
            Weathered by the coast.
            <em>Made for the table.</em>
          </h1>
          <p className="dp-lede">
            Private chef dinners, catering, and weekly meal prep from Chef Casey
            Barella, built on Astoria&apos;s fish, foraged greens, and slow fire.
          </p>
          <div className="dp-hero-actions">
            <a className="dp-btn dp-btn-gold" href="/private-chef">
              Plan a private dinner <span aria-hidden="true">→</span>
            </a>
            <a className="dp-btn dp-btn-line" href="/meal-prep">
              Explore weekly meal prep
            </a>
          </div>
          <a className="dp-hero-market" href="/sunday-market">
            <span className="dp-dot" aria-hidden="true" />
            <span>
              <strong>Award-winning clam chowder</strong>
              Sundays at the Astoria Sunday Market →
            </span>
          </a>
        </div>
        <figure className="dp-hero-photo">
          <img src="/gallery/chef-casey.webp" alt="Chef Casey Barella cooking in a home kitchen" />
          <figcaption>
            <strong>Chef Casey Barella</strong>
            <span>Astoria, Oregon</span>
          </figcaption>
        </figure>
      </section>

      {/* PROOF STRIP */}
      <section className="dp-strip" aria-label="About Driftline Provisions">
        <p>20+ years in professional kitchens</p>
        <p>Founder of The Chowder Stop</p>
        <p>Award-winning clam chowder</p>
        <p>Astoria to Cannon Beach</p>
      </section>

      {/* SERVICES */}
      <section className="dp-section dp-services" id="services">
        <div className="dp-section-head">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> What we offer
          </p>
          <h2>
            Three ways to <em>eat well</em> on the coast.
          </h2>
        </div>
        <div className="dp-service-grid">
          {services.map((service, i) => (
            <article className="dp-service" key={service.id}>
              <a href={service.href} className="dp-service-img" tabIndex={-1} aria-hidden="true">
                <img src={smallImage(service.image)} alt="" loading="lazy" decoding="async" />
                <span>0{i + 1}</span>
              </a>
              <div className="dp-service-body">
                <small>{service.kicker}</small>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <div className="dp-service-foot">
                  <span>{service.detail}</span>
                  <a href={service.href}>
                    {service.cta} <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SUNDAY MARKET */}
      <section className="dp-market">
        <figure>
          <img src="/gallery/chowder-stand.webp" alt="Chef Casey at the Driftline clam chowder stand" loading="lazy" />
        </figure>
        <div className="dp-market-copy">
          <p className="dp-eyebrow dp-eyebrow-light">
            <span aria-hidden="true" /> Sundays · In season
          </p>
          <h2>
            Find us at the <em>Astoria Sunday Market.</em>
          </h2>
          <p>
            Our award-winning clam chowder, made fresh and served hot every
            Sunday, Mother&apos;s Day through mid-October on 12th Street in
            downtown Astoria.
          </p>
          <div className="dp-hero-actions">
            <a className="dp-btn dp-btn-gold" href="/sunday-market">
              Market days &amp; details <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* STORY TEASER */}
      <section className="dp-section dp-story">
        <div className="dp-story-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> Meet the chef
          </p>
          <h2>Casey Barella</h2>
          <p>
            Born and raised in the Pacific Northwest, Casey built The Chowder
            Stop into an award-winning Astoria favorite, then sold it to get
            back to what he loves most: cooking personal, memorable meals for
            the people in front of him.
          </p>
          <div className="dp-hero-actions">
            <a className="dp-btn dp-btn-line" href="/our-story">
              Read Casey&apos;s story <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <aside className="dp-story-side">
          <blockquote>
            “Great food doesn&apos;t have to be complicated. It just has to be
            unforgettable.”
            <cite>Chef Casey Barella</cite>
          </blockquote>
          <div className="dp-gallery">
            {gallery.map((photo) => (
              <img key={photo.src} src={smallImage(photo.src)} alt={photo.alt} loading="lazy" decoding="async" />
            ))}
          </div>
        </aside>
      </section>

      {/* PLAN YOUR TABLE */}
      <section className="dp-plan">
        <div className="dp-plan-card">
          <p className="dp-eyebrow dp-eyebrow-light">
            <span aria-hidden="true" /> Get in touch
          </p>
          <h2>
            Let&apos;s plan <em>your table.</em>
          </h2>
          <p>
            Tell us the date, the headcount, and what you&apos;re celebrating.
            Casey will reply personally with ideas and a proposal.
          </p>
          <div className="dp-plan-actions">
            <a className="dp-btn dp-btn-gold" href="/private-chef#inquire">
              Request a private dinner <span aria-hidden="true">→</span>
            </a>
            <a className="dp-btn dp-btn-ghost" href="/catering#request">
              Ask about catering
            </a>
            <a className="dp-btn dp-btn-ghost" href="/meal-prep#booking">
              Check meal prep availability
            </a>
            <a className="dp-btn dp-btn-ghost" href="/contact">
              Send a message
            </a>
          </div>
          <p className="dp-plan-area">
            Serving Astoria · Warrenton · Gearhart · Seaside · Cannon Beach
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
