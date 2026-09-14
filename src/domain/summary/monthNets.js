import { inRange, toKey } from "./dateKeys.js";
import { formatNet, formatSignedNet, shortDateLabel, upperTr } from "./summaryFormat.js";

const trialKey = (trial) => toKey(trial?.date ?? trial?.trial_date);
const netOf = (trial) => Number(trial?.totalNet ?? trial?.total_net ?? 0) || 0;
const mean = (values) => values.reduce((s, v) => s + v, 0) / values.length;

/**
 * Ayin denemelerinden net anlatisi.
 *
 * Farkli sinav turlerinin netleri toplanamaz (TYT 120 soru, AYT 80).
 * Ay icinde en cok girilen tur esas alinir; esitlikte en son girilen.
 *
 * - heroValue: ay ortalamasinin tam kismi ("68" = 68 ve ustu)
 * - milestone: onceki aylarin (ayni tur) ortalamalarinin hepsi heroValue'nun
 *   altindaysa ve en az bir onceki ay varsa -- "ilk kez 68'i gecti"
 * - span: ilk ve son deneme (en az iki deneme)
 * - subjects: son denemenin ders netleri, ilk denemeye gore fark ("AY BAŞINA GÖRE")
 */
export function buildMonthNets(trials = [], range, subjectMeta = {}) {
  const inMonth = trials.filter((t) => inRange(trialKey(t), range.start, range.end));
  if (inMonth.length === 0) return null;

  const type = primaryType(inMonth);
  const list = inMonth
    .filter((t) => t.trialType === type)
    .sort((a, b) => trialKey(a).localeCompare(trialKey(b)));
  const average = mean(list.map(netOf));
  const heroValue = Math.floor(average);

  const byMonth = new Map();
  trials
    .filter((t) => t.trialType === type && trialKey(t) && trialKey(t) < range.start)
    .forEach((t) => {
      const month = trialKey(t).slice(0, 7);
      byMonth.set(month, [...(byMonth.get(month) || []), netOf(t)]);
    });
  const previousAverages = [...byMonth.values()].map(mean);
  const milestone = heroValue > 0 && previousAverages.length > 0
    && previousAverages.every((avg) => avg < heroValue);

  const first = list[0];
  const last = list[list.length - 1];
  const span = list.length >= 2 ? {
    startLabel: shortDateLabel(trialKey(first)),
    startValue: formatNet(netOf(first)),
    endLabel: shortDateLabel(trialKey(last)),
    endValue: formatNet(netOf(last)),
    delta: netOf(last) - netOf(first),
    deltaLabel: formatSignedNet(netOf(last) - netOf(first)),
  } : null;

  const subjects = Object.entries(last.subjects || {})
    .filter(([key, s]) => subjectMeta[key] && Number.isFinite(Number(s?.net)))
    .map(([key, s]) => {
      const meta = subjectMeta[key];
      const value = Number(s.net);
      const firstNet = list.length >= 2 ? Number(first.subjects?.[key]?.net) : NaN;
      const delta = Number.isFinite(firstNet) ? value - firstNet : null;
      return {
        key,
        name: upperTr(meta.name),
        color: meta.color || null,
        value: formatNet(value),
        ratio: meta.max ? Math.max(0, Math.min(1, value / meta.max)) : 0,
        delta,
        deltaLabel: delta == null ? null : formatSignedNet(delta),
      };
    });

  return { type, count: inMonth.length, average, heroValue, milestone, span, subjects };
}

function primaryType(list) {
  const counts = new Map();
  let latest = null;
  for (const t of list) {
    counts.set(t.trialType, (counts.get(t.trialType) || 0) + 1);
    if (!latest || trialKey(t) >= trialKey(latest)) latest = t;
  }
  const max = Math.max(...counts.values());
  const tied = [...counts.entries()].filter(([, c]) => c === max).map(([k]) => k);
  return tied.includes(latest.trialType) ? latest.trialType : tied[0];
}

export function trialNamesLabel(trials = [], range, limit = 2) {
  return trials
    .filter((t) => inRange(trialKey(t), range.start, range.end) && t.name)
    .sort((a, b) => trialKey(a).localeCompare(trialKey(b)))
    .slice(0, limit)
    .map((t) => t.name)
    .join(" · ");
}
