import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";

function startOfWeek() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function toIso(d) {
  return d.toISOString().split("T")[0];
}

export function useWeeklyTrialReport() {
  const trials = useSelector(selectTrials);

  return useMemo(() => {
    const ws = startOfWeek();
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    we.setHours(23, 59, 59, 999);

    const pws = new Date(ws);
    pws.setDate(pws.getDate() - 7);
    const pwe = new Date(ws);
    pwe.setDate(pwe.getDate() - 1);
    pwe.setHours(23, 59, 59, 999);

    const week = trials.filter((t) => {
      const d = new Date(t.date);
      return d >= ws && d <= we;
    });
    const prev = trials.filter((t) => {
      const d = new Date(t.date);
      return d >= pws && d <= pwe;
    });

    const count = week.length;
    const nets = week.map((t) => t.totalNet || 0);
    const avgNet = count > 0 ? nets.reduce((a, b) => a + b, 0) / count : 0;
    const bestNet = count > 0 ? Math.max(...nets) : 0;
    const bestTrial = count > 0 ? week.find((t) => (t.totalNet || 0) === bestNet) : null;

    const totalCorrect = week.reduce((s, t) => {
      if (!t.subjects) return s;
      return s + Object.values(t.subjects).reduce((a, v) => a + (v.correct || 0), 0);
    }, 0);
    const totalWrong = week.reduce((s, t) => {
      if (!t.subjects) return s;
      return s + Object.values(t.subjects).reduce((a, v) => a + (v.wrong || 0), 0);
    }, 0);

    const prevAvg = prev.length > 0
      ? prev.reduce((s, t) => s + (t.totalNet || 0), 0) / prev.length
      : 0;
    const netDelta = avgNet - prevAvg;

    const typeMap = {};
    week.forEach((t) => {
      const key = t.trialType || "OTHER";
      if (!typeMap[key]) typeMap[key] = { count: 0, totalNet: 0 };
      typeMap[key].count += 1;
      typeMap[key].totalNet += t.totalNet || 0;
    });
    const types = Object.entries(typeMap)
      .map(([key, v]) => ({ key, count: v.count, avgNet: v.totalNet / v.count }))
      .sort((a, b) => b.count - a.count);

    const subjectMap = {};
    week.forEach((t) => {
      if (!t.subjects) return;
      Object.entries(t.subjects).forEach(([key, v]) => {
        if (!subjectMap[key]) subjectMap[key] = { totalNet: 0, count: 0, correct: 0, wrong: 0 };
        subjectMap[key].totalNet += v.net || 0;
        subjectMap[key].count += 1;
        subjectMap[key].correct += v.correct || 0;
        subjectMap[key].wrong += v.wrong || 0;
      });
    });
    const subjects = Object.entries(subjectMap)
      .map(([key, v]) => ({ key, avgNet: v.totalNet / v.count, correct: v.correct, wrong: v.wrong }))
      .sort((a, b) => b.avgNet - a.avgNet);

    const dayLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    const dailyActivity = dayLabels.map((label, i) => {
      const d = new Date(ws);
      d.setDate(d.getDate() + i);
      const dateStr = toIso(d);
      const dayTrials = week.filter((t) => t.date === dateStr);
      return { label, count: dayTrials.length, avgNet: dayTrials.length > 0
        ? dayTrials.reduce((s, t) => s + (t.totalNet || 0), 0) / dayTrials.length : 0 };
    });

    return {
      count,
      avgNet: avgNet.toFixed(1),
      bestNet: bestNet.toFixed(1),
      bestTrial,
      totalCorrect,
      totalWrong,
      netDelta: netDelta.toFixed(1),
      hasPrev: prev.length > 0,
      prevCount: prev.length,
      types,
      subjects,
      dailyActivity,
      trials: week,
    };
  }, [trials]);
}
