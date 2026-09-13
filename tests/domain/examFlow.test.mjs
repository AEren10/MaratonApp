import { test } from "node:test";
import assert from "node:assert/strict";

import {
  examEveReminderAt, normalizeExamDayPlan, planHasContent, bagItems,
  sanitizeTimeInput, isValidTime,
} from "../../src/domain/exam/examDayPlan.js";
import { examResultFields, parseNetInput, validateExamResult } from "../../src/domain/exam/examResult.js";
import { buildForecastAccuracyView } from "../../src/domain/exam/forecastAccuracyView.js";
import { buildExamRecap, recapHasContent } from "../../src/domain/exam/examRecap.js";
import { integerPastCopula } from "../../src/lib/trNumberSuffix.js";

// --- Sinav gunu plani ---------------------------------------------------

test("hatirlatma sinavdan bir gun once 20:00", () => {
  const at = examEveReminderAt(new Date("2026-06-20T00:00:00"), new Date("2026-06-01T10:00:00"));
  assert.equal(at.getDate(), 19);
  assert.equal(at.getHours(), 20);
});

test("hatirlatma ani gectiyse kurulmaz", () => {
  assert.equal(examEveReminderAt(new Date("2026-06-20T00:00:00"), new Date("2026-06-19T21:00:00")), null);
  assert.equal(examEveReminderAt(null, new Date()), null);
});

test("saat girdisi maskelenir ve dogrulanir", () => {
  assert.equal(sanitizeTimeInput("0740"), "07:40");
  assert.equal(sanitizeTimeInput("7"), "7");
  assert.equal(isValidTime("07:40"), true);
  assert.equal(isValidTime("27:40"), false);
  assert.equal(isValidTime("7:4"), false);
});

test("bos plan kaydedilmez, tek alan yeter", () => {
  assert.equal(planHasContent({}), false);
  assert.equal(planHasContent({ venue: "  " }), false);
  assert.equal(planHasContent({ leaveAt: "07:40" }), true);
  assert.equal(planHasContent({ checked: { kimlik: true } }), true);
});

test("canta listesi sabit kalemler + kullanicinin ekledikleri", () => {
  const items = bagItems({ extras: [{ key: "x1", label: "Maske" }], checked: { kimlik: true } });
  assert.equal(items.length, 5);
  assert.equal(items[0].done, true);
  assert.equal(items[4].label, "Maske");
  // Gecersiz kayitlar temizleniyor.
  assert.deepEqual(normalizeExamDayPlan({ extras: [{ key: "a", label: "  " }] }).extras, []);
  assert.deepEqual(normalizeExamDayPlan({ checked: { a: false } }).checked, {});
});

// --- Sinav sonucu ------------------------------------------------------

test("alan listesi sinav turune gore", () => {
  assert.deepEqual(examResultFields("tyt_ayt", "sayisal").map((f) => f.label),
    ["TYT", "AYT Sayısal", "Yerleştirme puanı"]);
  assert.deepEqual(examResultFields("tyt").map((f) => f.key), ["primaryNet", "placementScore"]);
  assert.equal(examResultFields("lgs")[0].max, 90);
});

test("virgullu net okunur", () => {
  assert.equal(parseNetInput("69,25"), 69.25);
  assert.equal(parseNetInput(""), null);
  assert.equal(parseNetInput("abc"), null);
});

test("sinir asan deger hata, bos alan hata degil", () => {
  const fields = examResultFields("tyt_ayt", "sayisal");
  const over = validateExamResult(fields, { primaryNet: "130" });
  assert.equal(over.savable, false);
  assert.equal(over.errors.primaryNet, "0 – 120 arası");

  const partial = validateExamResult(fields, { primaryNet: "69,25" });
  assert.equal(partial.savable, true);
  assert.deepEqual(partial.record, { primaryNet: 69.25 });

  // Ana net olmadan kaydedilemez.
  assert.equal(validateExamResult(fields, { placementScore: "418,7" }).savable, false);
});

// --- Tahmin dogrulugu --------------------------------------------------

const FORECAST = { projected: 71.2, first: 51, range: { low: 69, high: 73 } };

test("sonuc yoksa ekran bos, tahmin yoksa yalniz sonuc", () => {
  assert.equal(buildForecastAccuracyView({ forecast: FORECAST, actualNet: null }), null);
  const v = buildForecastAccuracyView({ forecast: null, actualNet: 69.25, baselineNet: 51 });
  assert.equal(v.hasForecast, false);
  assert.equal(v.title, "69,25 yaptın.");
  assert.equal(v.body, null);
  assert.equal(v.deltaText, "+18,25");
});

