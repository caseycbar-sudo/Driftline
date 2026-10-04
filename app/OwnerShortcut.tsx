"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./OwnerShortcut.css";

/**
 * A small "Owner dashboard" button pinned to the corner of every page, shown
 * only when the owner is signed in. Customers and chefs never see it, and the
 * dashboard itself still checks access on the server, so this is just a
 * shortcut, not a key.
 */
export default function OwnerShortcut() {
  const pathname = usePathname() ?? "";
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { role?: string } | null) => setIsOwner(s?.role === "admin"))
      .catch(() => {});
  }, []);

  if (!isOwner || pathname.startsWith("/portal")) return null;

  return (
    <a className="owner-shortcut" href="/portal">
      Owner dashboard <span aria-hidden="true">→</span>
    </a>
  );
}
