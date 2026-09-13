import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useStudyLogMutations } from "../../hooks/useStudyLogMutations";
import { getStudyLogs } from "../../supabase/studyLogs";
import { getSubjectByKey } from "../../themes/subjects";
import { studyLogSchema } from "../../validations/auth";
import { editWeekImpact, minutesDative, weekStartKey } from "../../domain/study/studyHistoryModel";
import { useStudyRecordForm } from "./useStudyRecordForm";
import * as H from "../../lib/haptics";

// "Kaydı Düzenle" (MOD 3). Sunucu otoritedir: degisiklik yalniz sunucuya
// yazilinca kabul edilir, sonra gunluk Redux dilimi sunucudan tazelenir.
export function useEditStudyLogController() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const log = params?.log || null;
  const { user } = useAuth();
  const showAlert = useAlert();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const { update, confirmDelete } = useStudyLogMutations();
  const [saving, setSaving] = useState(false);
  const [weekLogs, setWeekLogs] = useState(null);

  const inAyt = aytSubjects.some((s) => s.key === log?.subject);
  const form = useStudyRecordForm({
    subjectKey: log?.subject,
    subjectLabel: getSubjectByKey(log?.subject)?.label || log?.subject,
    tier: inAyt ? "AYT" : "TYT",
    topic: log?.topic,
    studyDate: log?.study_date,
    questions: log?.questionCount ?? log?.question_count,
    minutes: log?.duration ?? log?.duration_minutes,
  });

  useEffect(() => {
    if (!user?.id || user.id === "dev") return undefined;
    let cancelled = false;
    getStudyLogs(user.id, { from: weekStartKey() })
      .then((rows) => { if (!cancelled) setWeekLogs(rows || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  const impact = useMemo(() => {
    if (!weekLogs || !log) return null;
    const next = { subject: form.subjectKey, minutes: form.values.dur, studyDate: form.studyDate };
    const result = editWeekImpact(weekLogs, log.id, next);
    if (!result) return null;
    const label = [...tytSubjects, ...aytSubjects].find((s) => s.key === form.subjectKey)?.label
      || getSubjectByKey(form.subjectKey)?.label || form.subjectKey;
    const verb = result.direction === "down" ? "iner" : "çıkar";
    return `${label} bu hafta ${minutesDative(result.after)} ${verb}. Rota ve konu analizi yeniden hesaplanır.`;
  }, [weekLogs, log, form.subjectKey, form.values.dur, form.studyDate, tytSubjects, aytSubjects]);

  const save = useCallback(async () => {
    if (!log?.id || saving || !form.canSave) return;
    const { qc, dur, topicVal } = form.values;
    const correct = Math.min(log.correctCount ?? log.correct_count ?? 0, qc);
    const parsed = studyLogSchema.safeParse({ subject: form.subjectKey, topic: topicVal, questionCount: qc, correctCount: correct, duration: dur });
    if (!parsed.success) {
      H.warn();
      showAlert("Hata", parsed.error.issues[0]?.message || "Geçersiz değer");
      return;
    }
    setSaving(true);
    try {
      const updated = await update(log.id, {
        subject: form.subjectKey, topic: topicVal, question_count: qc,
        correct_count: correct, duration_minutes: dur, study_date: form.studyDate,
      });
      if (!updated) throw new Error("study_log_not_found");
      H.success();
      navigation.goBack();
    } catch (_) {
      H.error();
      showAlert("Kaydedilemedi", "Değişiklik kaydedilemedi. Bağlantını kontrol et.");
    } finally {
      setSaving(false);
    }
  }, [log, saving, form, update, showAlert, navigation]);

  const remove = useCallback(() => {
    confirmDelete(log, { onDeleted: () => navigation.goBack() });
  }, [confirmDelete, log, navigation]);

  return {
    log,
    form,
    groups: [
      { tier: "TYT", label: group1Label, subjects: tytSubjects },
      { tier: "AYT", label: group2Label, subjects: aytSubjects },
    ],
    impact,
    saving,
    save,
    remove,
    goBack: () => navigation.goBack(),
  };
}
