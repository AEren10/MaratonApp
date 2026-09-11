import { useCallback, useEffect, useMemo, useState } from "react";
import { getStudyLogsByTopic } from "../supabase/studyLogs";
import { getWrongQuestions } from "../supabase/wrongQuestions";
import { formatMinutes } from "../lib/format";

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
    ])
      .then(([logs, wrongs]) => {
        if (cancelled) return;
        setHistory(logs || []);
        setWrongItems((wrongs || []).filter((w) => w.topic === topicName));
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
    () => wrongItems.map((item) => ({ ...item, due: dueMeta(item) })),
    [wrongItems]
  );

  const lastStudyDate = sortedLogs.length ? sortedLogs[sortedLogs.length - 1].study_date : null;

  return { loading, error, refetch, totalDurationLabel, chart, wrongList, lastStudyDate };
}
