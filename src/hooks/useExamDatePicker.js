import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useExam } from "../contexts/ExamContext";
import { useStudyRoute } from "./useStudyRoute";
import { summarizeExamDateChange, examDateCaption } from "../domain/exam/examDateChange";
import * as H from "../lib/haptics";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function useExamDatePicker() {
  const navigation = useNavigation();
  const { examType, field, examDate, updateExamConfig } = useExam();
  // persist:false — bu ekran rotayi yeniden yazmiyor, yalniz kalan is
  // sayisini okuyup haftalik yuku gosteriyor.
  const { totals } = useStudyRoute({ persist: false });

  const today = useMemo(() => new Date(), []);
  const [draft, setDraft] = useState(() => examDate || null);
  const [cursor, setCursor] = useState(() => {
    const base = examDate || today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [saving, setSaving] = useState(false);

  const selectDay = useCallback((day) => {
    H.tap();
    setDraft(new Date(cursor.year, cursor.month, day));
  }, [cursor]);

  const shiftMonth = useCallback((delta) => {
    H.select();
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  const save = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    try {
      // Ayni sinav tipi/alan ile yalniz tarih guncelleniyor; tip degismedigi
      // icin updateExamConfig rotayi temizlemiyor.
      await updateExamConfig(examType, field, draft);
      H.success();
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }, [draft, examType, field, updateExamConfig, navigation]);

  const cancel = useCallback(() => navigation.goBack(), [navigation]);

  const summary = useMemo(
    () => summarizeExamDateChange(draft, totals?.pending, today),
    [draft, totals?.pending, today],
  );

  return {
    draft,
    cursor,
    monthLabel: `${MONTHS[cursor.month]} ${cursor.year}`,
    selectedDay:
      draft && draft.getFullYear() === cursor.year && draft.getMonth() === cursor.month
        ? draft.getDate()
        : null,
    heroDay: draft ? draft.getDate() : null,
    heroMonth: draft ? `${MONTHS[draft.getMonth()]} ${draft.getFullYear()}` : null,
    caption: examDateCaption(draft, today),
    summary,
    minDate: today,
    changed: Boolean(draft && (!examDate || draft.getTime() !== examDate.getTime())),
    selectDay,
    shiftMonth,
    save,
    cancel,
    saving,
  };
}
