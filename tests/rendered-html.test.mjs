import assert from "node:assert/strict";
import test from "node:test";

import { startBuiltWorker } from "./worker-harness.mjs";

async function renderPage(worker, path) {
  const response = await worker.fetch(path, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200, `${path} should return 200`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  // A complete server-rendered document with an RSC payload to hydrate from,
  // so a blank or error-boundary render fails instead of passing on an empty 200.
  assert.match(html, /^<!DOCTYPE html><html lang="en">/i);
  assert.match(html, /__VINEXT_RSC_DONE__=true/);
  assert.match(
    html,
    /<meta(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']+["'])[^>]*>/i,
  );
  return html;
}

test("the built worker server-renders the public pages", async () => {
  const worker = await startBuiltWorker();
  try {
    const home = await renderPage(worker, "/");
    assert.match(home, /<title>Driftline Provisions · Private Chef &amp; Catering in Astoria, Oregon<\/title>/i);
    assert.match(home, /Weathered by the coast\./);
    assert.match(home, /Astoria Sunday Market/);
    assert.match(home, /The Chowder Stop/);
    assert.match(home, /href="\/catering"/);
    assert.match(home, /href="\/meal-prep"/);
    // The logo is served from this site, not hot-linked from Squarespace.
    assert.match(home, /\/brand\/driftline-logo-reversed\.png/);
    assert.doesNotMatch(home, /squarespace-cdn\.com/);

    const mealPrep = await renderPage(worker, "/meal-prep");
    assert.match(mealPrep, /A week of good meals,/);
    assert.match(mealPrep, /<section class="pricing section" id="pricing">/);
    // The availability form fields are named, so their values are actually sent.
    for (const name of ["fullName", "email", "zip", "packageName", "serviceFor"]) {
      assert.match(mealPrep, new RegExp(`name="${name}"`), `meal prep form is missing ${name}`);
    }

    const catering = await renderPage(worker, "/catering");
    assert.match(catering, /Gatherings,/);
    assert.match(catering, /id="request"/);
    assert.match(catering, /name="guestCount"/);

    const privateChef = await renderPage(worker, "/private-chef");
    assert.match(privateChef, /id="inquire"/);

    const story = await renderPage(worker, "/our-story");
    assert.match(story, /The Chowder Stop/);

    const market = await renderPage(worker, "/sunday-market");
    assert.match(market, /12th Street/);

    const contact = await renderPage(worker, "/contact");
    assert.match(contact, /name="details"/);

    // Every public page shares the same header, with links to each page.
    for (const html of [home, mealPrep, catering, privateChef, story, market, contact]) {
      for (const href of ["/private-chef", "/catering", "/meal-prep", "/sunday-market", "/our-story", "/contact"]) {
        assert.match(html, new RegExp(`class="dp-nav[^"]*"[\\s\\S]*href="${href}"`), `missing ${href} in header`);
      }
    }
  } finally {
    await worker.dispose();
  }
});

test("old Squarespace addresses forward to the new pages", async () => {
  const worker = await startBuiltWorker();
  try {
    for (const [from, to] of [["/privatechef", "/private-chef"], ["/new-page", "/private-chef"], ["/new-page-1", "/catering"], ["/new-page-2", "/contact"]]) {
      const response = await worker.fetch(from, { redirect: "manual" });
      assert.ok([301, 307, 308].includes(response.status), `${from} returned ${response.status}`);
      assert.match(response.headers.get("location") ?? "", new RegExp(`${to}$`));
    }
  } finally {
    await worker.dispose();
  }
});

