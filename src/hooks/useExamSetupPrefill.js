import { useEffect, useRef } from "react";
import { useExam } from "../contexts/ExamContext";
import { loadPendingPreview } from "../lib/routePreviewStore";

// KAYITLI KURULUM DEGERLERINI FORMA GERI DOLDURUR.
//
// Onceden ExamSetupScreen useExam'den yalnizca updateExamConfig aliyordu ve uc
// state bos basliyordu. Kurulumu GoalSetup'ta birakip donen kullanici BOS bir
// form goruyordu — veri diskte duruyor olmasina ragmen bastan doldurmak
// zorundaydi.
//
// ExamContext acilista "yukleniyor" durumunda oldugu icin degerler sonradan
// geliyor; bu yuzden TEK KEZ tohumluyoruz (seeded ref) ve kullanicinin
// secimini asla ezmiyoruz.
export function useExamSetupPrefill({ options, months, setCategory, setSelectedId, setExamDate }) {
  const { examType, field, examDate } = useExam();
  const seeded = useRef(false);

  // Onizleme cevaplari (uygulama kayittan once kapandiysa diskten): sinav
  // hic secilmemisse formu onlarla doldur.
  useEffect(() => {
    if (examType) return undefined;
    let alive = true;
    loadPendingPreview().then((p) => {
      if (!alive || !p || seeded.current) return;
      seeded.current = true;
      if (p.examType === "lgs") setCategory("lgs");
      else {
        setCategory("yks");
        const match = options.find((o) => o.examType === p.examType && (o.field ?? null) === (p.field ?? null));
        if (match) setSelectedId(match.id);
      }
      const month = months.find((m) => m.includes(String(p.examYear)));
      if (month) setExamDate(month);
    });
    return () => { alive = false; };
  }, [examType, options, months, setCategory, setSelectedId, setExamDate]);

  useEffect(() => {
    if (seeded.current || !examType) return;
    seeded.current = true;

    if (examType === "lgs") {
      setCategory("lgs");
    } else {
      setCategory("yks");
      const match = options.find(
        (o) => o.examType === examType && (o.field ?? null) === (field ?? null),
      );
      if (match) setSelectedId(match.id);
    }

    if (examDate instanceof Date && !Number.isNaN(examDate.getTime())) {
      const year = String(examDate.getFullYear());
      const month = months.find((m) => m.includes(year));
      if (month) setExamDate(month);
    }
  }, [examType, field, examDate, options, months, setCategory, setSelectedId, setExamDate]);
}
