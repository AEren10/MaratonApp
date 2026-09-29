import test from "node:test";
import assert from "node:assert/strict";

import { weekPreviewLine } from "../../src/domain/program/weekPreview.js";

test("ders basina durak sayisi, en cok 3 ders, hafta tekrari sonda", () => {
  const s = (subjectLabel, extra = {}) => ({ subjectLabel, ...extra });
  const line = weekPreviewLine({ stops: [
    s("Türkçe"), s("Türkçe"), s("Türkçe"), s("Matematik"), s("Matematik"), s("İngilizce"), s("Kimya"),
    s("Türkçe", { reviewCycle: "weekly:2026-10-05" }),
  ] });
  assert.equal(line, "Türkçe 3 · Matematik 2 · İngilizce 1 · Hafta tekrarı");
  assert.equal(weekPreviewLine({ stops: [] }), null);
});
