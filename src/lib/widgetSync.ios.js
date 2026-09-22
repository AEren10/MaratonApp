import WeekWidget from "../widgets/WeekWidget";

// WIDGET'A VERI YAZMA — tek gecis noktasi (iOS).
//
// Widget ayri bir calisma zamaninda: uygulamanin state'ini goremez, veri
// cekemez. Gorecegi her sey buradan `updateSnapshot` ile yazilir.
//
// NEDEN .ios.js
// Widget dosyasi STATIK import edilmeli: derleyici `'widget'` direktifli
// fonksiyonu modul grafiginde gorup ayri pakete cikariyor, kosullu bir
// require'a guvenmek istemiyoruz. Ama ayni dosya Android'de
// `@expo/ui/swift-ui` yuklemeye calisirdi. Metro'nun platform uzantisi
// ikisini birden cozuyor: iOS bu dosyayi alir, Android yanindaki
// widgetSync.js'i (bos gecis) alir.

// Widget'ta yalniz gun etiketi ve soru sayisi var: dakika, minutesOnly ve
// diger alanlar gonderilmiyor. Props her yazmada bir daha seri hale
// getiriliyor; gereksiz alan tasimanin bedeli var, faydasi yok.
function toDays(week) {
  return (week?.days || []).map((day) => ({
    label: day.label,
    questions: Number(day.questions) || 0,
  }));
}

/**
 * Haftalik widget'i gunceller. Gurultulu cagrilabilir — degisiklik yoksa
 * hicbir sey yazilmaz, cunku her yazma widget'i yeniden cizdiriyor.
 */
let lastSnapshot = null;

export function syncWeekWidget({ week, solved = 0 } = {}) {
  if (!week) return false;

  const snapshot = {
    days: toDays(week),
    goal: Number(week.goal) || 0,
    solved: Number(solved) || 0,
  };

  const key = JSON.stringify(snapshot);
  if (key === lastSnapshot) return false;
  lastSnapshot = key;

  try {
    WeekWidget.updateSnapshot(snapshot);
    return true;
  } catch {
    // Widget yazmasi basarisiz olursa uygulama etkilenmemeli: widget bir
    // suslemedir, veri kaybi degil.
    lastSnapshot = null;
    return false;
  }
}
