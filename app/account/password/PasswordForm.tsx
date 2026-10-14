"use client";

import { FormEvent, useEffect, useState } from "react";

export default function PasswordForm({ email }: { email: string }) {
  const [has, setHas] = useState<boolean | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/password", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { hasPassword?: boolean } | null) => setHas(Boolean(body?.hasPassword)))
      .catch(() => setHas(false));
  }, []);

  async function send(payload: Record<string, string>, done: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; hasPassword?: boolean };
      if (response.ok) {
        setHas(Boolean(body.hasPassword));
        setMessage(done);
        setCurrent("");
        setNext("");
        setAgain("");
      } else {
        setError(body.error || "That didn't work. Please try again.");
      }
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    }
    setBusy(false);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (next !== again) {
      setError("The two new passwords don't match.");
      setMessage("");
      return;
    }
    void send({ action: "set", password: next, current }, has ? "Password changed. Other devices were signed out." : "Password saved. You can sign in with it from now on.");
  }

  if (has === null) return <p className="dp-signin-small">One moment…</p>;

  return (
    <form onSubmit={save}>
      <p className="dp-signin-small">Signed in as <strong>{email}</strong></p>
      {has ? (
        <>
          <label htmlFor="pw-current">Current password</label>
          <input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <p className="dp-signin-small">Forgot it? If you just signed in with an emailed code, you can leave this empty.</p>
        </>
      ) : null}
      <label htmlFor="pw-new">{has ? "New password" : "Choose a password"}</label>
      <input id="pw-new" type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={next} onChange={(e) => setNext(e.target.value)} />
      <label htmlFor="pw-again">Type it again</label>
      <input id="pw-again" type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={again} onChange={(e) => setAgain(e.target.value)} />
      <p className="dp-signin-small">At least 10 characters. A few unrelated words works well.</p>
      <button disabled={busy}>{busy ? "Saving…" : has ? "Change password" : "Save password"}</button>
      {has ? (
        <button type="button" className="dp-link-button" disabled={busy} onClick={() => void send({ action: "remove", current }, "Password removed. Use an emailed code to sign in.")}>
          Remove my password
        </button>
      ) : null}
      {error ? (
        <p className="dp-signin-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="dp-signin-small" role="status">{message}</p> : null}
    </form>
  );
}
