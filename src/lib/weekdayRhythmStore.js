import { useSyncExternalStore } from "react";

// Ogrencinin gun ritmi (domain/program/weekdayRhythm) -- tek kopya.
// Gun dagitimi bu degere bagli: ana sayfa, gunun plani, Program > Hafta ve
// Ay ayni ritmi okumazsa ayni durak farkli gunde gorunur. useStudyRoute
// kayitlardan hesaplayip yazar; ekranlar useWeekdayRhythm ile okur.
let rhythm = null;
let key = "";
const listeners = new Set();

export function setWeekdayRhythm(next) {
  const nextKey = Array.isArray(next) ? next.join(",") : "";
  if (nextKey === key) return;
  key = nextKey;
  rhythm = Array.isArray(next) ? next : null;
  listeners.forEach((l) => l());
}

export function useWeekdayRhythm() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => rhythm,
    () => null,
  );
}
