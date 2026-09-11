import { test } from "node:test";
import assert from "node:assert/strict";
import { subjectPaletteKey, subjectColorOf } from "../../src/themes/subjectPalette.js";

const C = { accent: "#E5343F", subjects: { matematik: "#E0A570", cografya: "#8B5CF6", turkce: "#74A9E8", ingilizce: "#7dd3fc" } };

test("sinav on eki dusuruluyor", () => {
  assert.equal(subjectPaletteKey("tyt_matematik"), "matematik");
  assert.equal(subjectPaletteKey("lgs_turkce"), "turkce");
  assert.equal(subjectPaletteKey("ydt_ingilizce"), "ingilizce");
});

test("sondaki sira numarasi dusuruluyor", () => {
  assert.equal(subjectPaletteKey("ayt_cografya2"), "cografya");
  assert.equal(subjectPaletteKey("ayt_tarih1"), "tarih");
});

test("palette olmayan ders accent'e duser, gri kalmaz", () => {
  assert.equal(subjectColorOf(C, "ayt_felsefe"), C.accent);
  assert.equal(subjectColorOf(C, null), C.accent);
});

test("eslesen ders kendi rengini alir", () => {
  assert.equal(subjectColorOf(C, "ayt_matematik"), "#E0A570");
  assert.equal(subjectColorOf(C, "ayt_cografya1"), "#8B5CF6");
});
