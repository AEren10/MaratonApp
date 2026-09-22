import { Platform } from "react-native";

// WIDGET'A VERI YAZMA — tek gecis noktasi.
//
// Widget ayri bir calisma zamaninda: uygulamanin state'ini goremez, veri
// cekemez. Gorecegi her sey buradan `updateSnapshot` ile yazilir.
//
// Modul YALNIZCA iOS'ta yukleniyor. expo-widgets'in Android tarafi henuz
// opt-in ve deneysel (`enableAndroid`); Android'de import etmek uygulamayi
// riske atar, bu yuzden platform disi hicbir sey calismiyor.
let widget = null;
if (Platform.OS === "ios") {
  try {
    widget = require("../widgets/WeekWidget").default;
  } catch {
    widget = null;
  }
}

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
  if (!widget || !week) return false;

  const snapshot = {
    days: toDays(week),
    goal: Number(week.goal) || 0,
    solved: Number(solved) || 0,
  };

  const key = JSON.stringify(snapshot);
  if (key === lastSnapshot) return false;
  lastSnapshot = key;

  try {
    widget.updateSnapshot(snapshot);
    return true;
  } catch {
    // Widget yazmasi basarisiz olursa uygulama etkilenmemeli: widget bir
    // suslemedir, veri kaybi degil.
    lastSnapshot = null;
    return false;
  }
}
