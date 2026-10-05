import assert from "node:assert/strict";
import test from "node:test";

import { readLessonIdFromHash } from "../src/lib/lesson-route";

test("reads canonical and encoded lesson hashes", () => {
  assert.equal(readLessonIdFromHash("#w01-l01"), "w01-l01");
  assert.equal(readLessonIdFromHash("#week%201"), "week 1");
});

test("returns an empty lesson ID for empty or malformed hashes", () => {
  assert.equal(readLessonIdFromHash(""), "");
  assert.equal(readLessonIdFromHash("#"), "");
  assert.equal(readLessonIdFromHash("#%"), "");
  assert.equal(readLessonIdFromHash("#%E0%A4%A"), "");
});
