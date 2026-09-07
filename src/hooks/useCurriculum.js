import { useState, useEffect } from "react";
import { useExam } from "../contexts/ExamContext";
import { fetchSubjects } from "../supabase/curriculum";
import { getSubjectsForExam } from "../data/curriculum";

export function useCurriculum() {
  const { examType, field } = useExam();
  // examType HENÜZ YÜKLENMEMİŞKEN "tyt" varsaymak, LGS kullanıcısına bir kare
  // TYT derslerini gösteriyordu (Dersler, Çalışma Ekle, Durak Ekle, Yanlış
  // Ekle ekranlarında). Bilinmiyorsa boş dön — çağıran taraf loading gösterir.
  const [subjects, setSubjects] = useState(() => (examType ? getSubjectsForExam(examType, field) : []));
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

  const isLGS = examType === "lgs";

  const tytSubjects = isLGS
    ? subjects.filter((s) => s.group === "sozel")
    : subjects.filter((s) => s.exam === "tyt");
  const aytSubjects = isLGS
    ? subjects.filter((s) => s.group === "sayisal")
    : subjects.filter((s) => s.exam === "ayt" || s.exam === "ydt");

  return {
    subjects,
    tytSubjects,
    aytSubjects,
    isLGS,
    group1Label: isLGS ? "Sözel" : "TYT",
    group2Label: isLGS ? "Sayısal" : "AYT",
    loading,
  };
}
