"use client";

import { FormEvent, useState } from "react";

const SERVER_ERRORS: Record<string, string> = {
  "400": "Please enter a valid email address.",
  "429": "Too many sign-in links requested. Please check your inbox, or try again in an hour.",
  "503": "We couldn't send the email just now. Please try again in a few minutes.",
};

export default function SignInForm({
  returnTo,
  initialSent = false,
  initialError = "",
}: {
  returnTo: string;
  initialSent?: boolean;
  initialError?: string;
}) {
  const startError = initialError ? SERVER_ERRORS[initialError] || "Something went wrong. Please try again." : "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    initialSent ? "sent" : startError ? "error" : "idle",
  );
  const [error, setError] = useState(startError);
  const [email, setEmail] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, returnTo }),
      });
      if (response.ok) {
        setState("sent");
        return;
      }
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Something went wrong. Please try again.");
      setState("error");
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="dp-signin-sent" role="status">
        <b aria-hidden="true">✉</b>
        <h2>Check your email</h2>
        <p>
          We sent a sign-in link to {email ? <strong>{email}</strong> : "your email"}. Tap it on this device to sign in. It works once and expires in
          15 minutes.
        </p>
        <p className="dp-signin-small">No email after a minute or two? Check spam, or</p>
        <button type="button" className="dp-link-button" onClick={() => setState("idle")}>
          send another link
        </button>
      </div>
    );
  }

  return (
    <form method="post" action="/api/auth/request" onSubmit={submit}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <label htmlFor="signin-email">Email address</label>
      <input
        id="signin-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={state === "error" ? true : undefined}
      />
      <button disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Email me a sign-in link"} <span aria-hidden="true">→</span>
      </button>
      {state === "error" ? (
        <p className="dp-signin-error" role="alert">
          {error}
        </p>
      ) : null}
      <p className="dp-signin-small">No password needed. We&apos;ll email you a secure link.</p>
    </form>
  );
}
