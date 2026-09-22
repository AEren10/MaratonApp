import WeekWidget from "../widgets/WeekWidget";
import TodayWidget from "../widgets/TodayWidget";
import ReviewWidget from "../widgets/ReviewWidget";

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
export function syncTodayWidget({ solved = 0, goal = 0, streak = 0, nextStop = null } = {}) {
  return push("today", TodayWidget, {
    solved: Number(solved) || 0,
    goal: Number(goal) || 0,
    streak: Number(streak) || 0,
    nextStop: nextStop || null,
  });
}

/** Tekrari gelen yanlislar. */
export function syncReviewWidget({ due = 0, subjects = 0 } = {}) {
  return push("review", ReviewWidget, {
    due: Number(due) || 0,
    subjects: Number(subjects) || 0,
  });
}
