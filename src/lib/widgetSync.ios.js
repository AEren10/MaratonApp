import WeekWidget from "../widgets/WeekWidget";
import TodayWidget from "../widgets/TodayWidget";
import ReviewWidget from "../widgets/ReviewWidget";
import RouteWidget from "../widgets/RouteWidget";
import StreakWidget from "../widgets/StreakWidget";

// WIDGET'LARA VERI YAZMA — tek gecis noktasi (iOS).
//
// Widget'lar ayri bir calisma zamaninda: uygulamanin state'ini goremez,
// veri cekemez, hook kullanamaz. Gorecekleri her sey buradan
// `updateSnapshot` ile yazilir.
//
// NEDEN .ios.js
// Widget dosyalari STATIK import edilmeli: derleyici `'widget'` direktifli
// fonksiyonu modul grafiginde gorup ayri pakete cikariyor. Ama ayni dosya
// Android'de `@expo/ui/swift-ui` yuklemeye calisirdi. Metro'nun platform
// uzantisi ikisini birden cozuyor: iOS burayi, digerleri yanindaki
// widgetSync.js'i (bos gecis) alir.

// Her yazma widget'i yeniden cizdiriyor; degismeyen veri icin yazmiyoruz.
const last = {};

function push(key, widget, snapshot) {
  const serialized = JSON.stringify(snapshot);
  if (serialized === last[key]) return false;
  last[key] = serialized;
  try {
    widget.updateSnapshot(snapshot);
    return true;
  } catch {
    // Widget bir suslemedir: yazmasi basarisiz olursa uygulama etkilenmez.
    last[key] = null;
    return false;
  }
}

// Widget'ta yalniz gun etiketi ve soru sayisi var; dakika ve diger alanlar
// gonderilmiyor. Props her yazmada seri hale getiriliyor, gereksiz alan
// tasimanin bedeli var faydasi yok.
function toDays(week) {
  return (week?.days || []).map((day) => ({
    label: day.label,
    questions: Number(day.questions) || 0,
  }));
}

/** Haftanin emegi (cubuklar). */
export function syncWeekWidget({ week, solved = 0 } = {}) {
  if (!week) return false;
  return push("week", WeekWidget, {
    days: toDays(week),
    goal: Number(week.goal) || 0,
    solved: Number(solved) || 0,
  });
}

/** Bugunun sayisi, seri ve siradaki durak. */
export function syncTodayWidget({
  solved = 0, goal = 0, streak = 0, nextStop = null, week = null,
  stops = [], weeklyMinutesGoal = 0,
} = {}) {
  // Widget'a en fazla dort is gidiyor: daha fazlasi orta boy widget'ta
  // okunmuyor, listeyi kaydiramiyorsun. Bitmemisler once, bitenler sonra --
  // widget'in isi "simdi ne yapayim", gecmisi anlatmak degil.
  const tasks = (stops || [])
    .map((stop) => ({
      label: [stop?.subject && stop?.topic ? stop.topic : stop?.label].filter(Boolean).join(""),
      minutes: Number(stop?.minutes) || 0,
      done: Boolean(stop?.completed),
    }))
    .filter((t) => t.label)
    .sort((a, b) => Number(a.done) - Number(b.done))
    .slice(0, 4);

  const weekMinutes = (week?.days || []).reduce((sum, d) => sum + (Number(d.minutes) || 0), 0);

  return push("today", TodayWidget, {
    solved: Number(solved) || 0,
    goal: Number(goal) || 0,
    tasks,
    weekMinutes,
    weeklyMinutesGoal: Number(weeklyMinutesGoal) || 0,
    // Serit icin gun basina dakika: cubuk degil, haftanin yedi parcasi.
    dayMinutes: (week?.days || []).map((d) => Number(d.minutes) || 0),
    streak: Number(streak) || 0,
    nextStop: nextStop || null,
    // Genis boy haftanin cubuklarini da tasiyor: kucuk boyla arasindaki fark
    // tek satirdan ibaret kalmasin, genislik bir ise yarasin.
    days: week ? toDays(week) : [],
  });
}

/** Sinava kalan gun, olculmus rota hatti ve son denemelerdeki artis. */
export function syncRouteWidget({ examDate = null, chart = null, target = 0 } = {}) {
  const stops = chart?.stops || [];
  const first = stops.length ? Number(stops[0].y) : null;
  const last = stops.length ? Number(stops[stops.length - 1].y) : null;
  // Gun sayisi degil TARIH gonderiliyor: widget kendi yenilenirken gunu
  // yeniden hesaplasin, uygulama acilmasa da sayac dogru kalsin.
  const examISO = examDate instanceof Date
    ? examDate.toISOString()
    : (typeof examDate === "string" ? examDate : null);
  return push("route", RouteWidget, {
    examISO,
    // Widget'ta mutlak net YOK: ana ekrani baskasi da gorur, artis gosterilir.
    delta: first != null && last != null ? last - first : null,
    trialCount: stops.length,
    target: Number(target) || 0,
    points: stops.map((s) => ({ label: s.label, net: Number(s.y) || 0 })),
  });
}

/** Tekrari gelen yanlislar. */
export function syncReviewWidget({ due = 0, subjects = 0 } = {}) {
  return push("review", ReviewWidget, {
    due: Number(due) || 0,
    subjects: Number(subjects) || 0,
  });
}

/**
 * Seri: son 28 gunun izgarasi.
 *
 * 0 = calisilmadi · 1 = calisildi · 2 = calisildi VE suren serinin icinde.
 * Seri uyeligi SONDAN geriye yuruyerek bulunur: bugun (ya da bugun bosken
 * dun) baslayip ilk bos gune kadar. Sunucudaki streak degeriyle carpismasin
 * diye uzunluk oradan aliniyor, izgara yalnizca BOYAMA icin kullaniliyor.
 */
export function syncStreakWidget({ logs = [], streak = 0, longest = 0 } = {}) {
  const DAY = 86400000;
  const key = (d) => {
    const t = new Date(d);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  };

  const worked = new Set();
  for (const log of logs || []) {
    const raw = log?.study_date || log?.studyDate;
    if (!raw) continue;
    if ((Number(log.question_count ?? log.questionCount ?? 0) || 0) > 0
      || (Number(log.duration_minutes ?? log.durationMinutes ?? 0) || 0) > 0) {
      worked.add(String(raw).slice(0, 10));
    }
  }

  const today = new Date();
  const days = [];
  for (let i = 27; i >= 0; i -= 1) {
    days.push(worked.has(key(today.getTime() - i * DAY)) ? 1 : 0);
  }

  // Suren seriyi sondan geriye boya. Bugun bos olabilir: seri henuz
  // kirilmadi, gece yarisina kadar suresi var.
  let i = days.length - 1;
  if (days[i] === 0) i -= 1;
  while (i >= 0 && days[i] === 1) { days[i] = 2; i -= 1; }

  return push("streak", StreakWidget, {
    days,
    streak: Number(streak) || 0,
    longest: Number(longest) || 0,
  });
}