test("bant icinde kalan sonuc", () => {
  const v = buildForecastAccuracyView({ forecast: FORECAST, actualNet: 69.25, baselineNet: 51 });
  assert.equal(v.title, "Tahminim 71'di. 69,25 yaptın.");
  assert.equal(v.body, "1,75 net şaşırdım. Aralık 69–73'tü, sonuç aralığın içinde kaldı.");
  assert.equal(v.inRange, true);
  assert.equal(v.emphasized, true);
  assert.equal(v.deltaText, "+18,25");
  assert.equal(v.improved, true);
});

test("bant disinda kalan sonuc kirmiziya kacmaz, dili degisir", () => {
  const v = buildForecastAccuracyView({ forecast: FORECAST, actualNet: 58.25, baselineNet: 51 });
  assert.equal(v.inRange, false);
  assert.equal(v.emphasized, false);
  assert.match(v.body, /şaştım\./);
  assert.match(v.body, /dışında kaldı\.$/);
});

test("baslangic yalniz seviye testinden; yoksa fark gizlenir", () => {
  const v = buildForecastAccuracyView({ forecast: FORECAST, actualNet: 60 });
  assert.equal(v.start, null);
  assert.equal(v.deltaText, null);
  assert.equal(buildForecastAccuracyView({ forecast: FORECAST, actualNet: 50, baselineNet: 51 }).deltaText, "−1");
});

test("bant disi + son uc deneme yukseliyorsa sebep karti acilir", () => {
  const rising = { ...FORECAST, risingLastThree: true };
  assert.equal(buildForecastAccuracyView({ forecast: rising, actualNet: 58.25 }).showMissReason, true);
  assert.equal(buildForecastAccuracyView({ forecast: rising, actualNet: 70 }).showMissReason, false);
  assert.equal(buildForecastAccuracyView({ forecast: FORECAST, actualNet: 58.25 }).showMissReason, false);
});

test("sayi kosaci tablosu", () => {
  assert.equal(integerPastCopula(71), "di");
  assert.equal(integerPastCopula(73), "tü");
  assert.equal(integerPastCopula(60), "tı");
  assert.equal(integerPastCopula(0), "dı");
});

// --- Yilin kaydi -------------------------------------------------------

test("kayit ozeti sunucu toplamlarindan", () => {
  const recap = buildExamRecap({
    stats: { totalQuestions: 14280, totalMinutes: 51720, totalTrials: 24 },
    completedStops: 11,
    startedAt: "2025-06-24T09:00:00",
    examDate: new Date("2026-06-20T00:00:00"),
  });
  assert.deepEqual(recap, { days: 362, questions: 14280, hours: 862, stops: 11, trials: 24 });
  assert.equal(recapHasContent(recap), true);
});

test("veri yoksa sayi uydurulmaz", () => {
  const recap = buildExamRecap({ examDate: "2026-06-20" });
  assert.deepEqual(recap, { days: null, questions: null, hours: null, stops: null, trials: null });
  assert.equal(recapHasContent(recap), false);
  assert.equal(buildExamRecap({ stats: { totalMinutes: 45 } }).hours, null);
});

// --- Eklenenler ---------------------------------------------------------

import { reminderCaption, venueLine } from "../../src/domain/exam/examDayPlan.js";
import { forecastAccuracyChart } from "../../src/domain/exam/forecastAccuracyChart.js";

test("hatirlatma satiri tasarim bicimiyle", () => {
  assert.equal(
    reminderCaption(new Date("2026-06-20T00:00:00"), new Date("2026-06-01T10:00:00")),
    "19 Haziran 20:00 · çanta ve saat",
  );
  assert.equal(venueLine({ venue: "Kadıköy And. Lisesi", hall: "B Blok · 12" }), "Kadıköy And. Lisesi · B Blok · 12");
  assert.equal(venueLine({}), null);
});

test("dil rotasi TYT + YDT alanlari", () => {
  assert.deepEqual(examResultFields("dil").map((f) => f.key), ["primaryNet", "secondaryNet", "placementScore"]);
});

test("grafik bant icinde ara dugumleri, disinda tahmin hattini cizer", () => {
  const base = { start: 51, predicted: 71, actual: 69.25, range: { low: 69, high: 73 }, waypoints: [58, 64] };
  const inside = forecastAccuracyChart({ ...base, inRange: true });
  assert.equal(inside.waypoints.length, 2);
  assert.equal(inside.forecastPath, null);
  assert.equal(inside.start.y, 138);
  const outside = forecastAccuracyChart({ ...base, actual: 58.25, inRange: false });
  assert.equal(outside.waypoints.length, 0);
  assert.ok(outside.forecastPath.startsWith("M 8 138"));
  assert.equal(forecastAccuracyChart({ ...base, start: null }), null);
});
