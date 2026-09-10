import { useEffect, useRef } from "react";
import { useExam } from "../contexts/ExamContext";

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
