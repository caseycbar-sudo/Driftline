"use client";

import { useState } from "react";
import BrandLogo from "../BrandLogo";
import SignInForm from "../signin/SignInForm";
import { dollars, type MealPrepPackage } from "../pricing-core";
import Link from "next/link";
import { BUSINESS_PHONE, startPick } from "../request-core";
import { HOUSEHOLD_SIZES, afterSignupPath } from "../start-core";

type Step = "welcome" | "what" | "people" | "plan" | "account";
const PHONE_HREF = `tel:+1${BUSINESS_PHONE.replace(/\D/g, "")}`;
const TEXT_HREF = `sms:+1${BUSINESS_PHONE.replace(/\D/g, "")}`;

export default function StartFlow({
  packages,
  pantryKit,
  googleEnabled,
}: {
  packages: MealPrepPackage[];
  pantryKit: number;
  googleEnabled: boolean;
}) {
  const [step, setStep] = useState<Step>("welcome");
  const [people, setPeople] = useState(2);
  const pick = startPick(packages, people);
  const stepNumber = { welcome: 0, what: 1, people: 2, plan: 3, account: 4 }[step];

  return (
    <main className="dp dp-start">
      <header className="dp-start-top">
        <Link href="/" aria-label="Driftline Provisions home">
          <BrandLogo />
        </Link>
        <a className="dp-start-call" href={PHONE_HREF}>
          Call {BUSINESS_PHONE}
        </a>
      </header>

      <section className="dp-start-card" aria-live="polite">
        {stepNumber > 0 ? (
          <div className="dp-start-progress" aria-label={`Step ${stepNumber} of 4`}>
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={n <= stepNumber ? "on" : ""} />
            ))}
          </div>
        ) : null}

        {step === "welcome" ? (
          <>
            <p className="dp-eyebrow">
              <span aria-hidden="true" /> Welcome to Driftline
            </p>
            <h1>
              Dinner, handled. <em>In your own kitchen.</em>
            </h1>
            <p className="dp-start-lede">
              Chef Casey&apos;s team cooks a week of meals at your home, labels everything and cleans up. Answer two quick questions and we&apos;ll
              show you exactly what it costs.
            </p>
            <button className="dp-start-big" onClick={() => setStep("what")}>
              Get started <span aria-hidden="true">→</span>
            </button>
            <p className="dp-start-fine">
              Prefer to talk? <a href={PHONE_HREF}>Call</a> or <a href={TEXT_HREF}>text</a> {BUSINESS_PHONE}.
            </p>
          </>
        ) : null}

        {step === "what" ? (
          <>
            <h1 className="dp-start-q">What are you looking for?</h1>
            <div className="dp-start-choices">
              <button onClick={() => setStep("people")}>
                <strong>Weekly meal prep</strong>
                <span>A chef cooks a week of meals in your kitchen</span>
              </button>
              <a href="/private-chef">
                <strong>A private dinner</strong>
                <span>A special evening cooked at your table</span>
              </a>
              <a href="/catering">
                <strong>Catering for an event</strong>
                <span>Parties, gatherings and larger groups</span>
              </a>
            </div>
            <button className="dp-start-back" onClick={() => setStep("welcome")}>
              ← Back
            </button>
          </>
        ) : null}

        {step === "people" ? (
          <>
            <h1 className="dp-start-q">How many people are you feeding?</h1>
            <div className="dp-start-sizes">
              {HOUSEHOLD_SIZES.map((n) => (
                <button
                  key={n}
                  className={n === people ? "on" : ""}
                  onClick={() => {
                    setPeople(n);
                    setStep("plan");
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="dp-start-fine">
              Six or more? <a href={PHONE_HREF}>Call us</a> and we&apos;ll build a plan that fits.
            </p>
            <button className="dp-start-back" onClick={() => setStep("what")}>
              ← Back
            </button>
          </>
        ) : null}

        {step === "plan" ? (
          <>
            <p className="dp-eyebrow">
              <span aria-hidden="true" /> Your plan for {people === 1 ? "1 person" : `${people} people`}
            </p>
            {pick ? (
              <>
                <h1 className="dp-start-q">
                  The <em>{pick.pkg.name}</em> plan
                </h1>
                <div className="dp-start-price">
                  <b>{dollars(pick.pkg.priceCents)}</b>
                  <span>per visit, plus groceries at actual cost</span>
                </div>
                <ul className="dp-start-list">
                  <li>
                    You pick {pick.dishes} dishes from our cookbook. That makes {pick.portions} portions for {people === 1 ? "you" : `your ${people}`}.
                  </li>
                  <li>Your chef shops, cooks in your kitchen, portions and labels everything, and cleans up.</li>
                  <li>Spices, oil, salt and pepper come with the chef ({dollars(pantryKit)} pantry kit).</li>
                  <li>Want more variety? Add dishes later and the price updates as you go.</li>
                </ul>
                <button className="dp-start-big" onClick={() => setStep("account")}>
                  Pick my dishes <span aria-hidden="true">→</span>
                </button>
                <p className="dp-start-fine">Next we just need your email, so your choices are saved.</p>
              </>
            ) : (
              <>
                <h1 className="dp-start-q">Let&apos;s build this one together</h1>
                <p className="dp-start-lede">
                  We&apos;ll find the right plan for your household. <a href={PHONE_HREF}>Call</a> or <a href={TEXT_HREF}>text</a> {BUSINESS_PHONE}.
                </p>
              </>
            )}
            <button className="dp-start-back" onClick={() => setStep("people")}>
              ← Change household size
            </button>
          </>
        ) : null}

        {step === "account" ? (
          <>
            <h1 className="dp-start-q">Save your plan</h1>
            <p className="dp-start-lede">
              Enter your email and we&apos;ll send a 6-digit code. No password to remember. Then you&apos;ll pick your dishes.
            </p>
            <div className="dp-start-form">
              <SignInForm returnTo={afterSignupPath(people)} googleEnabled={googleEnabled} />
            </div>
            <button className="dp-start-back" onClick={() => setStep("plan")}>
              ← Back
            </button>
          </>
        ) : null}
      </section>
    </main>
  );
}
