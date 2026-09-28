// Gunluk hatirlatmanin METNI -- saf, test edilebilir.
//
// Eski hatirlatma her gun ayni soyut cumleydi ("Bugunku rota hazir").
// Artik o gunun plani biliniyorsa somut: kac durak, siradaki hangisi, kac
// dakika. Gunun isi bittiyse o gun hatirlatma YOK (null). Durak yok ama
// tekrari gelen yanlis varsa tekrar hatirlatmasi. Plani bilinmeyen gunler
// (ilerideki gunler) genel metin alir. Dil suclamaz; emoji yok.

export function dailyReminderContent({ todayPlan, reviewDue = 0 } = {}, dayKey, fallback) {
  const known = todayPlan && todayPlan.day === dayKey;
  if (!known) return fallback || null;

  const open = Number(todayPlan.open) || 0;
  const due = Number(reviewDue) || 0;
  if (open === 0) {
    if (due > 0) {
      return {
        title: `${due} yanlış tekrar bekliyor`,
        body: "Uyumadan önce birkaç dakika bakmak yeter.",
        kind: "review",
      };
    }
    return null; // gunun isi bitti: durtmuyoruz
  }

  const next = todayPlan.next;
  const minutes = Number(next?.minutes) || 0;
  const title = open === 1 ? "Bugün 1 durak var" : `Bugün ${open} durak var`;
  const body = next?.label
    ? `Sıradaki: ${next.label}${minutes ? ` · ~${minutes} dk` : ""}. Küçük bir başlangıç yeter.`
    : "Sıradaki durağı açmak için küçük bir başlangıç yeter.";
  return { title, body, kind: "plan" };
}

// Pazar karnesi: yalniz gercek sayi varsa sayili metin.
export function weeklySummaryContent({ questions = 0, minutes = 0 } = {}) {
  const q = Number(questions) || 0;
  const m = Number(minutes) || 0;
  if (!q && !m) return { title: "Haftanın özeti hazır", body: "Bu haftaya bir bak, gelecek haftanın rotası önünde." };
  const h = Math.floor(m / 60);
  const time = m ? (h ? `${h} sa${m % 60 ? ` ${m % 60} dk` : ""}` : `${m} dk`) : null;
  return {
    title: "Haftanın özeti hazır",
    body: [q ? `${q} soru` : null, time].filter(Boolean).join(" · ") + ". Raporuna göz at.",
  };
}
