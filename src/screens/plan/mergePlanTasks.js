// Plan detayi gorev listesi + "bitti" durumu.
//
// Bir gorev su uc kaynaktan BIRI bitmis diyorsa bitmistir: bu ekranda az once
// isaretlendi (prev/history), cihazdaki tik kaydi (isPlanDone) ya da rota
// duragi bugun tamamlandi (t.done, generateDailyPlan'dan). Eskiden tik kaydi
// varsa rota bilgisi HIC okunmuyordu (?? zinciri): ana sayfa ve Program 8/8
// derken "Programin tamami" 1/8 gosteriyordu (1 Ekim).
export function mergePlanTasks(initialTasks, prev, history, isPlanDone) {
  const doneById = {};
  prev.forEach((t) => { if (t.done) doneById[t.id] = true; });
  history.forEach((_t, id) => { doneById[id] = true; });

  return initialTasks.map((t) => {
    const isDoneNow = Boolean(doneById[t.id] || (isPlanDone && isPlanDone(t.id)) || t.done);
    if (isDoneNow) history.set(t.id, { ...t, done: true });
    return { ...t, done: isDoneNow };
  });
}
