import { useEffect, useState } from "react";

import { getStudyLogs } from "../supabase/studyLogs";
import { dateKey } from "../lib/dateUtils";

const EMPTY_COUNTS = [0, 0, 0, 0, 0, 0, 0];

function buildWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);
  return { dayOfWeek, from: dateKey(prevMonday), mondayStr: dateKey(monday), to: dateKey(now) };
}

function localState(todayLogs, dayOfWeek) {
  const counts = [...EMPTY_COUNTS];
  todayLogs.forEach((log) => { counts[dayOfWeek] += log.questionCount || 0; });
  const total = counts.reduce((sum, count) => sum + count, 0);
  return {
    weeklyActivity: { total, counts, percent: 0, previous: null },
    weekLogs: todayLogs, loaded: true, failed: false,
  };
}

// Bu hafta + gecen haftanin kayitlari: haftalik soru dagilimi (son hafta
// hero'su) ve "SON ÇALIŞMALARIN" listesi ayni tek istekten beslenir.
export function useHomeWeekLogs({ todayLogs, userId }) {
  const [state, setState] = useState({
    weeklyActivity: { total: 0, counts: EMPTY_COUNTS, percent: 0, previous: null },
    weekLogs: [],
    loaded: false,
    failed: false,
  });

  useEffect(() => {
    const { dayOfWeek, from, mondayStr, to } = buildWeekDates();
    if (!userId || userId === "dev") {
      setState(localState(todayLogs, dayOfWeek));
      return undefined;
    }

    let cancelled = false;
    getStudyLogs(userId, { from, to }).then((logs) => {
      if (cancelled) return;
      const local = localState(todayLogs, dayOfWeek).weeklyActivity.counts;
      const weekCounts = [...EMPTY_COUNTS];
      const weekLogs = [];
      // Gecen hafta GUN GUN tutuluyor, tek toplam olarak degil: sali gunu
      // "bu hafta 300" ile "gecen hafta 1400" karsilastirmasi anlamsiz --
      // gecen haftanin da yalnizca ilk iki gunune bakilmali.
      const prevCounts = [...EMPTY_COUNTS];
      (logs || []).forEach((log) => {
        const dateStr = String(log.study_date || "").slice(0, 10);
        const questionCount = log.questionCount ?? log.question_count ?? 0;
        if (dateStr < mondayStr) {
          const prevDate = new Date(log.study_date);
          const index = prevDate.getDay() === 0 ? 6 : prevDate.getDay() - 1;
          prevCounts[index] += questionCount;
          return;
        }
        weekLogs.push(log);
        const date = new Date(log.study_date);
        weekCounts[date.getDay() === 0 ? 6 : date.getDay() - 1] += questionCount;
      });
      weekCounts[dayOfWeek] = Math.max(weekCounts[dayOfWeek], local[dayOfWeek]);
      const total = weekCounts.reduce((sum, count) => sum + count, 0);
      // Gecen haftanin AYNI gunune kadarki toplami.
      const previous = prevCounts
        .slice(0, dayOfWeek + 1)
        .reduce((sum, count) => sum + count, 0);
      const percent = previous > 0
        ? Math.round(((total - previous) / previous) * 100)
        : (total > 0 ? 100 : 0);
      setState({
        weeklyActivity: { total, counts: weekCounts, percent, previous },
        weekLogs: weekLogs.length ? weekLogs : todayLogs,
        loaded: true,
        failed: false,
      });
    }).catch(() => {
      if (cancelled) return;
      setState({ ...localState(todayLogs, dayOfWeek), failed: true });
    });

    return () => { cancelled = true; };
  }, [todayLogs, userId]);

  return state;
}
