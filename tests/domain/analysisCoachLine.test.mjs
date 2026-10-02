import test from "node:test";
import assert from "node:assert/strict";
import { analysisCoachLine } from "../../src/domain/analysis/coachLine.js";

const L = { tyt_matematik: "Matematik", tyt_turkce: "Türkçe" };
const t = (date, mat, tr, extra = {}) => ({ date, trialType: "TYT", subjects: { tyt_matematik: { net: mat }, tyt_turkce: { net: tr } }, ...extra });

test("clear drop gives one sentence and one action", () => {
  const r = analysisCoachLine([t("2026-09-20", 20, 30), t("2026-09-27", 21, 31), t("2026-10-01", 16, 31)], (k) => L[k]);
  assert.equal(r.tone, "down");
  assert.match(r.text, /^Matematik son 3 denemede 4,5 net geriledi\. Bugüne 20 dakika Matematik ekle\.$/);
  assert.deepEqual(r.action, { subject: "matematik", minutes: 20, label: "Bugüne 20 dk Matematik ekle" });
});

test("rise is reported without an invented action", () => {
  const r = analysisCoachLine([t("2026-09-27", 20, 28), t("2026-10-01", 20, 31)], (k) => L[k]);
  assert.equal(r.tone, "up");
  assert.equal(r.action, null);
  assert.match(r.text, /^Türkçe son denemede 3 net arttı/);
});

test("no line with fewer than two same-type trials or small changes", () => {
  assert.equal(analysisCoachLine([t("2026-10-01", 20, 30)]), null);
  assert.equal(analysisCoachLine([t("2026-09-27", 20, 30), t("2026-10-01", 19, 31)]), null);
  assert.equal(analysisCoachLine([t("2026-09-27", 30, 30, { trialType: "AYT" }), t("2026-10-01", 20, 30)]), null);
});

test("grouped sections (Fen) never invent which subject to study", () => {
  const f = (date, fen) => ({ date, trialType: "TYT", subjects: { tyt_fen: { net: fen } } });
  const r = analysisCoachLine([f("2026-09-27", 12), f("2026-10-01", 8)], () => "Fen Bilimleri");
  assert.equal(r.action, null);
  assert.match(r.text, /ders ayrıntısında/);
});
