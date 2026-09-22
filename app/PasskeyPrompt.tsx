"use client";

import { useEffect, useState } from "react";
import { biometricName, passkeysSupported, registerPasskey } from "./passkey-client";
import "./PasskeyPrompt.css";

const DISMISS_KEY = "dl-passkey-dismissed";
const ASK_AGAIN_MS = 30 * 24 * 60 * 60 * 1000;

function dismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < ASK_AGAIN_MS;
  } catch {
    return false;
  }
}

/**
 * After someone signs in with email, offer "Use Face ID next time?" once. If they
 * already have it on, or said "Not now" in the last 30 days, nothing shows.
 */
export default function PasskeyPrompt({ placement = "bottom" }: { placement?: "bottom" | "above-nav" }) {
  const [show, setShow] = useState(false);
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("Face ID");

  useEffect(() => {
    if (!passkeysSupported() || dismissedRecently()) return;
    setName(biometricName());
    fetch("/api/auth/passkey/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { signedIn?: boolean; count?: number } | null) => {
        if (!s?.signedIn || s.count) return;
        // Wait until the one-time agreement screen is out of the way.
        const gateOpen = () => Boolean(document.querySelector(".disclosure-gate"));
        if (!gateOpen()) return setShow(true);
        const watcher = new MutationObserver(() => {
          if (!gateOpen()) {
            watcher.disconnect();
            setShow(true);
          }
        });
        watcher.observe(document.body, { childList: true, subtree: true });
      })
      .catch(() => {});
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setShow(false);
  };

  async function turnOn() {
    setState("working");
    setError("");
    try {
      const ok = await registerPasskey();
      if (ok) {
        setState("done");
        window.setTimeout(() => setShow(false), 2500);
      } else setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work. Please try again.");
      setState("error");
    }
  }

  return (
    <aside className={`passkey-prompt ${placement === "above-nav" ? "above-nav" : ""}`} role="dialog" aria-label={`Sign in with ${name}`}>
      {state === "done" ? (
        <p className="passkey-done">
          <b>✓</b> {name} is on. Next time, just tap &ldquo;Sign in with {name}&rdquo;.
        </p>
      ) : (
        <>
          <div>
            <strong>Skip the email next time?</strong>
            <p>Turn on {name} and sign in with one tap on this device.</p>
            {error ? <p className="passkey-error">{error}</p> : null}
          </div>
          <div className="passkey-actions">
            <button type="button" className="passkey-yes" onClick={turnOn} disabled={state === "working"}>
              {state === "working" ? "One moment…" : `Use ${name}`}
            </button>
            <button type="button" className="passkey-no" onClick={dismiss}>
              Not now
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
