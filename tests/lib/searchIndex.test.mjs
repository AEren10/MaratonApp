import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalize, searchTopics, searchWrongQuestions, reviewDueLabel, suggestedQuery,
} from "../../src/lib/searchIndex.js";

const SUBJECTS = [
  { key: "ayt_matematik", label: "Matematik", topics: ["Permütasyon - Kombinasyon", "Olasılık", "Hiperbolik Fonksiyon"] },
  { key: "tyt_turkce", label: "Türkçe", topics: ["Paragraf (Yapı)"] },
];

test("Turkce buyuk/kucuk harf ayrimi eslesmeyi bozmuyor", () => {
  assert.equal(normalize("İNTEGRAL"), normalize("integral"));
  assert.equal(normalize("Işık"), normalize("isik"));
});

test("bastan eslesme sonda gecenden once gelir", () => {
  const r = searchTopics(SUBJECTS, "per");
  assert.equal(r[0].topic, "Permütasyon - Kombinasyon");
  assert.equal(r[1].topic, "Hiperbolik Fonksiyon");
});

test("bos sorgu sonuc dondurmez", () => {
  assert.deepEqual(searchTopics(SUBJECTS, "   "), []);
  assert.deepEqual(searchWrongQuestions([{ topic: "x" }], ""), []);
});

test("yanlis defterinde not metni de araniyor", () => {
  const rows = [
    { id: 1, topic: "Olasılık", note: "permütasyonda tekrarlı diziliş" },
    { id: 2, topic: "Limit", note: "belirsizlik" },
  ];
  const r = searchWrongQuestions(rows, "permüt");
  assert.equal(r.length, 1);
  assert.equal(r[0].id, 1);
});

test("tekrar etiketi gune gore", () => {
  const now = new Date("2026-03-10T09:00:00");
  assert.equal(reviewDueLabel("2026-03-10T20:00:00", now).text, "tekrar bugün");
  assert.equal(reviewDueLabel("2026-03-13T08:00:00", now).text, "3 gün sonra");
  assert.equal(reviewDueLabel("2026-03-08T08:00:00", now).text, "gecikti");
});

test("tarih yoksa etiket uydurulmaz", () => {
  assert.equal(reviewDueLabel(null), null);
  assert.equal(reviewDueLabel("hicbir sey"), null);
});

test("tek kelimelik sorguya oneri verilmez", () => {
  assert.equal(suggestedQuery("integral"), null);
  assert.equal(suggestedQuery("integral hesabı"), "İntegral");
});
