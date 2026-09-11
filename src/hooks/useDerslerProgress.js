import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getTopicProgress } from "../supabase/topicProgress";
import { captureError } from "../lib/errorReporting";

const EXPECTED_QUESTIONS = 30;

function calcTopicProgress(tp) {
  const qScore = Math.min((tp.total_questions || 0) / EXPECTED_QUESTIONS, 1) * 40;
  const accScore = tp.total_questions > 0 ? ((tp.correct_count || 0) / tp.total_questions) * 30 : 0;
  const freqScore = Math.min((tp.study_count || 0) / 3, 1) * 30;
  return Math.min(100, Math.round(qScore + accScore + freqScore));
}

function buildDersler(subjects, progressMap) {
  return subjects.map((s) => {
    const subjectProgress = progressMap[s.key] || {};
    const topicsList = (s.topics || []).map((t) => {
      const tName = typeof t === "string" ? t : t.name;
      const tp = subjectProgress[tName];
      return { name: tName, pct: tp ? calcTopicProgress(tp) : 0 };
    });
    const done = topicsList.filter((t) => t.pct >= 100).length;
    const total = topicsList.length;
    return { ...s, name: s.label, pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
  });
}

// "Tüm Dersler" konu-tamamlama ilerlemesi — tasarimin Program Hub
// artboard'unda karsiligi yok (mufredat kapsami baska bir akis), bu yuzden
// mevcut davranis korunuyor ve is mantigi buraya tasindi.
export function useDerslerProgress(activeSubjects) {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState({});

  const loadProgress = useCallback(async () => {
    if (!user?.id || user.id === "dev") return;
    try {
      const rows = await getTopicProgress(user.id);
      const map = {};
      (rows || []).forEach((r) => {
        if (!map[r.subject_key]) map[r.subject_key] = {};
        map[r.subject_key][r.topic_name || r.topic_id] = r;
      });
      setProgressMap(map);
    } catch (e) { captureError(e, { context: "dersler_loadProgress" }); }
  }, [user?.id]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const dersler = useMemo(
    () => buildDersler(activeSubjects, progressMap),
    [activeSubjects, progressMap],
  );

  const { totalDone, totalAll, focusSubject } = useMemo(() => {
    if (!dersler.length) return { totalDone: 0, totalAll: 0, focusSubject: null };
    const done = dersler.reduce((s, d) => s + d.done, 0);
    const all = dersler.reduce((s, d) => s + d.total, 0);
    const focus = [...dersler].sort((a, b) => a.pct - b.pct)[0];
    return { totalDone: done, totalAll: all, focusSubject: focus };
  }, [dersler]);

  return { dersler, totalDone, totalAll, focusSubject, refresh: loadProgress };
}
