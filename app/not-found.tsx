import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import "./home.css";
import Link from "next/link";

export const metadata = { title: "Page not found · Driftline Provisions", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="dp">
      <SiteHeader />
      <section className="dp-signin-page dp-not-found">
        <div className="dp-signin-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> Page not found
          </p>
          <h1>
            This page drifted <em>out with the tide.</em>
          </h1>
          <p className="dp-lede">The link may be old or mistyped. Here&apos;s where most people are headed:</p>
        </div>
        <nav className="dp-request-form dp-signin-card dp-not-found-links" aria-label="Popular pages">
          <a href="/private-chef">Private chef dinners →</a>
          <a href="/catering">Catering →</a>
          <a href="/meal-prep">Weekly meal prep →</a>
          <a href="/sunday-market">Sunday Market chowder →</a>
          <a href="/contact">Contact Casey →</a>
          <Link className="dp-btn dp-btn-gold" href="/">
            Back to the home page
          </Link>
        </nav>
      </section>
      <SiteFooter />
    </main>
  );
}
