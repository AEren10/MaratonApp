import { useCallback, useMemo, useState } from "react";

import { useC } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { useAppDispatch } from "../store/hooks";
import { getTYTSubjects, getLGSSubjects } from "../domain/trial/trialTypes";
import { wrongPenaltyForTrialType } from "../domain/trial/trialModel";
import { trialEntrySchema } from "../validations/auth";
import { saveTrialOffline } from "../lib/offlineQueue";
import { addTrial } from "../store/slices/trialSlice";
import { track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import * as H from "../lib/haptics";

// Onboarding'in "Seviye Testi" adimi. Tam Deneme Girisi formunun (D/Y/B)
// hafiflestirilmis hali: kullanici dogrudan NET yazar. Bu net, ders basina
// tek dogru sayisi olarak (yanlis=0) gercek deneme kaydina donusturulur —
// route/threshold hesaplari boylece ayni veri yolunu kullanir, tekrar icat
// edilmez (bkz. src/domain/trial/trialEntryModel.js, trialEntrySubmit.js).
export function useLevelTestForm() {
  const C = useC();
  const { user } = useAuth();
  const { examType, targetNet } = useExam();
  const dispatch = useAppDispatch();
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  const trialTypeCode = examType === "lgs" ? "LGS" : "TYT";
  const subjects = useMemo(
    () => (examType === "lgs" ? getLGSSubjects(C) : getTYTSubjects(C)),
    [C, examType],
  );
  const wrongPenalty = useMemo(() => wrongPenaltyForTrialType(trialTypeCode), [trialTypeCode]);

  const setSubjectNet = useCallback((key, text) => {
    const clean = text.replace(",", ".").replace(/[^0-9.]/g, "");
    setValues((prev) => ({ ...prev, [key]: clean }));
  }, []);

  const perSubject = useMemo(() => subjects.map((subject) => {
    const raw = parseFloat(values[subject.key]);
    const net = Number.isFinite(raw) ? Math.max(0, Math.min(subject.max, raw)) : null;
    return { subject, net };
  }), [subjects, values]);

  const hasAnyEntry = perSubject.some((row) => row.net != null);

  const totalNet = useMemo(
    () => perSubject.reduce((sum, row) => sum + (row.net || 0), 0),
    [perSubject],
  );

  const gapMonths = useCallback((examDaysLeft) => {
    if (!examDaysLeft) return null;
    return Math.max(1, Math.round(examDaysLeft / 30));
  }, []);

  const submit = useCallback(async (onDone) => {
    if (!hasAnyEntry) return;
    if (!user?.id || user.id === "dev") { H.warn(); return; }
    setSaving(true);
    const subjectsArr = perSubject.map(({ subject, net }) => {
      const correct = Math.round(net || 0);
      return {
        subject: subject.key,
        correct_count: correct,
        wrong_count: 0,
        empty_count: Math.max(0, subject.max - correct),
      };
    });
    const netVal = Math.round(totalNet * 100) / 100;
    const trialDateISO = new Date().toISOString().slice(0, 10);
    const trialName = `${trialTypeCode === "LGS" ? "LGS" : "TYT"} · Seviye Testi`;
    const parsed = trialEntrySchema.safeParse({
      name: trialName,
      trial_date: trialDateISO,
      exam_type: trialTypeCode,
      total_net: netVal,
      subjects: subjectsArr,
    });
    if (!parsed.success) { setSaving(false); H.warn(); return; }
    try {
      const result = await saveTrialOffline({
        user_id: user.id,
        name: trialName,
        trial_date: trialDateISO,
        exam_type: trialTypeCode,
        field: null,
        branch_subject: null,
        total_net: netVal,
        mood: null,
        publisher_id: null,
        difficulty_level: "standard",
      }, subjectsArr);
      dispatch(addTrial(result.data || { id: Date.now().toString(), trial_date: trialDateISO, total_net: netVal, exam_type: trialTypeCode }));
      track(EVENTS.TRIAL_ENTERED, { net: netVal, trialType: trialTypeCode, source: "onboarding_level_test" });
      H.success();
    } catch {
      H.warn();
    } finally {
      setSaving(false);
      onDone?.();
    }
  }, [dispatch, hasAnyEntry, perSubject, totalNet, trialTypeCode, user]);

  return {
    subjects,
    values,
    setSubjectNet,
    perSubject,
    hasAnyEntry,
    totalNet,
    targetNet,
    gapMonths,
    saving,
    submit,
  };
}
