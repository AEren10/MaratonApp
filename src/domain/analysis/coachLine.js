// ANALIZ KOC CUMLESI (saf). "Ne oldu?" sorusunu ekran zaten yanitliyor; bu
// tek cumle "simdi tek olarak ne yapmaliyim?" sorusunu sahiplenir.
// Yalniz gercek veriden: ayni turden en az iki deneme, ders bazinda net.
// Belirgin bir dusus yoksa aksiyon onerilmez (uydurma is yok).
import { TRIAL_TO_CURRICULUM } from "../trial/trialKeyMap.js";

const DROP_NET = 2;   // bu kadar net kayip "belirgin"
const RISE_NET = 2;
const ACTION_MINUTES = 20;

const fmt = (n) => (Math.round(n * 10) / 10).toLocaleString("tr-TR");
const dateOf = (t) => String(t?.date || t?.trial_date || "");

/**
 * @param trials normalize denemeler (subjects: { tyt_matematik: { net } })
 * @param labelOf (trialSubjectKey) => "Matematik"
 * @returns null | { tone: "down"|"up", text, action: { subject, minutes, label } | null }
 */
export function analysisCoachLine(trials = [], labelOf = (k) => k) {
  const sorted = [...(trials || [])]
    .filter((t) => !(t?.branchSubject || t?.branch_subject))
    .sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
  const latest = sorted[0];
  if (!latest) return null;
  const type = latest.trialType || latest.exam_type || "TYT";
  const same = sorted.filter((t) => (t.trialType || t.exam_type || "TYT") === type).slice(0, 3);
  if (same.length < 2) return null;

  const [now, ...before] = same;
  let worst = null;
  let best = null;
  for (const [key, data] of Object.entries(now.subjects || {})) {
    const prev = before.map((t) => t.subjects?.[key]?.net).filter((v) => Number.isFinite(v));
    if (!prev.length || !Number.isFinite(data?.net)) continue;
    const delta = data.net - prev.reduce((a, b) => a + b, 0) / prev.length;
    if (!worst || delta < worst.delta) worst = { key, delta };
    if (!best || delta > best.delta) best = { key, delta };
  }

  const span = before.length === 1 ? "son denemede" : `son ${same.length} denemede`;
  if (worst && worst.delta <= -DROP_NET) {
    const label = labelOf(worst.key);
    const targets = TRIAL_TO_CURRICULUM[worst.key] || [];
    // Fen/Sosyal gibi birlesik bolumde hangi dersten kaybedildigi denemeden
    // bilinmez: ders uydurulmaz, aksiyon onerilmez.
    if (targets.length !== 1) {
      return {
        tone: "down",
        text: `${label} ${span} ${fmt(-worst.delta)} net geriledi. Hangi dersten kaybettiğini ders ayrıntısında görebilirsin.`,
        action: null,
      };
    }
    return {
      tone: "down",
      text: `${label} ${span} ${fmt(-worst.delta)} net geriledi. Bugüne ${ACTION_MINUTES} dakika ${label} ekle.`,
      action: { subject: targets[0], minutes: ACTION_MINUTES, label: `Bugüne ${ACTION_MINUTES} dk ${label} ekle` },
    };
  }
  if (best && best.delta >= RISE_NET) {
    return {
      tone: "up",
      text: `${labelOf(best.key)} ${span} ${fmt(best.delta)} net arttı. Rotan bu tempoyla devam ediyor.`,
      action: null,
    };
  }
  return null;
}
