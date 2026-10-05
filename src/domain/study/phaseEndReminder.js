import { STUDY_TIMER_PHASE } from "./studyTimerModel.js";

// Ekran kapaliyken faz bitince gosterilen bildirimin metni. Uygulama arka
// planda sayaci ilerletmez (faz gecisi ekran acilinca olur), bu yuzden metin
// "gecti" demez, ne yapilacagini soyler.
export function phaseEndContent(phase) {
  if (phase === STUDY_TIMER_PHASE.FOCUS) {
    return { title: "Odak süren doldu", body: "Molaya geçmek için uygulamayı aç." };
  }
  return { title: "Mola bitti", body: "Sıradaki odak seni bekliyor." };
}

// Kurulacak bildirimin bekleme suresi (sn). 1 saniyenin altindaysa kurulmaz.
export function phaseEndDelaySec(targetSec, elapsedSec) {
  const left = Math.ceil(Number(targetSec) - Number(elapsedSec));
  return Number.isFinite(left) && left > 1 ? left : 0;
}
