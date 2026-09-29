import { getAllSubjects, getTrialTypes } from "../trial/trialTypes.js";

export function isSameExamFamily(a, b) {
  if (!a || !b) return false;
  const typeA = String(a.trialType || a.exam_type || "").toUpperCase();
  const typeB = String(b.trialType || b.exam_type || "").toUpperCase();
  if (!typeA || !typeB) return false;
  if (typeA === "BRANCH" || typeB === "BRANCH") {
    const subjA = a.branchSubject || a.branch_subject;
    const subjB = b.branchSubject || b.branch_subject;
    return typeA === typeB && Boolean(subjA && subjA === subjB);
  }
  if (typeA.startsWith("AYT") && typeB.startsWith("AYT")) return true;
  return typeA === typeB;
}

export function filterAnalysisTrials(trials, filter) {
  if (filter === "ALL") return trials.filter((trial) => trial.trialType !== "BRANCH");
  if (filter === "TYT") return trials.filter((trial) => trial.trialType === "TYT");
  if (filter === "AYT") {
    return trials.filter((trial) => trial.trialType && trial.trialType.startsWith("AYT"));
  }
  if (filter === "YDT") return trials.filter((trial) => trial.trialType === "YDT");
  if (filter === "LGS") return trials.filter((trial) => trial.trialType === "LGS");
  if (filter === "BRANCH") return trials.filter((trial) => trial.trialType === "BRANCH");
  return trials;
}

function subjectsForFilter(C, filter, latestTrial, examType) {
  const trialTypes = getTrialTypes(C);
  const allSubjects = getAllSubjects(C);
  if (filter === "TYT") return trialTypes.TYT.subjects;
  if (filter === "AYT" && latestTrial?.trialType) {
    const type = trialTypes[latestTrial.trialType];
    if (type) return type.subjects;
    return trialTypes.AYT_SAY.subjects;
  }
  if (filter === "YDT") return trialTypes.YDT?.subjects || [];
  if (filter === "LGS") return trialTypes.LGS.subjects;
  if (filter === "BRANCH" && latestTrial?.branchSubject) {
    return allSubjects.filter((subject) => subject.key === latestTrial.branchSubject);
  }
  if (filter === "ALL" && latestTrial?.trialType) {
    const type = trialTypes[latestTrial.trialType];
    if (type) return type.subjects;
  }
  if (examType === "dil") return trialTypes.YDT?.subjects || [];
  if (examType === "lgs") return trialTypes.LGS.subjects;
  return trialTypes.TYT.subjects;
}

function formatTrialDate(date, options) {
  return new Date(date).toLocaleDateString("tr-TR", options);
}

