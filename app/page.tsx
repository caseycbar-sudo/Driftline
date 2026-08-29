"use client";

import { useState } from "react";
import BrandLogo from "./BrandLogo";

const packages = [
  {
    name: "Essential",
    portions: 6,
    price: 175,
    note: "A lighter weekly reset",
  },
  {
    name: "Classic",
    portions: 8,
    price: 195,
    note: "Our most flexible starter",
  },
  {
    name: "Weekly",
    portions: 12,
    price: 235,
    note: "A full week made easier",
    featured: true,
  },
  { name: "Couples", portions: 16, price: 285, note: "More variety for two" },
  {
    name: "Household",
    portions: 20,
    price: 325,
    note: "Reliable family coverage",
  },
  {
    name: "Family",
    portions: 24,
    price: 365,
    note: "The most meals per visit",
  },
];

const meals = [
  {
    id: 2,
    title: "Cider-Braised Chicken",
    detail: "Yukon potatoes · green beans",
    category: "Poultry",
    image: "/cookbook/r-002-v2.webp",
  },
  {
    id: 4,
    title: "Greek Chicken Bowls",
    detail: "Quinoa · cucumber · roasted tomatoes",
    category: "Poultry",
    image: "/cookbook/r-004-v2.webp",
  },
  {
    id: 26,
    title: "Slow-Cooked Beef Ragù",
    detail: "Creamy polenta · roasted carrots",
    category: "Beef, Pork & Lamb",
    image: "/cookbook/r-026-v2.webp",
  },
  {
    id: 39,
    title: "Maple Dijon Pork",
    detail: "Wild rice · Brussels sprouts",
    category: "Beef, Pork & Lamb",
    image: "/cookbook/r-039-v2.webp",
  },
  {
    id: 51,
    title: "Coastal Salmon Cakes",
    detail: "Brown rice · green beans",
    category: "Seafood",
    image: "/cookbook/r-051-v2.webp",
  },
  {
    id: 53,
    title: "Mediterranean Baked Cod",
    detail: "Quinoa · tomatoes · zucchini",
    category: "Seafood",
    image: "/cookbook/r-053-v2.webp",
  },
  {
    id: 76,
    title: "Red Lentil Coconut Curry",
    detail: "Brown rice · spinach · carrots",
    category: "Vegetarian",
    image: "/cookbook/r-076-v2.webp",
  },
  {
    id: 89,
    title: "Mushroom Cottage Pie",
    detail: "Mashed potatoes · mushrooms · carrots",
    category: "Vegetarian",
    image: "/cookbook/r-089-v2.webp",
  },
];

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

