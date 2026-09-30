import { useSyncExternalStore } from "react";
import { registerSessionReset } from "./session/sessionReset.js";

// Ana sayfanin ust isiginin RENGI gunun durumunu tasir (ScreenDepth):
//  "up"   -- bugunun hedefi tuttu (hafif yesil)
//  "warn" -- sinava 30 gunden az (hafif sicak)
//  null   -- notr
// Ana sayfa yazar, derinlik katmani okur. Isik ayni isik; yalniz tonu degisir,
// ekrana yeni bir oge eklenmez.
let tone = null;
const listeners = new Set();
registerSessionReset(() => setDepthTone(null));

export function setDepthTone(next) {
  const value = next || null;
  if (value === tone) return;
  tone = value;
  listeners.forEach((l) => l());
}

export function useDepthTone() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => tone,
    () => null,
  );
}

/** Saf: gunun durumundan ton. Hedef tutmak sinav yakinligindan once gelir. */
export function depthToneFor({ solvedToday = 0, dailyGoal = 0, daysUntilExam = null } = {}) {
  if (dailyGoal > 0 && solvedToday >= dailyGoal) return "up";
  if (Number.isFinite(daysUntilExam) && daysUntilExam >= 0 && daysUntilExam <= 30) return "warn";
  return null;
}