export function buildAnalysisViewModel({ C, examType, filter, trials }) {
  const filtered = filterAnalysisTrials(trials, filter);
  if (!filtered.length) {
    return {
      empty: true,
      filteredTrials: filtered,
      latest: { net: null, trend: null, date: null, typeLabel: null },
      bars: [],
      heroLine: [],
      heroSeries: [],
      heroLabels: [],
      line: [],
      lineLabels: [],
      history: [],
    };
  }

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(b.date) - new Date(a.date);
    if (diff !== 0) return diff;
    const timeA = a.created_at || a.createdAt ? new Date(a.created_at || a.createdAt).getTime() : 0;
    const timeB = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
  const latest = sorted[0];
  const previous = sorted.find((t, i) => i > 0 && isSameExamFamily(t, latest)) || null;
  const net = latest.totalNet || 0;
  const trend = previous ? Number(((latest.totalNet || 0) - (previous.totalNet || 0)).toFixed(2)) : null;
  const heroType = latest.trialType;
  const heroSlice = filter === "ALL"
    ? sorted.filter((trial) => isSameExamFamily(trial, latest)).slice(0, 12)
    : sorted.slice(0, 12);
  const history = sorted.slice(0, 6).map((trial, index) => {
    const prevTrial = sorted.find((t, i) => i > index && isSameExamFamily(t, trial)) || null;
    return {
      id: trial.id,
      date: formatTrialDate(trial.date, { day: "numeric", month: "short" }),
      net: trial.totalNet || 0,
      trend: prevTrial ? Number(((trial.totalNet || 0) - (prevTrial.totalNet || 0)).toFixed(2)) : null,
      trialType: trial.trialType,
      name: trial.name,
    };
  });
  const subjects = subjectsForFilter(C, filter, latest, examType);
  // Ders karti bir zamanlar trend okunu ve mini grafigi sabit bir listeden
  // esleyerek ciziyordu: gercek net yaninda UYDURMA bir egri. Ikisi de burada
  // ham denemelerden hesaplaniyor; hesaplanamiyorsa null donuyor ve kart
  // grafigi hic cizmiyor.
  const oldestFirst = [...sorted].reverse();
  const bars = subjects.map((subject) => {
    const series = oldestFirst
      .map((trial) => trial.subjects?.[subject.key]?.net)
      .filter((n) => Number.isFinite(n))
      .slice(-6);
    const hasTrend = series.length >= 2;
    return {
      key: subject.key,
      name: subject.name,
      color: subject.color,
      net: latest?.subjects?.[subject.key]?.net || 0,
      max: subject.max,
      series: hasTrend ? series : null,
      delta: hasTrend ? series[series.length - 1] - series[series.length - 2] : null,
      lo: hasTrend ? Math.min(...series) : null,
      hi: hasTrend ? Math.max(...series) : null,
    };
  });
  const heroLine = heroSlice.slice().reverse().map((trial) => trial.totalNet || 0);
  // "Tumu"de TYT ve AYT ayni grafikte iki cizgi (kullanici istegi, 28 Eylul).
  // Tarihleri farkli oldugu icin noktalar zaman eksenine yerlesir.
  const typeSeries = (type) => {
    let lastT = -Infinity;
    return sorted
      // AYT denemeleri AYT_SAY / AYT_EA / AYT_SOZ olarak kaydediliyor; tam
      // esitlik AYT cizgisini cogu kullanicida hic cizmiyordu.
      .filter((trial) => (type === "AYT" ? String(trial.trialType || "").startsWith("AYT") : trial.trialType === type))
      .slice(0, 12)
      .reverse()
      .map((trial) => {
        // Eksen DENEME TARIHI; ayni gundekiler 3 saat arayla (girilme ani
        // degil: gecmis tarihli deneme bugun girilince bugune kaymasin).
        let t = new Date(trial.date).getTime();
        if (!Number.isFinite(t)) t = 0;
        if (t <= lastT) t = lastT + 3 * 3600000;
        lastT = t;
        return { t, v: trial.totalNet || 0 };
      });
  };
  const multiTypes = examType === "dil"
    ? ["TYT", "YDT"]
    : (examType === "lgs" ? ["LGS"] : ["TYT", "AYT"]);
  const heroSeries = filter === "ALL"
    ? multiTypes.map((type) => ({ key: type, points: typeSeries(type) })).filter((series) => series.points.length)
    : [];
  const heroLabels = heroSlice.slice().reverse().map((trial) =>
    formatTrialDate(trial.date, { day: "numeric", month: "short" }),
  );

  return {
    empty: false,
    filteredTrials: filtered,
    bars,
    heroLabels,
    heroLine,
    heroSeries,
    history,
    latest: {
      net,
      trend,
      date: formatTrialDate(latest.date, { day: "numeric", month: "long", year: "numeric" }),
      typeLabel: getTrialTypes(C)[latest.trialType]?.label || latest.name || "Deneme",
    },
    typeBreakdown: buildTypeBreakdown(C, filter, sorted),
  };
}

function buildTypeBreakdown(C, filter, sorted) {
  if (filter !== "ALL") return null;
  const byType = {};
  sorted.forEach((trial) => {
    if (!byType[trial.trialType]) byType[trial.trialType] = [];
    byType[trial.trialType].push(trial);
  });

  const types = getTrialTypes(C);
  return Object.entries(byType)
    .filter(([, trials]) => trials.length > 0)
    .map(([type, trials]) => {
      const latest = trials[0];
      const previous = trials[1];
      const color = types[type]?.color || C.amber;
      return {
        type,
        label: types[type]?.label || type,
        color,
        net: latest.totalNet || 0,
        trend: previous ? Number(((latest.totalNet || 0) - (previous.totalNet || 0)).toFixed(2)) : null,
        date: formatTrialDate(latest.date, { day: "numeric", month: "short" }),
        count: trials.length,
      };
    });
}
