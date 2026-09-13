import { useCallback, useMemo, useState } from "react";

import { todayTR } from "../../lib/dateUtils";

// Elle giris / duzenleme formunun yerel durumu. Sayilar metin olarak tutulur.
export function useStudyRecordForm(initial = {}, onDirty) {
  const [subjectKey, setSubjectKey] = useState(initial.subjectKey || null);
  const [tier, setTier] = useState(initial.tier || "TYT");
  const [topic, setTopicState] = useState(initial.topic || "");
  const [studyDate, setDate] = useState(initial.studyDate || todayTR());
  const [questions, setQ] = useState(initial.questions ? String(initial.questions) : "");
  const [minutes, setM] = useState(initial.minutes ? String(initial.minutes) : "");

  const dirty = useCallback((field, extra) => onDirty?.({ field, ...extra }), [onDirty]);

  const pickSubject = useCallback((key, nextTier) => {
    dirty("subject", { subjectKey: key });
    if (nextTier) setTier(nextTier);
    setSubjectKey((prev) => {
      if (prev !== key) setTopicState("");
      return key;
    });
  }, [dirty]);

  const values = useMemo(() => {
    const qc = parseInt(questions, 10) || 0;
    const dur = parseInt(minutes, 10) || 0;
    return { qc, dur, topicVal: topic.trim() };
  }, [questions, minutes, topic]);

  return {
    subjectKey,
    tier,
    topic,
    studyDate,
    questions,
    minutes,
    values,
    subjectLabel: initial.subjectLabel,
    pickSubject,
    setTopic: (t) => { dirty("topic"); setTopicState(t); },
    setStudyDate: (d) => { dirty("date"); setDate(d); },
    setQuestions: (v) => { dirty("question_count"); setQ(v); },
    setMinutes: (v) => { dirty("duration"); setM(v); },
    canSave: !!subjectKey && !!topic.trim() && values.dur >= 1 && values.dur <= 720,
  };
}