export default function Home() {
  const [selected, setSelected] = useState("Weekly");
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const current = packages.find((item) => item.name === selected)!;

  return (
    <main>
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          aria-label="Driftline At Home, return to top"
        >
          <BrandLogo />
        </a>
        <nav
          className={menuOpen ? "nav open" : "nav"}
          aria-label="Main navigation"
        >
          <a href="#how" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#menu" onClick={() => setMenuOpen(false)}>
            The menu
          </a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>
            Pricing
          </a>
          <a href="#care" onClick={() => setMenuOpen(false)}>
            Our cleanup promise
          </a>
          <a href="/private-chef" onClick={() => setMenuOpen(false)}>
            Private Chef
          </a>
          <a href="/cookbook" onClick={() => setMenuOpen(false)}>
            Cookbook
          </a>
          <a href="/account" onClick={() => setMenuOpen(false)}>
            Sign in
          </a>
          <a
            className="nav-staff"
            href="/chef"
            onClick={() => setMenuOpen(false)}
          >
            Chef Login
          </a>
        </nav>
        <a className="staff-header-link" href="/chef">
          Chef Login
        </a>
        <a className="header-cta" href="/account">
          Create account <span>→</span>
        </a>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <span />
          <span />
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Welcome home to an easier week
          </p>
          <h1>
            A week of good meals,
            <br />
            <em>made in your kitchen.</em>
          </h1>
          <p className="hero-lede">
            A trusted local chef shops, cooks, portions, labels, and cleans
            up—so your refrigerator feels taken care of and your week feels
            lighter.
          </p>
          <div className="hero-actions">
            <a className="primary-btn" href="/account">
              Create your account <span>→</span>
            </a>
            <a className="text-btn" href="#how">
              <span className="play">▶</span> See how a visit works
            </a>
          </div>
          <div
            className="service-paths"
            aria-label="Choose a Driftline service"
          >
            <a className="active" href="#pricing">
              <small>EVERYDAY SUPPORT</small>
              <strong>Meal Prep</strong>
              <span>Weekly meals made at home →</span>
            </a>
            <a href="/private-chef">
              <small>SPECIAL OCCASIONS</small>
              <strong>Private Chef</strong>
              <span>A restaurant experience at home →</span>
            </a>
          </div>
          <div className="trust-row">
            <div className="avatars">
              <span>CB</span>
              <span>JL</span>
              <span>AM</span>
            </div>
            <div>
              <strong>Local, vetted chefs</strong>
              <small>Background checked · Food-handler certified</small>
            </div>
          </div>
        </div>
        <div
          className="hero-image"
          role="img"
          aria-label="A Driftline chef portioning freshly prepared meals in a client's home kitchen"
        >
          <div className="hero-note">
            <span className="note-check">
              <CheckIcon />
            </span>
            <span>
              <small>Today&apos;s visit</small>
              <strong>12 portions prepared</strong>
              <em>Kitchen clean · Meals labeled</em>
            </span>
          </div>
        </div>
      </section>

      <section className="promise-band" aria-label="Service highlights">
        <span>
          <CheckIcon /> Groceries at actual cost
        </span>
        <span>
          <CheckIcon /> Meals tailored to your household
        </span>
        <span>
          <CheckIcon /> Kitchen cleaned after every visit
        </span>
        <span>
          <CheckIcon /> Photo updates included
        </span>
      </section>

      <section
        className="account-invite section"
        aria-label="Customer account benefits"
      >
        <div>
          <p className="eyebrow">
            <span /> Made personal from the start
          </p>
          <h2>
            Your meals, preferences, and visits—all in one welcoming place.
          </h2>
          <p>
            Create a free Driftline account to tell us about your household,
            keep dietary needs organized, save dishes from the cookbook, and
            pick up where you left off.
          </p>
          <a className="primary-btn" href="/account">
            Set up my household <span>→</span>
          </a>
          <small>
            Already joined? <a href="/account">Sign in here</a>
          </small>
        </div>
        <div className="account-preview">
          <span className="preview-label">YOUR DRIFTLINE HOME</span>
          <h3>Good morning, Casey.</h3>
          <p>Everything we need to make this week feel lighter.</p>
          <div className="preview-item">
            <i>✓</i>
            <span>
              <strong>Household preferences</strong>
              <small>Saved and ready for your chef</small>
            </span>
          </div>
          <div className="preview-item">
            <i>12</i>
            <span>
              <strong>Weekly portions</strong>
              <small>Your preferred package</small>
            </span>
          </div>
          <div className="preview-item">
            <i>♡</i>
            <span>
              <strong>Favorite recipes</strong>
              <small>Keep meal ideas close</small>
            </span>
          </div>
        </div>
      </section>

      <section className="how section" id="how">
        <div className="section-intro">
          <p className="eyebrow">
            <span /> How it works
          </p>
          <h2>One visit. A calmer week.</h2>
          <p>
            We bring the planning and the cooking. You keep the comfort of meals
            made right at home.
          </p>
        </div>
        <div className="steps">
          <article>
            <span className="step-no">01</span>
            <div className="line" />
            <div className="step-icon">⌁</div>
            <h3>Tell us what works</h3>
            <p>
              Choose a package, share favorites, dislikes, allergies, and the
              rhythm of your household.
            </p>
          </article>
          <article>
            <span className="step-no">02</span>
            <div className="line" />
            <div className="step-icon">♨</div>
            <h3>Your chef comes to you</h3>
            <p>
              Your matched chef shops, cooks every dish in your kitchen,
              portions, labels, and tidies up.
            </p>
          </article>
          <article>
            <span className="step-no">03</span>
            <div className="step-icon">✓</div>
            <h3>Meals ready. Kitchen clean.</h3>
            <p>
              Your chef labels every dish, cleans the cooking area, and shares
              photos of the finished meals and kitchen before leaving.
            </p>
          </article>
        </div>
      </section>

      <section className="menu-section section" id="menu">
        <div className="menu-heading">
          <div>
            <p className="eyebrow light">
              <span /> 100 recipes to explore
            </p>
            <h2>
              More choice for every
              <br />
              kind of household.
            </h2>
          </div>
          <p>
            Browse poultry, beef and pork, seafood, and vegetarian dishes. Save
            favorites to your account or share a family recipe of your own.
          </p>
        </div>
        <div className="meal-grid">
          {meals.map((meal) => (
            <a className="meal-card" href={`/cookbook?recipe=${meal.id}`} key={meal.title}>
              <div
                className="meal-photo"
                style={{
                  backgroundImage: `url('${meal.image}')`,
                }}
              >
                <span>{meal.category}</span>
              </div>
              <div>
                <h3>{meal.title}</h3>
                <p>{meal.detail}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="menu-actions">
          <a href="/cookbook">
            Browse all 100 recipes <span>→</span>
          </a>
          <p>
            Allergy-aware planning <span>·</span> Portion calculator{" "}
            <span>·</span> Add your own recipe
          </p>
        </div>
      </section>

      <section className="pricing section" id="pricing">
        <div className="section-intro compact">
          <p className="eyebrow">
            <span /> Simple service pricing
          </p>
          <h2>Choose the right amount for your week.</h2>
          <p>
            Service includes planning, cooking, portioning, labeling, and
            cleanup. Groceries are charged separately at actual cost.
          </p>
        </div>
        <div className="package-grid">
          {packages.map((item) => (
            <button
              key={item.name}
              className={`package-card ${selected === item.name ? "selected" : ""} ${item.featured ? "featured" : ""}`}
              onClick={() => setSelected(item.name)}
            >
              {item.featured ? (
                <span className="popular">Most popular</span>
              ) : null}
              <span className="radio">
                {selected === item.name ? <i /> : null}
              </span>
              <small>{item.name}</small>
              <strong>
                {item.portions} <em>portions</em>
              </strong>
              <span className="price">
                <b>${item.price}</b> / visit
              </span>
              <p>{item.note}</p>
            </button>
          ))}
        </div>
        <div className="selection-bar">
          <span>
            <small>Your selection</small>
            <strong>
              {current.name} · {current.portions} portions
            </strong>
          </span>
          <span className="selection-price">
            <strong>${current.price}</strong>
            <small>+ groceries</small>
          </span>
          <a href="#booking">
            Start with {current.name} <span>→</span>
          </a>
        </div>
      </section>

      <section className="care section" id="care">
        <div className="care-card">
          <div className="care-copy">
            <p className="eyebrow light">
              <span /> Our promise after every visit
            </p>
            <h2>
              Meals ready.
              <br />
              Kitchen clean.
            </h2>
            <p>
              Your chef does more than cook. Every meal-prep visit ends with the
              food portioned and labeled, the cooking area cleaned, and photos
              added to your account so you can see exactly what was prepared.
            </p>
            <ul>
              <li>
                <CheckIcon /> Counters, sink, and cooking area cleaned
              </li>
              <li>
                <CheckIcon /> Finished-meal and clean-kitchen photos
              </li>
              <li>
                <CheckIcon /> Food labeled with storage and reheating guidance
              </li>
            </ul>
          </div>
          <div className="update-card">
            <span className="update-top">
              <i>DB</i>
              <span>
                <strong>Your Driftline visit is complete</strong>
                <small>Today at 12:42 PM</small>
              </span>
            </span>
            <div className="update-body">
              <p>
                Your meals are in the refrigerator and your kitchen has been
                cleaned.
              </p>
              <dl>
                <div>
                  <dt>3</dt>
                  <dd>dishes</dd>
                </div>
                <div>
                  <dt>12</dt>
                  <dd>portions</dd>
                </div>
                <div>
                  <dt>✓</dt>
                  <dd>cleanup done</dd>
                </div>
              </dl>
              <small>
                Open your account to view today&apos;s dishes, photos, and chef
                notes.
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="booking section" id="booking">
        <div className="booking-copy">
          <p className="eyebrow">
            <span /> Currently serving the North Coast
          </p>
          <h2>Let&apos;s make your week easier.</h2>
          <p>
            Tell us where you&apos;re located and we&apos;ll help you find the
            right package and chef.
          </p>
          <div className="service-area">
            <strong>Current service area</strong>
            <span>Astoria · Warrenton · Gearhart · Seaside · Cannon Beach</span>
          </div>
        </div>
        <form
          className="booking-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          {submitted ? (
            <div className="success">
              <span>
                <CheckIcon />
              </span>
              <h3>You&apos;re on the list.</h3>
              <p>
                Thanks—we&apos;ll be in touch to learn about your household and
                confirm availability.
              </p>
              <button type="button" onClick={() => setSubmitted(false)}>
                Add another household
              </button>
            </div>
          ) : (
            <>
              <h3>Check availability</h3>
              <label>
                Who is the service for?
                <select defaultValue="myself">
                  <option value="myself">My household</option>
                  <option value="parent">A parent or loved one</option>
                  <option value="client">A client I care for</option>
                </select>
              </label>
              <div className="form-row">
                <label>
                  First name
                  <input required placeholder="First name" />
                </label>
                <label>
                  Email
                  <input required type="email" placeholder="you@example.com" />
                </label>
              </div>
              <label>
                Service ZIP code
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  placeholder="97103"
                />
              </label>
              <label>
                Preferred package
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {packages.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                </select>
              </label>
              <button className="primary-btn form-submit">
                Request availability <span>→</span>
              </button>
              <small className="privacy-note">
                No payment today. We&apos;ll contact you before anything is
                scheduled.
              </small>
            </>
          )}
        </form>
      </section>

      <footer>
        <div className="footer-brand">
          <BrandLogo />
        </div>
        <p>Good meals. Familiar kitchens. More ease at home.</p>
        <div>
          <a href="#how">Meal prep</a>
          <a href="/private-chef">Private chef</a>
          <a href="/cookbook">Cookbook</a>
          <a href="/account">Customer account</a>
          <a href="/disclosures">Disclosures</a>
          <a className="staff-link" href="/chef">
            Chef login
          </a>
          <a className="staff-link" href="/portal">
            Admin login
          </a>
        </div>
        <small>© 2026 Driftline Provisions · Astoria, Oregon</small>
      </footer>
    </main>
  );
}
