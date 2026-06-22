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

function daysBetween(a, b) {
  return Math.round((b - a) / MS_PER_DAY);
}

function formatDD_MM(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}`;
}

// Ordinary least squares with R²
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
    sumXY += points[i].x * points[i].y;
    sumX2 += points[i].x * points[i].x;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * points[i].x + intercept;
    ssRes += (points[i].y - predicted) ** 2;
    ssTot += (points[i].y - yMean) ** 2;
  }

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2, ssRes };
}

export function forecastNet(trials, examDate) {
  if (!examDate || !trials || trials.length < 2) return null;

  const sorted = [...trials].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  const firstDate = new Date(sorted[0].date);
  const points = sorted.map((t) => ({
    x: daysBetween(firstDate, new Date(t.date)),
    y: t.totalNet,
  }));

  const reg = linearRegression(points);
  if (!reg) return null;

  const { slope, intercept, r2, ssRes } = reg;
  const n = points.length;

  const examDays = daysBetween(firstDate, examDate);
  const projected = Math.max(0, slope * examDays + intercept);
  const current = sorted[sorted.length - 1].totalNet;
  const first = sorted[0].totalNet;
  const weeklyGain = slope * 7;

  let confidence;
  if (n < 3 || r2 < 0.3) confidence = 'low';
  else if (r2 < 0.6) confidence = 'medium';
  else confidence = 'high';

  // se = sqrt(ssRes / (n - 2)), interval = projected ± 1.96 * se
  const se = n > 2 ? Math.sqrt(ssRes / (n - 2)) : Math.sqrt(ssRes / 1);
  const margin = 1.96 * se;
  const range = {
    low: Math.max(0, projected - margin),
    high: projected + margin,
  };

  const dataPoints = sorted.map((t) => {
    const d = new Date(t.date);
    return {
      dayIndex: daysBetween(firstDate, d),
      net: t.totalNet,
      dateStr: formatDD_MM(d),
    };
  });

  const projectionEnd = { dayIndex: examDays, net: projected };
  const daysLeft = daysBetween(new Date(), examDate);

  return {
    projected,
    current,
    first,
    weeklyGain,
    r2,
    confidence,
    range,
    dataPoints,
    projectionEnd,
    daysLeft,
  };
}

export function forecastBySubject(trials, examDate) {
  if (!examDate || !trials || trials.length < 2) return [];

  const sorted = [...trials].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  const firstDate = new Date(sorted[0].date);

  const subjectMap = {};
  for (const trial of sorted) {
    if (!trial.subjects) continue;
    for (const [key, val] of Object.entries(trial.subjects)) {
      if (val.net == null) continue;
      if (!subjectMap[key]) subjectMap[key] = [];
      subjectMap[key].push({
        x: daysBetween(firstDate, new Date(trial.date)),
        y: val.net,
      });
    }
  }

  const results = [];
  for (const [key, points] of Object.entries(subjectMap)) {
    if (points.length < 2) continue;
    const reg = linearRegression(points);
    if (!reg) continue;

    const examDays = daysBetween(firstDate, examDate);
    const projected = Math.max(0, reg.slope * examDays + reg.intercept);
    const current = points[points.length - 1].y;

    results.push({
      key,
      name: SUBJECT_NAMES[key] || key,
      current,
      projected,
      weeklyGain: reg.slope * 7,
      improving: reg.slope > 0,
    });
  }

  results.sort((a, b) => b.weeklyGain - a.weeklyGain);
  return results;
}
