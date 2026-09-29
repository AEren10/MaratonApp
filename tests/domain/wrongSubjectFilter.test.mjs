import test from "node:test";
import assert from "node:assert/strict";
import { wrongMatchesSubject } from "../../src/domain/wrongNotebook/subjectFilter.js";

test("trial group key matches its curriculum subjects", () => {
  assert.equal(wrongMatchesSubject({ subject: "cografya" }, "tyt_sosyal"), true);
  assert.equal(wrongMatchesSubject({ subject: "turkce" }, "tyt_sosyal"), false);
  assert.equal(wrongMatchesSubject({ subject: "ayt_matematik" }, "tyt_matematik"), true);
  assert.equal(wrongMatchesSubject({ subject: "turkce" }, undefined), true);
});
