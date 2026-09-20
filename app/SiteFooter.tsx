import BrandLogo from "./BrandLogo";

export default function SiteFooter() {
  return (
    <div className="dp-footer dp-shell" role="contentinfo">
      <div className="dp-footer-brand">
        <a href="/" aria-label="Driftline Provisions home">
          <BrandLogo />
        </a>
        <p>Coastal cooking for your table. Private chef, catering, and in-home meal prep on Oregon&apos;s North Coast.</p>
      </div>
      <div className="dp-footer-col">
        <p className="dp-footer-heading">Services</p>
        <a href="/private-chef">Private Chef</a>
        <a href="/catering">Catering</a>
        <a href="/meal-prep">Weekly Meal Prep</a>
        <a href="/cookbook">Cookbook</a>
      </div>
      <div className="dp-footer-col">
        <p className="dp-footer-heading">Sunday Market</p>
        <span>12th Street, downtown Astoria</span>
        <span>Sundays 10am to 3pm</span>
        <span>Mother&apos;s Day to mid-October</span>
        <a href="/sunday-market">Market details →</a>
      </div>
      <div className="dp-footer-col">
        <p className="dp-footer-heading">Driftline</p>
        <a href="/our-story">Our Story</a>
        <a href="/contact">Contact</a>
        <a href="/faq">Questions</a>
        <a href="/account">Customer sign in</a>
        <a href="/chef">Chef login</a>
        <a href="/disclosures">Disclosures</a>
      </div>
      <small>© 2026 Driftline Provisions · Astoria, Oregon</small>
    </div>
  );
}
