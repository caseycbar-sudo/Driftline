import type { Metadata } from "next";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import InquiryForm from "../private-chef/InquiryForm";
import "../home.css";

export const metadata: Metadata = {
  title: "Catering · Driftline Provisions · Astoria, Oregon",
  description:
    "Small-scale catering on Oregon's North Coast from Chef Casey Barella: rehearsal dinners, celebrations, and coastal gatherings with menus designed together.",
};

const occasions = [
  {
    title: "Rehearsal dinners & small weddings",
    body: "A relaxed, generous meal for the people who matter most, served family style or plated.",
  },
  {
    title: "Birthdays & celebrations",
    body: "Milestone dinners, graduations, and backyard parties with food people talk about afterward.",
  },
  {
    title: "Company & team gatherings",
    body: "Offsites, client dinners, and staff celebrations, from working lunches to a proper sit-down meal.",
  },
  {
    title: "Vacation groups",
    body: "Big rental house on the coast? We feed the whole crew so nobody spends the trip in the kitchen.",
  },
];

const styles = [
  { title: "Family style", body: "Shared platters passed down the table. Warm, abundant, and easy to talk over." },
  { title: "Plated", body: "Coursed and served to each guest for a more formal evening." },
  { title: "Buffet & stations", body: "Flexible for larger groups and mingling crowds." },
];

export default function CateringPage() {
  return (
    <main className="dp">
      <SiteHeader current="/catering" />

      <section className="dp-hero dp-hero-short">
        <div className="dp-hero-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> Catering on the North Coast
          </p>
          <h1>
            Gatherings,
            <em>handled.</em>
          </h1>
          <p className="dp-lede">
            Thoughtful menus built with you and cooked from Astoria&apos;s best
            ingredients. We take care of the food so you can take care of your
            guests.
          </p>
          <div className="dp-hero-actions">
            <a className="dp-btn dp-btn-gold" href="#request">
              Plan your event <span aria-hidden="true">→</span>
            </a>
            <a className="dp-btn dp-btn-line" href="#how">
              How it works
            </a>
          </div>
        </div>
        <figure className="dp-hero-photo">
          <img src="/gallery/salad-prep.webp" alt="Crostini, blistered cherry tomatoes and sweet corn prepped on a cutting board" />
        </figure>
      </section>

      <section className="dp-section">
        <div className="dp-section-head">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> What we cater
          </p>
          <h2>
            Small-scale events, <em>done with care.</em>
          </h2>
        </div>
        <div className="dp-tiles">
          {occasions.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dp-athome" id="how">
        <div className="dp-athome-inner">
          <div>
            <p className="dp-eyebrow">
              <span aria-hidden="true" /> How it works
            </p>
            <h2>
              One conversation, <em>one clear proposal.</em>
            </h2>
            <p>
              Every event is different, so every event is quoted on its own. The
              proposal covers the menu, staffing, and anything else your event
              needs, with no surprises on the day.
            </p>
            <div className="dp-style-list">
              {styles.map((style) => (
                <div key={style.title}>
                  <strong>{style.title}</strong>
                  <span>{style.body}</span>
                </div>
              ))}
            </div>
          </div>
          <ol className="dp-steps">
            <li>
              <strong>Tell us about the event</strong>
              <span>Date, headcount, location, and the feel you&apos;re going for.</span>
            </li>
            <li>
              <strong>We design the menu together</strong>
              <span>Casey follows up personally with ideas, then sends a proposal.</span>
            </li>
            <li>
              <strong>Event day</strong>
              <span>We cook, serve, and clean up. You enjoy your party.</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="dp-request" id="request">
        <div className="dp-request-copy">
          <p className="dp-eyebrow dp-eyebrow-light">
            <span aria-hidden="true" /> Start planning
          </p>
          <h2>
            Tell us about <em>your event.</em>
          </h2>
          <p>
            Send the basics and Casey will get back to you personally with
            availability and menu ideas.
          </p>
          <p className="dp-request-area">
            Serving Astoria · Warrenton · Gearhart · Seaside · Cannon Beach, and
            nearby by request.
          </p>
        </div>
        <div className="dp-request-form">
          <InquiryForm type="catering" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
