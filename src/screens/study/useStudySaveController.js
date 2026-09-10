import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
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
import { syncStreakAfterStudy } from "../../lib/streakSync";
import { clearTimerSession } from "../../domain/study/timerSession";
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import { syncChallengeProgress } from "../../lib/challengeSync";
import { todayTR } from "../../lib/dateUtils";
import { completeStudyPlanContext } from "../../lib/studyPlanCompletion";
import { studyLogSchema } from "../../validations/auth";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

export function useStudySaveController() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { tytSubjects, aytSubjects, group1Label, group2Label } = useCurriculum();
  const { reward, xpToast, dismissXP } = useGamification();
  const route = useRoute();

  const {
    duration = 0,
    questions: initQuestions = 0,
    correctCount: initCorrect = 0,
    subjectKey: preSubjectKey,
    topicName: preTopic,
    planTaskKey,
    planSubjectKey,
    planTopicName,
    routeStopId,
    routeStopVersion,
    routeSubjectKey,
    routeTopicName,
  } = route.params ?? {};

  const [examTier, setExamTier] = useState(() => {
    if (preSubjectKey) {
      const isAyt = aytSubjects.some((s) => s.key === preSubjectKey);
      return isAyt ? "AYT" : "TYT";
    }
    return "TYT";
  });
  const [subjectKey, setSubjectKey] = useState(preSubjectKey || null);
  const [topic, setTopic] = useState(preTopic || "");
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [questionCount, setQC] = useState(initQuestions > 0 ? String(initQuestions) : "");
  const [correctCount, setCC] = useState(initCorrect > 0 ? String(initCorrect) : "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  // Kayıt tamamlandı mı — geri çıkış uyarısı bunun için.
  const savedRef = useRef(false);

  // GERİ ÇIKIŞ KORUMASI
  //
  // Bu ekrana gelindiğinde kronometre çoktan durmuş ve süre/soru sayıları
  // yalnızca burada duruyor. Android geri tuşu ya da iOS kaydırması
  // uyarısız çalıştığı için 50 dakikalık oturum sessizce kayboluyordu.
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (savedRef.current) return;
      e.preventDefault();
      showAlert(
        "Çalışman kaydedilmedi",
        "Bu ekrandan çıkarsan bu oturum kaybolur. Emin misin?",
        [
          { text: "Kalayım", style: "cancel" },
          {
            text: "Çık ve sil",
            style: "destructive",
            onPress: () => {
              clearTimerSession();
              savedRef.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });
    return sub;
  }, [navigation, showAlert]);

  const { completeForm, markFormDirty } = useFormLifecycleAnalytics("study_log_measured", {
    duration,
    subjectKey,
  });

  const subjects = useMemo(() => {
    return examTier === "TYT" ? tytSubjects : aytSubjects;
  }, [examTier, tytSubjects, aytSubjects]);

  const currentSubject = useMemo(
    () => subjects.find((s) => s.key === subjectKey) || null,
    [subjects, subjectKey],
  );

  const canSave = !!subjectKey;

  const handleSwitchTier = useCallback((tier) => {
    markFormDirty({ field: "tier", tier });
    setExamTier(tier);
    setSubjectKey(null);
    setTopic("");
  }, [markFormDirty]);

  const handleSelectSubject = useCallback((key) => {
    H.select();
    markFormDirty({ field: "subject", subjectKey: key });
    setSubjectKey(key);
    setTopic("");
  }, [markFormDirty]);

  const openTopicPicker = useCallback(() => {
    if (!currentSubject) { H.warn(); showAlert("Önce ders seç", "Konu listesi için ders seçmelisin."); return; }
    H.select();
    setTopicPickerOpen(true);
  }, [currentSubject, showAlert]);

  const save = useCallback(async () => {
    if (saving || !canSave) return;
    if (!user?.id || user.id === "dev") {
      H.warn();
      showAlert("Oturum bulunamadı", "Çalışmayı kaydetmek için tekrar giriş yapmalısın.");
      return;
    }

    const todayStr = todayTR();
    const qc = parseInt(questionCount, 10) || 0;
    const cc = parseInt(correctCount, 10) || 0;
    const topicVal = topic.trim() || (currentSubject?.label || subjectKey);

    const notesVal = notes.trim() || undefined;
    const parsed = studyLogSchema.safeParse({
      subject: subjectKey,
      topic: topicVal,
      questionCount: qc,
      correctCount: cc,
      duration,
      notes: notesVal,
    });
    if (!parsed.success) {
      H.warn();
      showAlert("Hata", parsed.error.issues[0]?.message || "Geçersiz değer");
      return;
    }

    dispatch(addLog({
      id: Date.now().toString(),
      subject: subjectKey,
      topic: topicVal,
      questionCount: qc,
      correctCount: cc,
      duration,
      notes: notesVal,
      study_date: todayStr,
    }));

    setSaving(true);
    // saveStudyLogOffline artık depoya yazamazsa FIRLATIYOR (kuyruk sertleştirmesi).
    // Yakalanmazsa kullanıcı hiçbir geri bildirim görmeden bu ekranda kalırdı.
    let result;
    try {
      result = await saveStudyLogOffline({
        user_id: user.id,
        subject: subjectKey,
        topic: topicVal,
        question_count: qc,
        correct_count: cc,
        duration_minutes: duration,
        study_date: todayStr,
        ...(notesVal ? { notes: notesVal } : {}),
      });
    } catch (e) {
      setSaving(false);
      H.error();
      captureError(e, { context: "study_save_persist" });
      showAlert(
        "Kaydedilemedi",
        "Cihazda yer kalmamış olabilir. Biraz yer açıp tekrar dene — çalışman bu ekranda duruyor.",
      );
      return;
    }

    if (result.saved) {
      try {
        const streakResult = await syncStreakAfterStudy(user.id, { studyDate: todayStr });
        const { newStreak, usedFreeze, freezeCount } = streakResult;
        trackStreakTransition(streakResult.local);
        dispatch(setStreak(newStreak));
        dispatch(setFreezeCount(freezeCount));
        if (usedFreeze) {
          showAlert("🛡 Joker kullanıldı", "Bir gün atlamıştın ama jokerin streak'ini korudu!");
        }
      } catch (e) { captureError(e, { context: "streak_update_studySave" }); }
      syncChallengeProgress(user.id, { questions: qc, minutes: duration });
    } else if (result.queued) {
      const msg = result.error?.message || "";
      const isNetwork = msg.includes("network") || msg.includes("fetch");
      showAlert(
        isNetwork ? "Çevrimdışı" : "Kayıt beklemede",
        isNetwork
          ? "İnternet yok, kayıt bağlantı geldiğinde otomatik gönderilecek."
          : "Kayıt sıraya alındı, kısa süre içinde gönderilecek.",
      );
    }
    const planCompletion = await completeStudyPlanContext({
      userId: user.id,
      studyDate: todayStr,
      subjectKey,
      topic: topicVal,
      planSubjectKey,
      planTopicName,
      planTaskKey,
      routeStopId,
      routeStopVersion,
      routeSubjectKey,
      routeTopicName,
    });
    if (planCompletion.planCompleted) reward("plan_task_done");
    if (planCompletion.planError || planCompletion.routeError) {
      captureError(planCompletion.planError || planCompletion.routeError, {
        context: "study_save_plan_completion",
      });
    }
    setSaving(false);

    completeForm({ minutes: duration, questions: qc, subjectKey });
    track(EVENTS.STUDY_COMPLETED, { minutes: duration, questions: qc });
    reward("study_log", {
      minutes: duration,
      statUpdates: [
        { type: "increment", key: "totalQuestions", value: qc },
        { type: "increment", key: "totalMinutes", value: duration },
      ],
    });
    if (qc > 0) reward("question_solved", { count: qc });

    // Oturum artık güvende (kaydedildi ya da kuyrukta) — kurtarma anlık
    // görüntüsü ancak BURADA silinir. Kronometre ekranında silinmesi,
    // bu ekrandan geri çıkan kullanıcının oturumunu yok ediyordu.
    clearTimerSession();
    savedRef.current = true;

    H.success();
    navigation.replace(SCREENS.STUDY_SUMMARY, {
      subjectLabel: currentSubject?.label || currentSubject?.name || subjectKey,
      subjectColor: currentSubject?.color || C.accent,
      subjectIcon: currentSubject?.icon || "bookOpen",
      topic: topicVal,
      duration,
      questions: qc,
      correctCount: cc,
    });
  }, [saving, canSave, subjectKey, topic, notes, duration, questionCount, correctCount, user, dispatch, reward, navigation, currentSubject, C, showAlert, completeForm, planSubjectKey, planTopicName, planTaskKey, routeStopId, routeStopVersion, routeSubjectKey, routeTopicName]);

  return {
    C,
    duration,
    examTier,
    subjectKey,
    topic,
    topicPickerOpen,
    setTopicPickerOpen,
    questionCount,
    correctCount,
    notes,
    saving,
    canSave,
    currentSubject,
    subjects,
    group1Label,
    group2Label,
    preSubjectKey,
    handleSwitchTier,
    handleSelectSubject,
    openTopicPicker,
    setTopic: (t) => { markFormDirty({ field: "topic" }); setTopic(t); },
    setQuestionCount: (v) => { markFormDirty({ field: "question_count" }); setQC(v); },
    setCorrectCount: (v) => { markFormDirty({ field: "correct_count" }); setCC(v); },
    setNotes: (v) => { markFormDirty({ field: "notes" }); setNotes(v); },
    save,
    xpToast,
    dismissXP,
    goBack: () => navigation.goBack(),
  };
}
