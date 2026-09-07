import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { AppState } from "react-native";

import {
  elapsedFrom,
  saveTimerSession,
  clearTimerSession,
  loadTimerSession,
  describeRecovery,
  markTimerSessionPendingSave,
} from "../../domain/study/timerSession";

import { useAlert } from "../../contexts/AlertContext";
import { SCREENS } from "../../constants/screens";
import {
  STUDY_TIMER_PHASE,
  buildStudyTimerModes,
  getFocusSecondsForSave,
  getPhaseLabel,
  getPhaseTargetSeconds,
} from "../../domain/study/studyTimerModel";
import { getSubjectByKey } from "../../themes/subjects";

export function useStudyTimerController(C) {
  const showAlert = useAlert();
  const navigation = useNavigation();
  const route = useRoute();
  const { subjectKey: routeSubjectKey, topicName } = route.params ?? {};
  const modes = useMemo(() => buildStudyTimerModes(C), [C]);
  const [selectedSubjectKey, setSelectedSubjectKey] = useState(routeSubjectKey || null);
  const [modeKey, setModeKey] = useState("FREE");
  const [phase, setPhase] = useState(STUDY_TIMER_PHASE.FOCUS);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [questions, setQuestions] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const interval = useRef(null);
  const phaseTimeout = useRef(null);

  // DUVAR SAATİ ÇAPASI.
  // Süre artık tick sayısıyla değil gerçek zamanla hesaplanıyor. Önceden
  // setInterval her saniyede elapsed+1 yapıyordu; JS zamanlayıcıları arka
  // planda kısıldığı için 45 dakika çalışan öğrenci 12 dakika kaydediyordu.
  const startedAtRef = useRef(null);   // en son başlat anı (ms), duraklıysa null
  const accumulatedRef = useRef(0);    // duraklamalardan önce biriken saniye
  const [recovery, setRecovery] = useState(null); // kurtarılabilir oturum
  const topic = topicName || "";
  const mode = useMemo(() => modes.find((item) => item.key === modeKey), [modeKey, modes]);
  const isPomodoro = modeKey !== "FREE";
  const hasSubject = !!selectedSubjectKey;
  const subject = selectedSubjectKey
    ? (getSubjectByKey(selectedSubjectKey) || { key: selectedSubjectKey, label: selectedSubjectKey, color: C.amber, icon: "bookOpen" })
    : { key: null, label: "Ders Seçilmedi", color: C.muted, icon: "clock" };
  const phaseTargetSec = useMemo(
    () => getPhaseTargetSeconds({ mode, modeKey, phase }),
    [mode, modeKey, phase],
  );
  const phaseColor = phase === STUDY_TIMER_PHASE.FOCUS
    ? mode.color
    : phase === STUDY_TIMER_PHASE.BREAK ? C.green : C.teal;
  const phaseLabel = useMemo(
    () => getPhaseLabel({ cycleIndex, mode, phase }),
    [cycleIndex, mode, phase],
  );

  const resetTimer = useCallback((nextModeKey) => {
    setModeKey(nextModeKey);
    setPhase(STUDY_TIMER_PHASE.FOCUS);
    setElapsed(0);
    setCycleIndex(0);
    setRunning(false);
    setTotalFocusSeconds(0);
  }, []);

  const advancePhase = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (!isPomodoro) {
      setRunning(false);
      return;
    }
    if (phase === STUDY_TIMER_PHASE.FOCUS) {
      setTotalFocusSeconds((seconds) => seconds + phaseTargetSec);
      const nextCycle = cycleIndex + 1;
      if (nextCycle >= mode.cycles) {
        setPhase(STUDY_TIMER_PHASE.LONG_BREAK);
        setCycleIndex(0);
      } else {
        setPhase(STUDY_TIMER_PHASE.BREAK);
        setCycleIndex(nextCycle);
      }
    } else {
      setPhase(STUDY_TIMER_PHASE.FOCUS);
    }
    setElapsed(0);
  }, [cycleIndex, isPomodoro, mode, phase, phaseTargetSec]);

  useEffect(() => {
    if (running) {
      // Tick yalnızca EKRANI TAZELEMEK için; değer duvar saatinden geliyor.
      interval.current = setInterval(() => {
        const next = elapsedFrom(accumulatedRef.current, startedAtRef.current);
        if (isPomodoro && next >= phaseTargetSec) {
          setElapsed(phaseTargetSec);
          phaseTimeout.current = setTimeout(advancePhase, 0);
          return;
        }
        setElapsed(next);
      }, 1000);
    } else if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
      clearTimeout(phaseTimeout.current);
    };
  }, [advancePhase, isPomodoro, phaseTargetSec, running]);

  useEffect(() => {
    if (!isPomodoro) setTotalFocusSeconds(elapsed);
  }, [elapsed, isPomodoro]);

  // KALICILIK — uygulama öldürülse bile oturum kaybolmasın.
  //
  // Snapshot her tick'te değil, durum değiştikçe yazılıyor (başlat/duraklat,
  // soru sayacı, faz). Tick'te yazmak diski gereksiz yorar; duvar saati
  // zaten aradaki süreyi kendisi hesaplıyor.
  useEffect(() => {
    if (!running && accumulatedRef.current === 0) return;
    saveTimerSession({
      startedAt: startedAtRef.current,
      accumulated: accumulatedRef.current,
      modeKey,
      phase,
      cycleIndex,
      subjectKey: selectedSubjectKey,
      topic,
      questions,
      correctCount,
      totalFocusSeconds,
    });
  }, [running, modeKey, phase, cycleIndex, selectedSubjectKey, topic, questions, correctCount, totalFocusSeconds]);

  // Uygulama arka plandan dönünce süreyi duvar saatinden TAZELE.
  // Bu olmadan ekran, arka planda duran tick'in kaldığı yerden devam ediyormuş
  // gibi yanlış süre gösterirdi.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active" && startedAtRef.current) {
        setElapsed(elapsedFrom(accumulatedRef.current, startedAtRef.current));
      }
    });
    return () => sub?.remove?.();
  }, []);

  // Açılışta yarım kalan oturumu sor.
  useEffect(() => {
    let cancelled = false;
    loadTimerSession().then((found) => {
      if (cancelled || !found?.recoverable) return;
      setRecovery(found.session);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const resumeRecovered = useCallback(() => {
    const r = recovery;
    if (!r) return;
    accumulatedRef.current = r.recoveredElapsed || 0;
    startedAtRef.current = null; // duraklatılmış olarak geri gel, kullanıcı başlatsın
    setElapsed(Math.round(accumulatedRef.current));
    setModeKey(r.modeKey || "FREE");
    setPhase(r.phase || STUDY_TIMER_PHASE.FOCUS);
    setCycleIndex(r.cycleIndex || 0);
    if (r.subjectKey) setSelectedSubjectKey(r.subjectKey);
    setQuestions(r.questions || 0);
    setCorrectCount(r.correctCount || 0);
    setTotalFocusSeconds(r.totalFocusSeconds || 0);
    setRunning(false);
    setRecovery(null);
  }, [recovery]);

  const discardRecovered = useCallback(() => {
    clearTimerSession();
    setRecovery(null);
  }, []);

  const toggle = useCallback(() => {
    setRunning((previous) => {
      const next = !previous;
      if (next) {
        // Başlat: şu andan itibaren say.
        startedAtRef.current = Date.now();
      } else {
        // Duraklat: o ana kadarki süreyi biriktir, çapayı bırak.
        accumulatedRef.current = elapsedFrom(accumulatedRef.current, startedAtRef.current);
        startedAtRef.current = null;
        setElapsed(Math.round(accumulatedRef.current));
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const handleModeChange = useCallback((key) => {
    if (elapsed > 30) {
      showAlert("Modu değiştir", "Çalışman sıfırlanacak. Emin misin?", [
        { text: "İptal", style: "cancel" },
        { text: "Değiştir", onPress: () => resetTimer(key) },
      ]);
      return;
    }
    resetTimer(key);
  }, [elapsed, resetTimer, showAlert]);

  const addQuestion = useCallback(() => {
    setQuestions((previous) => previous + 1);
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const removeQuestion = useCallback(() => {
    setQuestions((previous) => {
      const next = Math.max(0, previous - 1);
      setCorrectCount((count) => Math.min(count, next));
      return next;
    });
  }, []);

  const addCorrect = useCallback(() => {
    setCorrectCount((count) => Math.min(count + 1, questions));
    Haptics.selectionAsync().catch(() => {});
  }, [questions]);

  const removeCorrect = useCallback(() => {
    setCorrectCount((count) => Math.max(0, count - 1));
  }, []);

  const finish = useCallback(() => {
    setRunning(false);
    const focusForSave = getFocusSecondsForSave({ elapsed, isPomodoro, phase, totalFocusSeconds });
    if (focusForSave < 30) {
      showAlert("Çok kısa", "30 saniyeden az çalışma kaydedilmez.", [
        { text: "Çık", onPress: () => navigation.goBack() },
        { text: "Devam", style: "cancel" },
      ]);
      return;
    }

    const savePayload = {
      duration: Math.max(1, Math.round(focusForSave / 60)),
      questions,
      correctCount,
      subjectKey: selectedSubjectKey || undefined,
      topicName: topic || undefined,
    };

    // Anlık görüntüyü SİLMİYORUZ; "kaydedilmeyi bekliyor" diye işaretliyoruz.
    // Eskiden burada clearTimerSession() vardı ve kullanıcı kayıt ekranından
    // geri çıkarsa bütün oturum kalıcı olarak kayboluyordu.
    markTimerSessionPendingSave(savePayload);

    navigation.replace(SCREENS.STUDY_SAVE, savePayload);
  }, [
    correctCount,
    elapsed,
    isPomodoro,
    navigation,
    phase,
    questions,
    selectedSubjectKey,
    showAlert,
    topic,
    totalFocusSeconds,
  ]);

  const exit = useCallback(() => {
    if (elapsed >= 30 || totalFocusSeconds >= 30) {
      showAlert("Çıkış", "Çalışmayı kaydetmeden çıkmak istiyor musun?", [
        { text: "İptal", style: "cancel" },
        { text: "Çıkış", style: "destructive", onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  }, [elapsed, navigation, showAlert, totalFocusSeconds]);

  const openHistory = useCallback(() => {
    navigation.navigate(SCREENS.STUDY_HISTORY);
  }, [navigation]);

  return {
    // Yarım kalan oturum kurtarma — ekran bunu bir soru olarak gösterir.
    recovery,
    recoveryLabel: recovery ? describeRecovery(recovery) : null,
    resumeRecovered,
    discardRecovered,

    addCorrect,
    addQuestion,
    correctCount,
    cycleIndex,
    elapsed,
    exit,
    finish,
    handleModeChange,
    hasSubject,
    isPomodoro,
    mode,
    modeKey,
    modes,
    openHistory,
    pct: Math.min(elapsed / phaseTargetSec, 1),
    phaseColor,
    phaseLabel,
    phaseTargetSec,
    questions,
    removeCorrect,
    removeQuestion,
    running,
    selectedSubjectKey,
    setSelectedSubjectKey,
    skipPhase: advancePhase,
    subject,
    toggle,
    topic,
    totalFocusSeconds,
  };
}
