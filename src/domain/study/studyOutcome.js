// CALISMA OZETI: "NE YAPTIK" CUMLESI (saf).
//
// Aktivasyon ani rota hazir ekrani degil, ilk calismanin bitip rotanin
// gercekten ilerledigini gormek. Ozet ekraninin en ustunde, arka planda ne
// degistigini TEK cumleyle soyler. Yalniz gercekte olan soylenir: durak
// kapanmadiysa "bitti" denmez.

/**
 * @param outcome { routeCompleted, partial: { solved, planned } | null } (studyPlanCompletion)
 * @param week    rotanin bu haftasi ({ stops: [{ stopId, lifecycleStatus }] }) ya da null
 * @param stopId  bu calismanin rota duragi (varsa)
 */
export function studyOutcomeLine({ outcome = null, week = null, stopId = null, subjectLabel = "" } = {}) {
  if (outcome?.partial) {
    const { solved = 0, planned = 0 } = outcome.partial;
    return {
      title: "Durak açık kaldı",
      body: `Planlanan ${planned} sorunun ${solved} tanesini çözdün. Kalanı rotanda duruyor; tamamlayınca durak kapanır.`,
    };
  }
  if (outcome?.routeCompleted) {
    const stops = Array.isArray(week?.stops) ? week.stops : [];
    const done = stops.filter((s) => s.lifecycleStatus === "completed" || (stopId && s.stopId === stopId)).length;
    const total = stops.length;
    return {
      title: "Rotan bir durak ilerledi",
      body: total > 0
        ? `Bu hafta ${Math.min(done, total)}/${total} durak bitti. Sıradaki durak aşağıda hazır.`
        : "Bu durak rotanda kapandı. Sıradaki durak aşağıda hazır.",
    };
  }
  return {
    title: "Kaydın işlendi",
    body: subjectLabel
      ? `${subjectLabel} ilerlemene eklendi; rotan bu hafta ona göre dağıtılır.`
      : "Çalışman ilerlemene eklendi; rotan bu hafta ona göre dağıtılır.",
  };
}
