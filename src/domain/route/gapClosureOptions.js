// BOSLUGU KAPATMA PLANI — "Üç seçenek, biri hedefi düşürmek — suçlama yok."
//
// Girdi buildPlanVsActual + gapClosurePlan ciktilari ve hedef/simdiki net.
// Hesaplar:
//   add     — haftaya bir durak: bosluk `gap` haftada kapanir
//   weekend — hafta sonuna yigmak: cumartesi bir fazla durak, ayni sure
//   target  — hedefi gercege cek: kalan kazanimin gerceklesen oranda kismi
// Net sayilari yoksa (hedef ya da simdiki net bilinmiyor) null doner;
// ekran o satirlari gostermez, sayi uydurulmaz.

export const GAP_OPTION = Object.freeze({ ADD: "add", WEEKEND: "weekend", TARGET: "target" });

function roundNet(n) {
  return Math.round(n);
}

export function buildGapClosureOptions({
  gap = 0,
  plannedDue = 0,
  doneDue = 0,
  elapsedWeeks = 0,
  remainingWeeks = 0,
  weekStops = null,
  targetNet = null,
  currentNet = null,
} = {}) {
  if (!gap || gap <= 0) return null;

  const closeWeeks = remainingWeeks >= gap ? gap : null;
  const hasNets = targetNet != null && currentNet != null;

  // Tamamlanma orani: planlanan duraklarin ne kadari gerceklesti. Hedefe
  // kalan kazanim (target - current) bu oranla olceklenir.
  const completion = plannedDue > 0 ? doneDue / plannedDue : 1;
  const reducedTarget = hasNets && targetNet > currentNet
    ? roundNet(currentNet + (targetNet - currentNet) * completion)
    : null;

  return {
    gap,
    plannedDue,
    doneDue,
    elapsedWeeks,
    closeWeeks,
    weekStopsAfter: weekStops != null ? weekStops + 1 : null,
    targetNet: targetNet != null ? roundNet(targetNet) : null,
    currentNet: currentNet != null ? roundNet(currentNet) : null,
    reducedTarget,
    resultFor(option) {
      if (!hasNets) return null;
      const planned = option === GAP_OPTION.TARGET && reducedTarget != null ? reducedTarget : roundNet(targetNet);
      return { now: roundNet(currentNet), planned, delta: planned - roundNet(currentNet) };
    },
  };
}
