"use client";

import { useState } from "react";
import BrandLogo from "./BrandLogo";
import Link from "next/link";

const links = [
  { href: "/private-chef", label: "Private Chef" },
  { href: "/catering", label: "Catering" },
  { href: "/meal-prep", label: "Meal Prep" },
  { href: "/sunday-market", label: "Sunday Market" },
  { href: "/our-story", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="dp-header dp-shell">
      <Link className="dp-header-logo" href="/" aria-label="Driftline Provisions home">
        <BrandLogo />
      </Link>
      <nav className={open ? "dp-nav open" : "dp-nav"} aria-label="Main navigation">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={close}
            aria-current={current === link.href ? "page" : undefined}
          >
            {link.label}
          </a>
        ))}
        <a className="dp-nav-signin" href="/account" onClick={close}>
          Sign in
        </a>
        <a className="dp-nav-cta-mobile" href="/contact" onClick={close}>
          Plan your table →
        </a>
      </nav>
      <div className="dp-header-actions">
        <a className="dp-signin" href="/account">
          Sign in
        </a>
        <a className="dp-btn dp-btn-gold" href="/contact">
          Plan your table <span aria-hidden="true">→</span>
        </a>
      </div>
      <button
        className="dp-menu-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
