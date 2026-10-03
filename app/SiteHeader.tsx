"use client";

import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";
import Link from "next/link";

const links = [
  { href: "/private-chef", label: "Private Chef" },
  { href: "/catering", label: "Catering" },
  { href: "/meal-prep", label: "Meal Prep" },
  { href: "/cookbook", label: "Cookbook", menuOnly: true },
  { href: "/sunday-market", label: "Sunday Market" },
  { href: "/our-story", label: "Our Story" },
  { href: "/faq", label: "Questions", menuOnly: true },
  { href: "/contact", label: "Contact" },
];

type Session = { signedIn: boolean; role: "admin" | "chef" | null; firstName: string };

/** Where the signed-in person's own area lives, and what to call it. */
function homeFor(session: Session | null) {
  if (!session?.signedIn) return { href: "/account", label: "Sign in" };
  if (session.role === "admin") return { href: "/portal", label: "Owner dashboard" };
  if (session.role === "chef") return { href: "/chef/workspace", label: "Chef workspace" };
  return { href: "/account", label: "My account" };
}

export default function SiteHeader({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const close = () => setOpen(false);
  const home = homeFor(session);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Session | null) => s && setSession(s))
      .catch(() => {});
  }, []);

  // Close with Escape, and stop the page behind from scrolling while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="dp-header dp-shell">
      <Link className="dp-header-logo" href="/" aria-label="Driftline Provisions home">
        <BrandLogo />
      </Link>
      <nav className={open ? "dp-nav open" : "dp-nav"} aria-label="Main navigation">
        {session?.signedIn ? (
          <div className="dp-nav-account">
            <small>{session.firstName ? `Signed in · ${session.firstName}` : "Signed in"}</small>
            <a href={home.href} onClick={close}>
              {home.label} →
            </a>
            {session.role ? (
              <a href="/account" onClick={close}>
                My customer account
              </a>
            ) : null}
            <a href="/signout?return_to=%2F" onClick={close}>
              Sign out
            </a>
          </div>
        ) : null}
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={close}
            className={link.menuOnly ? "dp-nav-menu-only" : undefined}
            aria-current={current === link.href ? "page" : undefined}
          >
            {link.label}
          </a>
        ))}
        {session?.signedIn ? null : (
          <a className="dp-nav-signin" href="/account" onClick={close}>
            Sign in
          </a>
        )}
        <a className="dp-nav-cta-mobile" href="/contact" onClick={close}>
          Plan your table →
        </a>
      </nav>
      <div className="dp-header-actions">
        <a className="dp-signin" href={home.href}>
          {home.label}
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
        <span />
      </button>
    </header>
  );
}
