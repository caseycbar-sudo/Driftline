import assert from "node:assert/strict";
import test from "node:test";

import { startBuiltWorker } from "./worker-harness.mjs";

test("the built worker server-renders the homepage", async () => {
  const worker = await startBuiltWorker();
  try {
    const response = await worker.fetch("/", {
      headers: { accept: "text/html" },
    });

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();

    // A complete server-rendered document, not a client-side shell.
    assert.match(html, /^<!DOCTYPE html><html lang="en">/i);
    assert.match(html, /<title>Driftline At Home<\/title>/i);
    assert.match(
      html,
      /<meta(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']+["'])[^>]*>/i,
    );

    // Page content rendered on the server, so this fails on a blank or
    // error-boundary render rather than passing on an empty 200.
    assert.match(html, /A week of good meals,/);
    assert.match(html, /<section class="pricing section" id="pricing">/);
    assert.match(html, /<\/footer>/i);

    // The RSC payload is present, so hydration has something to resume from.
    assert.match(html, /__VINEXT_RSC_DONE__=true/);
  } finally {
    await worker.dispose();
  }
});
