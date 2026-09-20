// Kullanicinin KENDI soyledigi yol — SAF.
//
// Kurulumda dort sey soruluyor: sinav tarihi, baslangic neti, hedef net,
// gunluk hedef. Sonra ekran uc deneme girilene kadar "HENUZ TAHMIN YOK"
// yaziyordu: uygulama nerede oldugunu da nereye gitmek istedigini de
// biliyor ama kullaniciya hicbirini geri soylemiyordu.
//
// Burada uretilen hicbir sey TAHMIN DEGIL. Tahmin olculur, bu beyandir:
// iki ucu da kullanici kendi girdi, aradaki sureyi takvim, durak sayisini
// rota veriyor. O yuzden dilde de "tahmin" gecmez.
const round = (v) => (Number.isFinite(v) ? Math.round(v) : null);

export function routeDeclaredPath({ baselineNet, targetNet, daysLeft, stopCount } = {}) {
  const start = round(baselineNet);
  const goal = round(targetNet);
  if (start == null && goal == null) return null;

  const days = Number.isFinite(daysLeft) && daysLeft > 0 ? Math.round(daysLeft) : null;
  const stops = Number.isFinite(stopCount) && stopCount > 0 ? Math.round(stopCount) : null;
  const weeks = days != null ? Math.max(1, Math.round(days / 7)) : null;

  // Tempo satiri: haftada birden az durak dusuyorsa "haftada ~0 durak"
  // demek yanlis olur, yonu ters cevirip soyluyoruz.
  let tempo = null;
  if (stops != null && weeks != null) {
    const perWeek = stops / weeks;
    tempo = perWeek >= 1
      ? `haftada ~${Math.round(perWeek)} durak`
      : `~${Math.max(2, Math.round(1 / perWeek))} haftada 1 durak`;
  }

  const summary = [
    days != null ? `${days} gün` : null,
    stops != null ? `${stops} durak` : null,
    tempo,
  ].filter(Boolean).join(" · ");

  return {
    startLabel: start != null ? `${start} net` : null,
    goalLabel: goal != null ? `${goal} net` : null,
    // Mesafe yalniz iki uc da biliniyorsa anlamli.
    gapLabel: start != null && goal != null && goal !== start
      ? `${Math.abs(goal - start)} net ${goal > start ? "yukarı" : "aşağı"}`
      : null,
    summary: summary || null,
    // Tempo tek basina da kullaniliyor (Ana Sayfa cumlesi).
    tempo,
  };
}
