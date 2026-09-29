import { impactLabel } from "../plan/dailyAssignment.js";

// ANA BUTONUN ALTINDAKI TEK SATIR -- "bugun ne calisacagim"i biz seciyoruz.
// Gurultu olmasin diye tek satir, ikisinden biri:
//   - siradaki is rotadan: "Rotan bugün bunu seçti · <kisa gerekce>"
//   - gun kapandi: "Yarın · <ders> · <konu>" (ertesi gune merak)
// Kullanicinin kendi ekledigi gorevde satir yok: onu biz secmedik.

export function ctaHint({ nextTask = null, dayDone = false, tomorrowStop = null } = {}) {
  if (nextTask) {
    const key = nextTask.logicalStopKey || "";
    if (key.startsWith("habit:")) return "Günlük rutinin · her gün";
    const fromRoute = Boolean(nextTask.routeInsight || key);
    if (!fromRoute) return null;
    const label = impactLabel(nextTask.routeInsight?.reasonCode);
    return label ? `Rotan bugün bunu seçti · ${label}` : "Rotan bugün bunu seçti";
  }
  if (dayDone && tomorrowStop?.topic) {
    return ["Yarın", tomorrowStop.subjectLabel, tomorrowStop.topic].filter(Boolean).join(" · ");
  }
  return null;
}
