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
