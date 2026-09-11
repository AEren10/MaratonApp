import { test } from "node:test";
import assert from "node:assert/strict";
import {
  daysUntil, summarizeExamDateChange, examDateCaption,
} from "../../src/domain/exam/examDateChange.js";

const NOW = new Date("2026-06-23T15:00:00");

test("gun sayisi saat farkindan etkilenmiyor", () => {
  // Ayni gun, farkli saatler -> 0 gun.
  assert.equal(daysUntil("2026-06-23T01:00:00", NOW), 0);
  assert.equal(daysUntil("2026-06-23T23:00:00", NOW), 0);
  assert.equal(daysUntil("2026-06-24T01:00:00", NOW), 1);
});

test("gecmis tarih negatif degil sifir", () => {
  assert.equal(daysUntil("2026-06-01T10:00:00", NOW), 0);
});

test("tarih yoksa null", () => {
  assert.equal(daysUntil(null, NOW), null);
  assert.equal(daysUntil("hicbir sey", NOW), null);
  assert.equal(summarizeExamDateChange(null, 40, NOW), null);
});

test("haftalik yuk kalan is / kalan hafta", () => {
  // 70 gun = 10 hafta, 40 durak -> 4 durak/hafta
  const r = summarizeExamDateChange("2026-09-01T10:00:00", 40, NOW);
  assert.equal(r.weeks, 10);
  assert.equal(r.perWeek, 4);
});

test("hafta kalmadiysa yuk null, sonsuz degil", () => {
  const r = summarizeExamDateChange("2026-06-26T10:00:00", 40, NOW);
  assert.equal(r.weeks, 0);
  assert.equal(r.perWeek, null);
});

test("kalan is yoksa yuk null, sifir degil", () => {
  const r = summarizeExamDateChange("2026-09-01T10:00:00", 0, NOW);
  assert.equal(r.perWeek, null);
});

test("alt metin gun adini buyuk harfle veriyor", () => {
  assert.equal(examDateCaption("2026-06-28T10:00:00", NOW), "Pazar · sınava 5 gün");
  assert.equal(examDateCaption("2026-06-23T10:00:00", NOW), "Salı · sınav bugün");
});
