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

// Gunun duraklari bitti ama soru hedefi dolmadiysa 'Gunu kapattin' yalan olur:
// cubuk soruyu hedefe gore sayar, rota gunu ise daha az soru tasiyabilir.
export function dayDoneCta({ remainingToGoal = 0 } = {}) {
  const left = Math.max(0, Number(remainingToGoal) || 0);
  if (left > 0) return { title: "Rotayı bitirdin", subtitle: `Hedefe ${left} soru · bir durak ekle` };
  return { title: "Günü kapattın", subtitle: "Bir durak daha ekle" };
}
