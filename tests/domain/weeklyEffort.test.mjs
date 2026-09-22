import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTempo, buildWeeklyEffort, formatMinutes, groupThousands, WEEK_DAYS,
} from "../../src/domain/home/weeklyEffort.js";

// 2026-09-21 Pazartesi, 2026-09-27 Pazar.
const PZT = "2026-09-21";
const SALI = "2026-09-22";
const CMT = "2026-09-26";

test("gunler pazartesiden baslar", () => {
  assert.deepEqual(WEEK_DAYS, ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"]);
  const w = buildWeeklyEffort({ logs: [{ study_date: PZT, question_count: 40 }] });
  assert.equal(w.days[0].questions, 40, "pazartesi ilk sutun");
  assert.equal(w.days[6].questions, 0);
});

test("ayni gunun birden cok kaydi toplanir", () => {
  const w = buildWeeklyEffort({
    logs: [
      { study_date: SALI, question_count: 30, duration_minutes: 45 },
      { study_date: SALI, question_count: 20, duration_minutes: 25 },
    ],
  });
  assert.equal(w.days[1].questions, 50);
  assert.equal(w.days[1].minutes, 70);
});

test("sure var soru yoksa gun BOS sayilmaz, ayri isaretlenir", () => {
  // Canli veride kayitlarin yarisina yakini boyle. Bu gunu sifir gostermek
  // "hicbir sey yapmadin" demek olurdu.
  const w = buildWeeklyEffort({ logs: [{ study_date: CMT, duration_minutes: 120 }] });
  const ct = w.days[5];
  assert.equal(ct.questions, 0);
  assert.equal(ct.minutes, 120);
  assert.equal(ct.worked, true, "calisilmis gun");
  assert.equal(ct.minutesOnly, true, "ama soru girilmemis");
});

test("soru girilen gun minutesOnly degildir", () => {
  const w = buildWeeklyEffort({ logs: [{ study_date: PZT, question_count: 10, duration_minutes: 30 }] });
  assert.equal(w.days[0].minutesOnly, false);
  assert.equal(w.days[0].worked, true);
});

test("olcek hedefi de en yuksek gunu de icerir", () => {
  const azCalisma = buildWeeklyEffort({ logs: [{ study_date: PZT, question_count: 20 }], dailyGoal: 110 });
  assert.equal(azCalisma.maxValue, 110, "hedef cizgisi tuvalin disina dusmez");

  const cokCalisma = buildWeeklyEffort({ logs: [{ study_date: PZT, question_count: 300 }], dailyGoal: 110 });
  assert.equal(cokCalisma.maxValue, 300, "hedefi asan gun kirpilmaz");
});

test("hicbir veri yoksa ozet yazilmaz", () => {
  const w = buildWeeklyEffort({ logs: [] });
  assert.equal(w.summary, null);
  assert.equal(w.hasAny, false);
  assert.equal(w.maxValue, 1, "sifira bolme yok");
});

test("ozet hem soruyu hem sureyi yazar", () => {
  const w = buildWeeklyEffort({
    logs: [
      { study_date: PZT, question_count: 1200, duration_minutes: 400 },
      { study_date: SALI, question_count: 40, duration_minutes: 90 },
    ],
  });
  assert.equal(w.summary, "Bu hafta 1.240 soru · 8 sa 10 dk");
});

test("yalniz sure varsa ozet yalniz sureyi yazar", () => {
  const w = buildWeeklyEffort({ logs: [{ study_date: PZT, duration_minutes: 50 }] });
  assert.equal(w.summary, "Bu hafta 50 dk");
});

test("hedefi tutturulan gun sayisi", () => {
  const w = buildWeeklyEffort({
    logs: [
      { study_date: PZT, question_count: 110 },
      { study_date: SALI, question_count: 109 },
      { study_date: CMT, question_count: 300 },
    ],
    dailyGoal: 110,
  });
  assert.equal(w.goalMetDays, 2, "tam hedef sayilir, bir eksigi sayilmaz");
});

test("hedef yoksa tutturma sayisi uretilmez", () => {
  const w = buildWeeklyEffort({ logs: [{ study_date: PZT, question_count: 110 }] });
  assert.equal(w.goalMetDays, 0);
});

test("Redux ve sunucu alan adlarinin ikisi de okunur", () => {
  const redux = buildWeeklyEffort({ logs: [{ study_date: PZT, questionCount: 25, duration: 40 }] });
  assert.equal(redux.days[0].questions, 25);
  assert.equal(redux.days[0].minutes, 40);
});

test("bozuk tarih ve negatif sayi cokmez", () => {
  const w = buildWeeklyEffort({
    logs: [
      { study_date: "bozuk", question_count: 50 },
      { study_date: null, question_count: 50 },
      { study_date: PZT, question_count: -10, duration_minutes: -5 },
    ],
  });
  assert.equal(w.totalQuestions, 0);
  assert.equal(w.totalMinutes, 0);
});

test("bicimleyiciler", () => {
  assert.equal(groupThousands(1240), "1.240");
  assert.equal(groupThousands(999), "999");
  assert.equal(groupThousands(1000000), "1.000.000");
  assert.equal(formatMinutes(45), "45 dk");
  assert.equal(formatMinutes(60), "1 sa");
  assert.equal(formatMinutes(490), "8 sa 10 dk");
});

test("tempo: gecen haftaya gore onde", () => {
  const t = buildTempo(1200, 1000);
  assert.equal(t.direction, "up");
  assert.equal(t.percent, 20);
  assert.equal(t.label, "geçen haftadan %20 önde");
});

test("tempo: geride kalan hafta kirmizi degil, sadece yazi", () => {
  const t = buildTempo(800, 1000);
  assert.equal(t.direction, "down");
  assert.equal(t.label, "geçen haftadan %20 geride");
});

test("tempo: esigin altindaki fark tempo sayilmaz", () => {
  assert.equal(buildTempo(1030, 1000).direction, "flat");
  assert.equal(buildTempo(970, 1000).label, "geçen haftayla aynı tempo");
});

test("tempo: karsilastirilacak hafta yoksa cumle kurulmaz", () => {
  assert.equal(buildTempo(500, 0), null);
  assert.equal(buildTempo(500, null), null);
  assert.equal(buildTempo(500, undefined), null);
});

test("ozet cumlesine tempo eklenir", () => {
  const w = buildWeeklyEffort({
    logs: [{ study_date: PZT, question_count: 120, duration_minutes: 90 }],
    previousQuestions: 100,
  });
  assert.equal(w.summary, "Bu hafta 120 soru · 1 sa 30 dk · geçen haftadan %20 önde");
  assert.equal(w.tempo.direction, "up");
});

test("hic calisilmamis haftada tempo yazilmaz", () => {
  const w = buildWeeklyEffort({ logs: [], previousQuestions: 400 });
  assert.equal(w.summary, null);
  assert.equal(w.tempo, null);
});

test("gecen hafta verisi yoksa cumle eskisi gibi kalir", () => {
  const w = buildWeeklyEffort({
    logs: [{ study_date: SALI, question_count: 60, duration_minutes: 45 }],
  });
  assert.equal(w.summary, "Bu hafta 60 soru · 45 dk");
  assert.equal(w.tempo, null);
});
