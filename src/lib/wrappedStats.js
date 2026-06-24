export function computeWrapped(logs = [], trials = [], streak = 0, xp = 0) {
  if (!Array.isArray(logs)) logs = [];
  if (!Array.isArray(trials)) trials = [];
  const totalQuestions = logs.reduce((s, l) => s + (l.questionCount || l.question_count || 0), 0);
  const totalMinutes = logs.reduce((s, l) => s + (l.duration || l.duration_minutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const subjectMap = {};
  for (const l of logs) {
    const key = l.subject;
    if (!key) continue;
    if (!subjectMap[key]) subjectMap[key] = { questions: 0, minutes: 0 };
    subjectMap[key].questions += l.questionCount || l.question_count || 0;
    subjectMap[key].minutes += l.duration || l.duration_minutes || 0;
  }

  const subjects = Object.entries(subjectMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.questions - a.questions);

  const totalTrials = trials.length;
  const avgNet = totalTrials > 0
    ? Math.round(trials.reduce((s, t) => s + (t.totalNet || 0), 0) / totalTrials * 10) / 10
    : 0;
  const bestNet = trials.reduce((m, t) => Math.max(m, t.totalNet || 0), 0);
  const uniqueDays = new Set(logs.map((l) => l.study_date).filter(Boolean)).size;

  return {
    totalQuestions,
    totalMinutes,
    totalHours,
    subjects,
    strongestSubject: subjects[0] || null,
    totalTrials,
    avgNet,
    bestNet,
    uniqueDays,
    streak: streak || 0,
    xp: xp || 0,
  };
}

export function getWrappedPeriod() {
  const now = new Date();
  const day = now.getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  if (now.getDate() >= daysInMonth - 2) return "monthly";
  if (day === 0 || day === 6) return "weekly";
  return null;
}

export function getPeriodRange(period) {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  if (period === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: start.toISOString().split("T")[0], end };
  }
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  return { start: start.toISOString().split("T")[0], end };
}
