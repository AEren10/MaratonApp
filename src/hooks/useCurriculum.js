import { useState, useEffect } from "react";
import { useExam } from "../contexts/ExamContext";
import { fetchSubjects } from "../supabase/curriculum";
import { getSubjectsForExam } from "../data/curriculum";

export function useCurriculum() {
  const { examType, field } = useExam();
  const [subjects, setSubjects] = useState(() => getSubjectsForExam(examType || "tyt", field));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examType) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchSubjects(examType, field)
      .then((data) => { if (!cancelled) setSubjects(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [examType, field]);

  const tytSubjects = subjects.filter((s) => s.exam === "tyt");
  const aytSubjects = subjects.filter((s) => s.exam === "ayt" || s.exam === "ydt");

  return { subjects, tytSubjects, aytSubjects, loading };
}
