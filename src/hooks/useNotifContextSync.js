import { useEffect, useMemo } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { aytTargetShare } from "../domain/route/examPhase";
import { dateKey } from "../lib/dateUtils";
import { updateReminderContent } from "../lib/notifications";

// Bildirim planinin sinav ve deneme girdileri: sinav donum noktalari
// (150/100/60/30/7 gun), ay donumu karsilastirmasi ve deneme hatirlatmasi
// bunlara bakar. Degismedikce yeniden kurulum olmaz (updateReminderContent).
export function useNotifContextSync(trials) {
  const { user } = useAuth();
  const { examDate, examType } = useExam();
  const uid = user?.id && user.id !== "dev" ? user.id : null;
  const list = Array.isArray(trials) ? trials : [];
  const lastDay = useMemo(
    () => list.reduce((max, t) => (t?.date && String(t.date).slice(0, 10) > max ? String(t.date).slice(0, 10) : max), ""),
    [list],
  );
  const examKey = examDate ? dateKey(new Date(examDate)) : null;
  const ayt = aytTargetShare({ examType, daysLeft: 200 }) != null;

  useEffect(() => {
    if (!uid) return;
    updateReminderContent({
      exam: examKey ? { date: examKey, ayt } : null,
      trials: { count: list.length, lastDay: lastDay || null },
    }, uid);
  }, [uid, examKey, ayt, list.length, lastDay]);
}
