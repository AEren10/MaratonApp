import { useCallback, useEffect, useMemo, useState } from "react";
import { getStudyLogsByTopic } from "../supabase/studyLogs";
import { getWrongQuestions } from "../supabase/wrongQuestions";
import { getTopicProgress } from "../supabase/topicProgress";
import { formatMinutes } from "../lib/format";
import {
  dueMeta,
  lastStudyLabel,
  shortDate,
  buildChart,
} from "./topicStudyDetailHelpers";
import { todayTR } from "../lib/dateUtils";

export function useTopicStudyDetail({ userId, subjectKey, topicName }) {
  const [history, setHistory] = useState([]);
  const [wrongItems, setWrongItems] = useState([]);
  const [progressRow, setProgressRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!userId || userId === "dev" || !subjectKey || !topicName) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([
      getStudyLogsByTopic(userId, subjectKey, topicName),
      getWrongQuestions(userId, { subject: subjectKey, resolved: false }),
      getTopicProgress(userId).catch(() => []),
    ])
      .then(([logs, wrongs, progresses]) => {
        if (cancelled) return;
        setHistory(logs || []);
        setWrongItems((wrongs || []).filter((w) => w.topic === topicName));
        const tp = (progresses || []).find(
          (r) => (r.topic_name === topicName || r.custom_topic === topicName) && r.subject_key === subjectKey
        );
        setProgressRow(tp || null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, subjectKey, topicName, reloadTick]);

  const refetch = useCallback(() => setReloadTick((t) => t + 1), []);

  const sortedLogs = useMemo(
    () => [...history].sort((a, b) => new Date(a.study_date) - new Date(b.study_date)),
    [history]
  );

  const totalDurationLabel = useMemo(
    () => formatMinutes(history.reduce((sum, h) => sum + (h.duration_minutes || 0), 0)),
    [history]
  );

  const chart = useMemo(() => buildChart(sortedLogs), [sortedLogs]);

  const wrongList = useMemo(
    () => wrongItems.map((item) => ({ ...item, due: dueMeta(item), dateLabel: shortDate(item.created_at) })),
    [wrongItems]
  );

  const totalQuestions = useMemo(() => {
    if (progressRow?.total_questions > 0) return progressRow.total_questions;
    return history.reduce((sum, h) => sum + (h.question_count || 0), 0);
  }, [progressRow, history]);

  const correctCount = useMemo(() => {
    if (progressRow?.correct_count != null && progressRow.total_questions > 0) {
      return progressRow.correct_count;
    }
    return history.reduce((sum, h) => sum + (h.correct_count || 0), 0);
  }, [progressRow, history]);

  const accuracy = useMemo(
    () => (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : null),
    [totalQuestions, correctCount]
  );

  const recentLogs = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(b.study_date || b.created_at) - new Date(a.study_date || a.created_at))
      .slice(0, 5)
      .map((log) => ({
        id: log.id,
        dateLabel: shortDate(log.study_date),
        questionCount: log.question_count || 0,
        correctCount: log.correct_count ?? null,
        durationMinutes: log.duration_minutes || 0,
      }));
  }, [history]);

  const lastStudyDate = sortedLogs.length ? sortedLogs[sortedLogs.length - 1].study_date : null;

  const daysSince = useMemo(() => {
    if (!lastStudyDate) return null;
    // Iki tarih anahtari da UTC gece yarisi: fark tam gun. Date.now() ile
    // kiyaslamak TR gece yarisindan sonraki 3 saatte dunu 'bugun' sayiyordu.
    const diff = Date.parse(todayTR()) - Date.parse(String(lastStudyDate).slice(0, 10));
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [lastStudyDate]);

  const feel = useMemo(() => {
    const sortedDesc = [...history].sort((a, b) => new Date(b.study_date || b.created_at) - new Date(a.study_date || a.created_at));
    const withFeel = sortedDesc.find((h) => h.perceived);
    return withFeel?.perceived || null;
  }, [history]);

  return {
    loading,
    error,
    refetch,
    totalDurationLabel,
    chart,
    wrongList,
    lastStudyDate,
    totalQuestions,
    correctCount,
    accuracy,
    recentLogs,
    daysSince,
    feel,
    lastStudyText: lastStudyLabel(lastStudyDate),
  };
}
