import { test } from "node:test";
import assert from "node:assert/strict";
import { getSubjectByKey, getSubjectLabel, getSubjectBadge } from "../../src/themes/subjects.js";

test("getSubjectByKey resolves trial keys and curriculum keys", () => {
  assert.equal(getSubjectByKey("tyt_turkce")?.label, "Türkçe");
  assert.equal(getSubjectByKey("ayt_kimya")?.label, "Kimya");
  assert.equal(getSubjectByKey("ayt_fizik")?.label, "Fizik");
  assert.equal(getSubjectByKey("lgs_matematik")?.label, "Matematik");
  assert.equal(getSubjectByKey("matematik")?.label, "Matematik");
});

test("getSubjectLabel returns clean Turkish name without prefix or snake_case", () => {
  assert.equal(getSubjectLabel("tyt_turkce"), "Türkçe");
  assert.equal(getSubjectLabel("ayt_kimya"), "Kimya");
  assert.equal(getSubjectLabel("ayt_biyoloji"), "Biyoloji");
  assert.equal(getSubjectLabel("tyt_matematik"), "Matematik");
  assert.equal(getSubjectLabel("ayt_tarih1"), "Tarih-1");
  assert.equal(getSubjectLabel("ayt_cografya2"), "Coğrafya-2");
  assert.equal(getSubjectLabel("lgs_fen"), "Fen Bilimleri");
});

test("getSubjectBadge produces concise 2-3 letter badges", () => {
  assert.equal(getSubjectBadge("tyt_turkce"), "TR");
  assert.equal(getSubjectBadge("Türkçe"), "TR");
  assert.equal(getSubjectBadge("ayt_matematik"), "MAT");
  assert.equal(getSubjectBadge("Matematik"), "MAT");
  assert.equal(getSubjectBadge("ayt_fizik"), "FİZ");
  assert.equal(getSubjectBadge("ayt_kimya"), "KİM");
  assert.equal(getSubjectBadge("ayt_biyoloji"), "BİY");
  assert.equal(getSubjectBadge("ayt_tarih1"), "TAR");
  assert.equal(getSubjectBadge("ayt_cografya1"), "COĞ");
  assert.equal(getSubjectBadge("ayt_felsefe"), "FEL");
  assert.equal(getSubjectBadge("ayt_din"), "DİN");
  assert.equal(getSubjectBadge("lgs_ingilizce"), "İNG");
});
