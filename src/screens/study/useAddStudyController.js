import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { track } from "../../lib/analytics";
import { EVENTS } from "../../constants/analytics";
import { useC } from "../../contexts/ThemeContext";
import { useAppDispatch } from "../../store/hooks";
import { addLog, setStreak, setFreezeCount } from "../../store/slices/studyLogSlice";
import { trackStreakTransition } from "../../lib/trackStreakTransition";
import { useGamification } from "../../hooks/useGamification";
import { captureError } from "../../lib/errorReporting";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useAuth } from "../../contexts/AuthContext";
import { useFormLifecycleAnalytics } from "../../hooks/useFormLifecycleAnalytics";
import { useUnsavedSession } from "../../hooks/useUnsavedSession";
import { syncStreakAfterStudy } from "../../lib/streakSync";
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import { syncChallengeProgress } from "../../lib/challengeSync";
import { todayTR } from "../../lib/dateUtils";
import { studyLogSchema } from "../../validations/auth";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import { useStudyRecordForm } from "./useStudyRecordForm";
import * as H from "../../lib/haptics";

// "Kayıt · Elle" (MOD 2). Kayit yolu eski AddStudyScreen'den tasindi:
// offline kuyruk, seri, meydan okuma, analitik ve XP ayni sirada.
export function useAddStudyController() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const { reward, xpToast, dismissXP } = useGamification();
  const unsaved = useUnsavedSession();
  const [saving, setSaving] = useState(false);
  const { completeForm, markFormDirty } = useFormLifecycleAnalytics("study_log_manual", {});
  const form = useStudyRecordForm({}, markFormDirty);
  const groups = [
    { tier: "TYT", label: group1Label, subjects: tytSubjects },
    { tier: "AYT", label: group2Label, subjects: aytSubjects },
  ];

  const save = useCallback(async () => {
    if (saving || !form.canSave) return;
    if (!user?.id || user.id === "dev") {
      H.warn();
      showAlert("Oturum bulunamadı", "Çalışmayı kaydetmek için tekrar giriş yapmalısın.");
      return;
    }
    const { qc, dur: duration, topicVal } = form.values;
    const { subjectKey, tier, studyDate } = form;
    const isToday = studyDate === todayTR();
    const current = [...tytSubjects, ...aytSubjects].find((s) => s.key === subjectKey);

    const parsed = studyLogSchema.safeParse({ subject: subjectKey, topic: topicVal, questionCount: qc, correctCount: 0, duration });
    if (!parsed.success) {
      H.warn();
      showAlert("Hata", parsed.error.issues[0]?.message || "Geçersiz değer");
      return;
    }

    // Gunluk Redux dilimi yalniz BUGUNUN kayitlarini tutar.
    if (isToday) {
      dispatch(addLog({
        id: Date.now().toString(), subject: subjectKey, topic: topicVal,
        questionCount: qc, correctCount: 0, duration, examTier: tier, study_date: studyDate,
      }));
    }

    setSaving(true);
    let result;
    try {
      result = await saveStudyLogOffline({
        user_id: user.id, subject: subjectKey, topic: topicVal,
        question_count: qc, correct_count: 0, duration_minutes: duration,
        study_date: studyDate, notes: null,
      });
    } catch (e) {
      setSaving(false);
      H.error();
      captureError(e, { context: "study_save_persist_manual" });
      showAlert("Kaydedilemedi", "Cihazda yer kalmamış olabilir. Biraz yer açıp tekrar dene — çalışman bu ekranda duruyor.");
      return;
    }

    if (result.saved) {
      // Geriye donuk kayit seriyi istemciden oynatmaz; seri yalniz bugunun kaydiyla dokunulur.
      if (isToday) {
        try {
          const streakResult = await syncStreakAfterStudy(user.id, { studyDate });
          const { newStreak, usedFreeze, freezeCount } = streakResult;
          trackStreakTransition(streakResult.local);
          dispatch(setStreak(newStreak));
          dispatch(setFreezeCount(freezeCount));
          if (usedFreeze) showAlert("🛡 Joker kullanıldı", "Bir gün atlamıştın ama jokerin streak'ini korudu!");
        } catch (e) { captureError(e, { context: "streak_update_addStudy" }); }
      }
      syncChallengeProgress(user.id, {
        questions: qc,
        minutes: duration,
        source: "study_log",
        sourceOperationId: result.clientOperationId || result.data?.client_operation_id,
      }).catch(() => {});
    }
    setSaving(false);

    completeForm({ minutes: duration, questions: qc, subjectKey });
    track(EVENTS.STUDY_COMPLETED, { minutes: duration, questions: qc });
    reward("study_log", { minutes: duration, statUpdates: [
      { type: "increment", key: "totalQuestions", value: qc },
      { type: "increment", key: "totalMinutes", value: duration },
    ]});
    if (qc > 0) reward("question_solved", { count: qc });

    const summaryParams = {
      subjectLabel: current?.label || subjectKey,
      subjectColor: current?.color || C.accent,
      subjectIcon: current?.icon || "bookOpen",
      topic: topicVal, duration, questions: qc,
    };
    if (result.queued) {
      unsaved.show({
        clientOperationId: result.clientOperationId, minutes: duration, questions: qc, topic: topicVal, studyDate,
        onContinue: () => navigation.replace(SCREENS.STUDY_SUMMARY, summaryParams),
      });
      return;
    }
    H.success();
    navigation.replace(SCREENS.STUDY_SUMMARY, summaryParams);
  }, [saving, form, user, tytSubjects, aytSubjects, dispatch, reward, navigation, showAlert, completeForm, C, unsaved]);

  return { form, groups, save, saving, unsaved, xpToast, dismissXP, goBack: () => navigation.goBack() };
}
