import type { Metadata } from "next";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import ContactForm from "./ContactForm";
import "../home.css";

export const metadata: Metadata = {
  title: "Contact · Driftline Provisions · Astoria, Oregon",
  description:
    "Get in touch with Chef Casey Barella about private chef dinners, catering, or weekly meal prep on Oregon's North Coast.",
};

const paths = [
  {
    title: "Private chef dinner",
    body: "Pick a date, tell us about the evening, and get a custom proposal.",
    href: "/private-chef#inquire",
    cta: "Plan a dinner",
  },
  {
    title: "Catering",
    body: "Rehearsal dinners, celebrations, and gatherings of 10 or more.",
    href: "/catering#request",
    cta: "Plan an event",
  },
  {
    title: "Weekly meal prep",
    body: "Check availability for a chef in your kitchen each week.",
    href: "/meal-prep#booking",
    cta: "Check availability",
  },
];

export default function ContactPage() {
  return (
    <main className="dp">
      <SiteHeader current="/contact" />

      <section className="dp-page-head">
        <p className="dp-eyebrow">
          <span aria-hidden="true" /> Get in touch
        </p>
        <h1>
          Let&apos;s plan <em>your table.</em>
        </h1>
        <p className="dp-lede">
          Planning something specific? The quickest way is the form for that
          service. For anything else, send a message and Casey will get back to
          you personally.
        </p>
      </section>

      <section className="dp-section dp-section-tight">
        <div className="dp-path-grid">
          {paths.map((path) => (
            <a key={path.href} className="dp-path" href={path.href}>
              <h2>{path.title}</h2>
              <p>{path.body}</p>
              <span>
                {path.cta} <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="dp-request">
        <div className="dp-request-copy">
          <p className="dp-eyebrow dp-eyebrow-light">
            <span aria-hidden="true" /> Send a message
          </p>
          <h2>
            Questions, ideas, <em>anything at all.</em>
          </h2>
          <p>Casey reads every message and usually replies within a day.</p>
          <dl className="dp-contact-facts">
            <div>
              <dt>Based in</dt>
              <dd>Astoria, Oregon</dd>
            </div>
            <div>
              <dt>Serving</dt>
              <dd>Astoria · Warrenton · Gearhart · Seaside · Cannon Beach</dd>
            </div>
            <div>
              <dt>Sundays</dt>
              <dd>
                <a href="/sunday-market">Astoria Sunday Market</a>, Mother&apos;s Day
                to mid-October
              </dd>
            </div>
          </dl>
        </div>
        <div className="dp-request-form">
          <ContactForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
