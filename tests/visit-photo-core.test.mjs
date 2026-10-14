import assert from "node:assert/strict";
import test from "node:test";

import { NO_PHOTOS_NOTE, visitNoteWith, visitPhotoProblem } from "../app/visit-photo-core.ts";

test("a normal visit needs dish photos and one kitchen photo", () => {
  assert.equal(visitPhotoProblem(false, 3, 1), "");
  assert.equal(visitPhotoProblem(false, 8, 1), "");
  assert.notEqual(visitPhotoProblem(false, 0, 1), "");
  assert.notEqual(visitPhotoProblem(false, 9, 1), "");
  assert.notEqual(visitPhotoProblem(false, 2, 0), "");
  assert.notEqual(visitPhotoProblem(false, 2, 2), "");
});

test("when the customer asked for no photos, none are needed", () => {
  assert.equal(visitPhotoProblem(true, 0, 0), "");
});

test("the note records that no photos were taken, so the owner can see it", () => {
  assert.equal(visitNoteWith("  Rice is in the fridge.  ", false), "Rice is in the fridge.");
  assert.equal(visitNoteWith("", true), NO_PHOTOS_NOTE);
  assert.equal(visitNoteWith("Rice is in the fridge.", true), `${NO_PHOTOS_NOTE} Rice is in the fridge.`);
  assert.ok(!/[–—]/.test(NO_PHOTOS_NOTE));
});
