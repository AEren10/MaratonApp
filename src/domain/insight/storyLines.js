// TEK CUMLELIK HIKAYE -- "Ders analizi" deseni (buyuk sayi + tek cumle).
//
// Kullanicinin en sevdigi ekran bu: sayi soyler, cumle ANLAM verir ("Net
// kaybinin cogu bosluklardan: bilmedigin konular var"). Ayni dil diger
// ekranlara tasiniyor. Kurallar:
//   - iki parca en fazla: durum + yorum
//   - veri yoksa durust bos hal, sayi uydurulmaz
//   - ders adina ek yok ("Matematige", "Fenden" ek hatasi riskli):
//     "En cok Turkce calistin", "En yuksek net: Matematik"

const round1 = (n) => Math.round(n * 10) / 10;
const fmt1 = (n) => String(round1(n)).replace(".", ",");

export function formatDuration(minutes) {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} dk`;
  return r ? `${h} sa ${r} dk` : `${h} sa`;
}

/** Konu detayi. accuracy: % (null = dogru sayisi girilmemis). */
export function topicStory({ q = 0, accuracy = null, wrongsOpen = 0, daysSince = null, feel = null } = {}) {
  if (!q) return "Bu konuya henüz başlamadın.";
  let state;
  if (accuracy != null) {
    state = accuracy >= 80 ? `Konu oturmuş: doğruluk %${accuracy}.`
      : accuracy >= 60 ? `Gelişiyor: doğruluk %${accuracy}.`
        : `Takılıyorsun: doğruluk %${accuracy}.`;
  } else {
    state = feel === "hard" ? `${q} soru çözdün; zorladığını söyledin.`
      : feel === "easy" ? `${q} soru çözdün; kolay geldiğini söyledin.`
        : `${q} soru çözdün.`;
  }
  const note = wrongsOpen > 0 ? `Defterde bekleyen ${wrongsOpen} yanlış var.`
    : daysSince != null && daysSince >= 14 ? `${daysSince} gündür dokunmadın; unutma başladı.`
      : "";
  return `${state} ${note}`.trim();
}

/** Haftalik ozet. bySubject: [{ label, minutes }] */
export function weekStory({ minutes = 0, prevMinutes = null, bySubject = [] } = {}) {
  if (!minutes) return "Bu hafta henüz çalışma kaydın yok.";
  let trend;
  if (!prevMinutes) trend = `Bu hafta ${formatDuration(minutes)} çalıştın.`;
  else {
    const diff = minutes - prevMinutes;
    trend = diff >= 15 ? `Geçen haftadan ${formatDuration(diff)} fazla.`
      : diff <= -15 ? `Geçen haftadan ${formatDuration(-diff)} az.`
        : "Geçen haftayla aynı tempodasın.";
  }
  const top = [...(bySubject || [])].filter((s) => s?.minutes > 0).sort((a, b) => b.minutes - a.minutes)[0];
  return top ? `${trend} En çok ${top.label} çalıştın.` : trend;
}

/** Deneme detayi. subjects: [{ label, net, empty }] */
export function trialStory({ subjects = [] } = {}) {
  const list = (subjects || []).filter((s) => s && s.label && Number.isFinite(Number(s.net)));
  if (!list.length) return "Bu denemede ders kırılımı yok.";
  const best = [...list].sort((a, b) => b.net - a.net)[0];
  const emptiest = [...list].filter((s) => Number(s.empty) > 0).sort((a, b) => b.empty - a.empty)[0];
  const first = `En yüksek net: ${best.label} (${fmt1(best.net)}).`;
  return emptiest && emptiest.label !== best.label
    ? `${first} En çok boş: ${emptiest.label} (${emptiest.empty}).`
    : first;
}

/** Istatistiklerim. weeks: son haftalarin dakikasi (eskiden yeniye). */
export function statsStory({ weeks = [], bestWeekLabel = null } = {}) {
  const recent = (weeks || []).slice(-4).map((w) => Number(w) || 0);
  const active = recent.filter((m) => m > 0);
  if (!active.length) return "Son haftalarda çalışma kaydın yok; ilk kayıtla burası dolacak.";
  const avgHours = recent.reduce((a, b) => a + b, 0) / recent.length / 60;
  const first = `Son ${recent.length} haftanın ortalaması: haftada ${fmt1(avgHours)} saat.`;
  return bestWeekLabel ? `${first} En iyi haftan: ${bestWeekLabel}.` : first;
}
