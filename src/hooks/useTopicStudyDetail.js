import { useCallback, useEffect, useMemo, useState } from "react";
import { getStudyLogsByTopic } from "../supabase/studyLogs";
import { getWrongQuestions } from "../supabase/wrongQuestions";
import { getTopicProgress } from "../supabase/topicProgress";
import { formatMinutes } from "../lib/format";
import { todayTR } from "../lib/dateUtils";

// Defterdeki bir yanlisin "ne zaman tekrar edilecegi" etiketi. Tasarim bu
// alani {{w.due}} olarak dinamik biraktigi icin bicimi biz seciyoruz —
// next_review_at gercek SR alanindan hesaplaniyor, uydurulmuyor.
function dueMeta(item) {
  if (!item.next_review_at) return { label: "YENİ", tone: "muted" };
  const days = Math.ceil((new Date(item.next_review_at).getTime() - Date.now()) / 86400000);
  if (days <= 0) return { label: "BUGÜN", tone: "warn" };
  if (days === 1) return { label: "YARIN", tone: "muted" };
  return { label: `${days} GÜN`, tone: "muted" };
}

function lastStudyLabel(studyDate) {
  if (!studyDate) return "Henüz yok";
  const days = Math.round((Date.parse(todayTR()) - Date.parse(String(studyDate).slice(0, 10))) / 86400000);
  if (days <= 0) return "Bugün";
  if (days === 1) return "Dün";
  return `${days} gün önce`;
}

function shortDate(value) {
  try {
    return new Date(value).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function monthLabel(date) {
  try {
    return date.toLocaleDateString("tr-TR", { month: "long" }).toUpperCase();
  } catch {
    return "";
  }
}

// "Calisma birikimi" egrisi: gunluk kayitlardan kumulatif soru sayisi.
// 2'den az veri noktasi varsa egri gosterilmiyor — cizgi uydurulmuyor.
function buildChart(sortedLogs) {
  if (sortedLogs.length < 2) return null;
  let cumulative = 0;
  const points = sortedLogs.map((log) => {
    cumulative += log.question_count || 0;
    return { date: new Date(log.study_date), value: cumulative };
  });
  if (points[points.length - 1].value <= 0) return null;
  return {
    points,
    totalLabel: `${points[points.length - 1].value} SORU`,
    startLabel: monthLabel(points[0].date),
    endLabel: monthLabel(points[points.length - 1].date),
  };
}

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

  return {
    loading, error, refetch, totalDurationLabel, chart, wrongList, lastStudyDate,
    totalQuestions, correctCount, accuracy, recentLogs, lastStudyText: lastStudyLabel(lastStudyDate),
  };
}
