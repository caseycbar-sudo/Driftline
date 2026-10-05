"use client";

import { useEffect, useState } from "react";
import "./AccountBadge.css";

type Session = { signedIn: boolean; role: "admin" | "chef" | null; email: string };

const LABELS = { admin: "Owner", chef: "Chef", customer: "Customer" } as const;

/**
 * A small badge pinned to the corner of every page for anyone who is signed
 * in. It says which kind of account this is and which email, in a color that
 * changes with the role, so it is obvious when testing with several accounts.
 * It is informational only and links nowhere except Sign out.
 */
export default function AccountBadge() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Session | null) => setSession(s?.signedIn ? s : null))
      .catch(() => {});
  }, []);

  if (!session) return null;
  const kind = session.role === "admin" ? "admin" : session.role === "chef" ? "chef" : "customer";

  return (
    <div className={`account-badge account-badge-${kind}`} role="status">
      <strong>{LABELS[kind]}</strong>
      <span>{session.email}</span>
      <a href="/signout?return_to=%2Fsignin">Sign out</a>
    </div>
  );
}
