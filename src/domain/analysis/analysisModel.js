import { getAllSubjects, getTrialTypes } from "../trial/trialTypes";

export function filterAnalysisTrials(trials, filter) {
  if (filter === "ALL") return trials.filter((trial) => trial.trialType !== "BRANCH");
  if (filter === "TYT") return trials.filter((trial) => trial.trialType === "TYT");
  if (filter === "LGS") return trials.filter((trial) => trial.trialType === "LGS");
  if (filter === "BRANCH") return trials.filter((trial) => trial.trialType === "BRANCH");
  if (filter === "AYT") {
    return trials.filter((trial) => trial.trialType && trial.trialType.startsWith("AYT"));
  }
  return trials;
}

function subjectsForFilter(C, filter, latestTrial, examType) {
  const trialTypes = getTrialTypes(C);
  const allSubjects = getAllSubjects(C);
  if (filter === "TYT") return trialTypes.TYT.subjects;
  if (filter === "LGS") return trialTypes.LGS.subjects;
  if (filter === "AYT" && latestTrial?.trialType) {
    const type = trialTypes[latestTrial.trialType];
    if (type) return type.subjects;
  }
  if (filter === "BRANCH" && latestTrial?.branchSubject) {
    return allSubjects.filter((subject) => subject.key === latestTrial.branchSubject);
  }
  if (filter === "ALL" && latestTrial?.trialType) {
    const type = trialTypes[latestTrial.trialType];
    if (type) return type.subjects;
  }
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
      latest: { net: 0, trend: 0, date: "İlk denemeni gir" },
      bars: [],
      line: [],
      lineLabels: [],
      history: [],
    };
  }

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];
  const previous = sorted[1];
  const net = latest.totalNet || 0;
  const trend = previous ? net - (previous.totalNet || 0) : 0;
  const heroType = latest.trialType;
  const heroSlice = filter === "ALL"
    ? sorted.filter((trial) => trial.trialType === heroType).slice(0, 12)
    : sorted.slice(0, 12);
  const history = sorted.slice(0, 6).map((trial, index) => {
    const prevTrial = sorted[index + 1];
    return {
      id: trial.id,
      date: formatTrialDate(trial.date, { day: "numeric", month: "short" }),
      net: trial.totalNet || 0,
      trend: prevTrial ? (trial.totalNet || 0) - (prevTrial.totalNet || 0) : 0,
      trialType: trial.trialType,
      name: trial.name,
    };
  });
  const subjects = subjectsForFilter(C, filter, latest, examType);
  const bars = subjects.map((subject) => ({
    key: subject.key,
    name: subject.name,
    color: subject.color,
    net: latest?.subjects?.[subject.key]?.net || 0,
    max: subject.max,
  }));
  const heroLine = heroSlice.slice().reverse().map((trial) => trial.totalNet || 0);
  const heroLabels = heroSlice.slice().reverse().map((trial) =>
    formatTrialDate(trial.date, { day: "numeric", month: "short" }),
  );

  return {
    empty: false,
    filteredTrials: filtered,
    bars,
    heroLabels,
    heroLine,
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
        trend: previous ? (latest.totalNet || 0) - (previous.totalNet || 0) : 0,
        date: formatTrialDate(latest.date, { day: "numeric", month: "short" }),
        count: trials.length,
      };
    });
}
