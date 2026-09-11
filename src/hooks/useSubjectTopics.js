import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getTopicProgress } from "../supabase/topicProgress";
import { getSubjectByKey } from "../themes/subjects";
import { TRIAL_TO_CURRICULUM } from "../domain/trial/trialKeyMap";
import { calcTopicProgress } from "./useDerslerProgress";
import { captureError } from "../lib/errorReporting";

function formatMinutes(min) {
  if (!min) return null;
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} sa`;
  return `${min} dk`;
}

function buildMeta(tp) {
  const q = tp?.total_questions || 0;
  const dur = formatMinutes(tp?.total_minutes);
  if (q === 0) return "0 soru";
  return dur ? `${q} soru · ${dur}` : `${q} soru`;
}

function buildTopics(curriculumKeys, progressRows) {
  const byKeyName = {};
  progressRows.forEach((r) => {
    if (!curriculumKeys.includes(r.subject_key) || !r.topic_name) return;
    byKeyName[r.topic_name] = r;
  });

  const list = [];
  curriculumKeys.forEach((ck) => {
    const found = getSubjectByKey(ck);
    (found?.topics || []).forEach((t) => {
      const name = typeof t === "string" ? t : t.name;
      const tp = byKeyName[name];
      const pct = tp ? calcTopicProgress(tp) : 0;
      const totalQuestions = tp?.total_questions || 0;
      const accuracy = totalQuestions > 0 ? Math.round(((tp.correct_count || 0) / totalQuestions) * 100) : null;
      list.push({ name, pct, done: pct >= 100, totalQuestions, meta: buildMeta(tp), accuracy });
    });
  });
  return list;
}

// Ders bazli konu listesi — gercek ilerleme `topic_progress`'ten, konu
// isimleri `src/data/curriculum.js`'ten (unite kavrami yok, duz liste).
export function useSubjectTopics(subjectKey) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const curriculumKeys = useMemo(
    () => TRIAL_TO_CURRICULUM[subjectKey] || [subjectKey],
    [subjectKey],
  );

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await getTopicProgress(user.id);
      setRows(data || []);
    } catch (e) {
      captureError(e, { context: "useSubjectTopics_load" });
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const topics = useMemo(() => buildTopics(curriculumKeys, rows), [curriculumKeys, rows]);

  const { doneCount, totalCount, totalQuestionsSum, progressPct } = useMemo(() => {
    const done = topics.filter((t) => t.done).length;
    const total = topics.length;
    const questions = topics.reduce((s, t) => s + t.totalQuestions, 0);
    return {
      doneCount: done,
      totalCount: total,
      totalQuestionsSum: questions,
      progressPct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [topics]);

  return { topics, doneCount, totalCount, totalQuestionsSum, progressPct, loading, error, refresh: load };
}
