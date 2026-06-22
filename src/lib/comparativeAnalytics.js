const SUBJECT_NAMES = {
  tyt_turkce: 'Türkçe',
  tyt_matematik: 'TYT Mat',
  tyt_fen: 'Fen',
  tyt_sosyal: 'Sosyal',
  ayt_matematik: 'AYT Mat',
  ayt_fizik: 'Fizik',
  ayt_kimya: 'Kimya',
  ayt_biyoloji: 'Biyoloji',
  ayt_edebiyat: 'Edebiyat',
  ayt_tarih1: 'Tarih-1',
  ayt_cografya1: 'Coğrafya-1',
  ayt_tarih2: 'Tarih-2',
  ayt_cografya2: 'Coğrafya-2',
  ayt_felsefe: 'Felsefe',
  ayt_din: 'Din',
};

const MS_PER_DAY = 86400000;

const TR_MONTHS = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

function formatDateTR(iso) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function splitPeriods(trials, periodDays) {
  const now = Date.now();
  const cutoff = now - periodDays * MS_PER_DAY;
  const prevCutoff = now - periodDays * 2 * MS_PER_DAY;
  const current = [];
  const previous = [];
  for (const t of trials) {
    const ts = new Date(t.date).getTime();
    if (ts >= cutoff) current.push(t);
    else if (ts >= prevCutoff) previous.push(t);
  }
  return { current, previous };
}

function avg(arr, fn) {
  if (!arr.length) return 0;
  let sum = 0;
  for (const item of arr) sum += fn(item);
  return sum / arr.length;
}

function best(arr, fn) {
  if (!arr.length) return 0;
  let max = -Infinity;
  for (const item of arr) {
    const v = fn(item);
    if (v > max) max = v;
  }
  return max;
}

function stdDev(arr, fn) {
  if (arr.length < 2) return 0;
  const mean = avg(arr, fn);
  let sumSq = 0;
  for (const item of arr) {
    const diff = fn(item) - mean;
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq / arr.length);
}

function comparePeriods(trials, periodDays = 30) {
  const { current, previous } = splitPeriods(trials, periodDays);
  if (!current.length) return null;

  const getNet = (t) => t.totalNet;
  const curAvg = avg(current, getNet);
  const curBest = best(current, getNet);
  const prevAvg = avg(previous, getNet);
  const prevBest = best(previous, getNet);
  const diffAvg = curAvg - prevAvg;
  const diffBest = curBest - prevBest;
  const pct = prevAvg === 0 ? null : ((curAvg - prevAvg) / Math.abs(prevAvg)) * 100;

  let improvementRate = 'stable';
  if (diffAvg > 1) improvementRate = 'improving';
  else if (diffAvg < -1) improvementRate = 'declining';

  return {
    current: { count: current.length, avgNet: curAvg, bestNet: curBest, trials: current },
    previous: { count: previous.length, avgNet: prevAvg, bestNet: prevBest, trials: previous },
    diff: { avgNet: diffAvg, bestNet: diffBest, pct },
    improvementRate,
  };
}

function subjectComparison(trials, periodDays = 30) {
  const { current, previous } = splitPeriods(trials, periodDays);
  const keys = new Set();
  for (const t of [...current, ...previous]) {
    if (t.subjects) for (const k of Object.keys(t.subjects)) keys.add(k);
  }

  const result = [];
  for (const key of keys) {
    const curTrials = current.filter((t) => t.subjects && t.subjects[key] != null);
    const prevTrials = previous.filter((t) => t.subjects && t.subjects[key] != null);
    const currentAvg = avg(curTrials, (t) => t.subjects[key].net);
    const previousAvg = avg(prevTrials, (t) => t.subjects[key].net);
    const diff = currentAvg - previousAvg;
    let status = 'stable';
    if (diff > 0.5) status = 'up';
    else if (diff < -0.5) status = 'down';

    result.push({
      key,
      name: SUBJECT_NAMES[key] || key,
      currentAvg,
      previousAvg,
      diff,
      status,
    });
  }

  result.sort((a, b) => b.diff - a.diff);
  return result;
}

function personalBests(trials) {
  const subjectMap = {};
  let overallBest = null;

  for (const t of trials) {
    if (overallBest === null || t.totalNet > overallBest.totalNet) {
      overallBest = t;
    }
    if (t.subjects) {
      for (const [key, val] of Object.entries(t.subjects)) {
        if (!subjectMap[key] || val.net > subjectMap[key].net) {
          subjectMap[key] = { net: val.net, date: t.date };
        }
      }
    }
  }

  const subjects = Object.entries(subjectMap)
    .map(([key, { net, date }]) => ({
      key,
      name: SUBJECT_NAMES[key] || key,
      bestNet: net,
      date: formatDateTR(date),
      trialDate: date,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  const overall = overallBest
    ? { bestNet: overallBest.totalNet, date: formatDateTR(overallBest.date), trialDate: overallBest.date }
    : { bestNet: 0, date: '', trialDate: '' };

  return { subjects, overall };
}

function consistencyScore(trials, periodDays = 30) {
  const { current } = splitPeriods(trials, periodDays);
  const sd = stdDev(current, (t) => t.totalNet);
  const score = Math.max(0, Math.min(100, 100 - sd * 5));

  let label;
  if (score > 80) label = 'Çok tutarlı';
  else if (score > 60) label = 'Tutarlı';
  else if (score > 40) label = 'Dalgalı';
  else label = 'Tutarsız';

  return { score, stdDev: sd, label, trialCount: current.length };
}

export { comparePeriods, subjectComparison, personalBests, consistencyScore };
