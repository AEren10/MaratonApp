import { useEffect, useRef } from "react";

import { useExam } from "../contexts/ExamContext";
import { peekPendingPreview } from "../lib/routePreviewStore";
import { previewExamDate } from "../domain/onboarding/routePreview";

// Kayit oncesi onizlemede secilen sinav, kayittan hemen sonra profile yazilir:
// kullanici "Sinav secimi"ni ikinci kez gormez, kurulum Hedef'ten baslar.
// Donus: kurulumun hangi ekrandan baslayacagi (null = normal akis).
export function usePendingPreviewSetup() {
  const { examType, updateExamConfig } = useExam();
  const pending = !examType ? peekPendingPreview() : null;
  const applied = useRef(false);

  useEffect(() => {
    if (!pending || applied.current) return;
    applied.current = true;
    updateExamConfig(pending.examType, pending.field, previewExamDate(pending.examYear)).catch(() => {});
  }, [pending, updateExamConfig]);

  return Boolean(pending);
}
