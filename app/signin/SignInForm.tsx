"use client";

import { FormEvent, useEffect, useState } from "react";
import { biometricName, passkeysSupported, signInWithPasskey } from "../passkey-client";

const SERVER_ERRORS: Record<string, string> = {
  "400": "Please enter a valid email address.",
  "429": "Too many sign-in links requested. Please check your inbox, or try again in an hour.",
  "503": "We couldn't send the email just now. Please try again in a few minutes.",
};

export default function SignInForm({
  returnTo,
  initialSent = false,
  initialError = "",
  googleEnabled = false,
}: {
  returnTo: string;
  initialSent?: boolean;
  initialError?: string;
  googleEnabled?: boolean;
}) {
  const startError = initialError ? SERVER_ERRORS[initialError] || "Something went wrong. Please try again." : "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    initialSent ? "sent" : startError ? "error" : "idle",
  );
  const [error, setError] = useState(startError);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [passkey, setPasskey] = useState<{ ok: boolean; name: string }>({ ok: false, name: "Face ID" });
  const [passkeyBusy, setPasskeyBusy] = useState(false);

  useEffect(() => {
    setPasskey({ ok: passkeysSupported(), name: biometricName() });
  }, []);

  async function usePasskey() {
    setPasskeyBusy(true);
    setError("");
    try {
      const to = await signInWithPasskey(returnTo);
      if (to) window.location.assign(to);
      else setPasskeyBusy(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work. Use your email instead.");
      setState("error");
      setPasskeyBusy(false);
    }
  }

  async function checkCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setCodeError("");
    try {
      const response = await fetch("/api/auth/code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = (await response.json().catch(() => ({}))) as { to?: string; error?: string };
      if (response.ok) {
        window.location.assign(body.to || returnTo);
        return;
      }
      setCodeError(body.error || "That code didn't work.");
    } catch {
      setCodeError("We couldn't reach the server. Check your connection and try again.");
    }
    setChecking(false);
  }

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
          We sent a 6-digit code to {email ? <strong>{email}</strong> : "your email"}. Type it here, or tap the link in the email. Both expire in
          15 minutes.
        </p>
        {email ? (
          <form className="dp-code-form" onSubmit={checkCode}>
            <label htmlFor="signin-code">Sign-in code</label>
            <input
              id="signin-code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]*"
              maxLength={7}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              autoFocus
              required
            />
            <button disabled={checking || code.length !== 6}>{checking ? "Checking…" : "Sign in"}</button>
            {codeError ? (
              <p className="dp-signin-error" role="alert">
                {codeError}
              </p>
            ) : null}
          </form>
        ) : null}
        <p className="dp-signin-small">No email after a minute or two? Check spam, or</p>
        <button type="button" className="dp-link-button" onClick={() => { setCode(""); setCodeError(""); setState("idle"); }}>
          send a new code
        </button>
      </div>
    );
  }

  const quick = passkey.ok || googleEnabled;
  const googleHref = `/api/auth/google/start?return_to=${encodeURIComponent(returnTo)}`;

  return (
    <form method="post" action="/api/auth/request" onSubmit={submit}>
      <input type="hidden" name="returnTo" value={returnTo} />
      {quick ? (
        <div className="dp-signin-quick">
          {passkey.ok ? (
            <button type="button" className="dp-signin-passkey" onClick={usePasskey} disabled={passkeyBusy}>
              {passkeyBusy ? "One moment…" : `Sign in with ${passkey.name}`}
            </button>
          ) : null}
          {googleEnabled ? (
            <a className="dp-signin-google" href={googleHref}>
              <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              Continue with Google
            </a>
          ) : null}
          <p className="dp-signin-or">
            <span>or use your email</span>
          </p>
        </div>
      ) : null}
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
        {state === "sending" ? "Sending…" : "Email me a sign-in code"} <span aria-hidden="true">→</span>
      </button>
      {state === "error" ? (
        <p className="dp-signin-error" role="alert">
          {error}
        </p>
      ) : null}
      <p className="dp-signin-small">No password needed. We&apos;ll email you a 6-digit code. After that you can turn on {passkey.ok ? passkey.name : "one-tap sign-in"}.</p>
    </form>
  );
}