test("sign-in pages render and work without JavaScript", async () => {
  const worker = await startBuiltWorker();
  try {
    const signin = await renderPage(worker, "/signin?return_to=%2Fchef");
    assert.match(signin, /<form(?=[^>]*method="post")(?=[^>]*action="\/api\/auth\/request")[^>]*>/);
    assert.match(signin, /name="returnTo" value="\/chef"/);
    assert.match(signin, /Driftline team/);
    assert.doesNotMatch(signin, /chatgpt/i);

    // An off-site return path is dropped before it reaches the form.
    const evil = await renderPage(worker, "/signin?return_to=%2F%2Fevil.com");
    assert.match(evil, /name="returnTo" value="\/"/);

    // Opening an emailed link must not sign anyone in by itself (mail scanners open links).
    const token = "A".repeat(43);
    const verify = await renderPage(worker, `/auth/verify?token=${token}`);
    assert.match(verify, /<form(?=[^>]*method="post")(?=[^>]*action="\/api\/auth\/verify")[^>]*>/);
    assert.match(verify, new RegExp(`name="token" value="${token}"`));
    const broken = await renderPage(worker, "/auth/verify?token=not-a-token");
    assert.match(broken, /isn(&#x27;|')t valid/);
    assert.doesNotMatch(broken, /name="token"/);

    // Another website can't complete a sign-in or request links on a visitor's behalf.
    for (const path of ["/api/auth/verify", "/api/auth/request"]) {
      const cross = await worker.fetch(path, {
        method: "POST",
        redirect: "manual",
        headers: { "content-type": "application/x-www-form-urlencoded", origin: "https://evil.example", "sec-fetch-site": "cross-site" },
        body: new URLSearchParams({ token, email: "a@example.com" }),
      });
      await cross.arrayBuffer();
      assert.ok([303, 403].includes(cross.status), `${path} cross-site returned ${cross.status}`);
      assert.doesNotMatch(cross.headers.get("set-cookie") ?? "", /dl_session=[A-Za-z0-9_-]/);
      if (cross.status === 303) assert.doesNotMatch(cross.headers.get("location") ?? "", /sent=1/);
    }

    const out = await worker.fetch("/signout?return_to=https%3A%2F%2Fevil.com", { redirect: "manual" });
    assert.equal(out.status, 303);
    assert.equal(new URL(out.headers.get("location"), "http://localhost").pathname, "/");
    assert.match(out.headers.get("set-cookie") ?? "", /dl_session=;.*Max-Age=0/);
  } finally {
    await worker.dispose();
  }
});

test("search basics: titles, main address, sitemap, robots, not-found", async () => {
  const worker = await startBuiltWorker();
  try {
    const titles = new Set();
    for (const path of ["/", "/private-chef", "/catering", "/meal-prep", "/sunday-market", "/our-story", "/contact", "/cookbook", "/disclosures", "/faq"]) {
      const html = await renderPage(worker, path);
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
      assert.ok(title && !titles.has(title), `${path} needs its own title (got "${title}")`);
      titles.add(title);
      const canonical = `https://www.driftlineprovisions.com${path === "/" ? "/" : path}`;
      assert.match(html, new RegExp(`<link rel="canonical" href="${canonical.replace(/[/.]/g, "\\$&")}"`), `${path} canonical`);
      assert.doesNotMatch(html, /name="robots" content="noindex/, `${path} must be indexable`);
    }

    const robots = await (await worker.fetch("/robots.txt")).text();
    assert.match(robots, /Disallow: \/account/);
    assert.match(robots, /Sitemap: https:\/\/www\.driftlineprovisions\.com\/sitemap\.xml/);
    const sitemap = await (await worker.fetch("/sitemap.xml")).text();
    assert.match(sitemap, /<loc>https:\/\/www\.driftlineprovisions\.com\/private-chef<\/loc>/);
    assert.doesNotMatch(sitemap, /account|portal|signin/);

    const missing = await worker.fetch("/an-old-squarespace-page", { headers: { accept: "text/html" } });
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /drifted/);

    const start = await worker.fetch("/start", { redirect: "manual" });
    assert.ok([301, 307, 308].includes(start.status));

    const apex = await worker.fetch("http://driftlineprovisions.com/privatechef?ref=card", { redirect: "manual" });
    assert.equal(apex.status, 301);
    assert.equal(apex.headers.get("location"), "https://www.driftlineprovisions.com/privatechef?ref=card");
  } finally {
    await worker.dispose();
  }
});

test("questions page answers without JavaScript and is marked up for search", async () => {
  const worker = await startBuiltWorker();
  try {
    const html = await renderPage(worker, "/faq");
    assert.match(html, /<details>/);
    assert.match(html, /How far ahead should I book\?/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.doesNotMatch(html, /deposit of|% deposit|refund within/i, "no invented payment policy");
  } finally {
    await worker.dispose();
  }
});
