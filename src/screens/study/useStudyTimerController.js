import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as H from "../../lib/haptics";
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
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openInTab } from "../../navigation/tabJump";
import {
  STUDY_TIMER_PHASE,
  buildStudyTimerModes,
  getFocusSecondsForSave,
  getPhaseLabel,
  getPhaseTargetSeconds,
} from "../../domain/study/studyTimerModel";
import { getSubjectByKey } from "../../themes/subjects";
import { getJson, setJson } from "../../lib/storage/appStorage";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import { EVENTS } from "../../constants/analytics";
import { track } from "../../lib/analytics";

const DEFAULT_CUSTOM_CONFIG = { focus: 30, break: 5, cycles: 4 };

export function useStudyTimerController(C) {
  const showAlert = useAlert();
  const navigation = useNavigation();
  const route = useRoute();
  const {
    subjectKey: routeSubjectKey,
    topicName,
    planTaskKey,
    planSubjectKey,
    planTopicName,
    routeStopId,
    routeStopNumber,
    routeStopVersion,
    routeStopQuestions,
    routeSubjectKey: routeActionSubjectKey,
    routeTopicName: routeActionTopicName,
  } = route.params ?? {};
  const modes = useMemo(() => buildStudyTimerModes(C), [C]);
  const [selectedSubjectKey, setSelectedSubjectKey] = useState(routeSubjectKey || null);
  const [taskContext, setTaskContext] = useState({
    planTaskKey,
    planSubjectKey,
    planTopicName,
    routeStopId,
    routeStopNumber,
    routeStopVersion,
    routeStopQuestions,
    routeSubjectKey: routeActionSubjectKey,
    routeTopicName: routeActionTopicName,
  });
  const [modeKey, setModeKey] = useState(route.params?.modeKey || "POMODORO_25");
  const [customConfig, setCustomConfig] = useState(DEFAULT_CUSTOM_CONFIG);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [phase, setPhase] = useState(STUDY_TIMER_PHASE.FOCUS);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [questions, setQuestions] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const interval = useRef(null);
  const phaseTimeout = useRef(null);
  const studyStartedTrackedRef = useRef(false);

  useEffect(() => {
    let active = true;
    getJson(STORAGE_KEYS.CUSTOM_TIMER_CONFIG, DEFAULT_CUSTOM_CONFIG)
      .then((saved) => {
        if (active && saved?.focus) {
          setCustomConfig({
            focus: Math.min(180, Math.max(5, Math.round(Number(saved.focus)) || 30)),
            break: Math.min(60, Math.max(1, Math.round(Number(saved.break)) || 5)),
            cycles: Math.min(12, Math.max(1, Math.round(Number(saved.cycles)) || 4)),
          });
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // DUVAR SAATİ ÇAPASI.
  // Süre artık tick sayısıyla değil gerçek zamanla hesaplanıyor. Önceden
  // setInterval her saniyede elapsed+1 yapıyordu; JS zamanlayıcıları arka
  // planda kısıldığı için 45 dakika çalışan öğrenci 12 dakika kaydediyordu.
  const startedAtRef = useRef(null);   // en son başlat anı (ms), duraklıysa null
  const accumulatedRef = useRef(0);    // duraklamalardan önce biriken saniye
  const sessionStartedAtRef = useRef(null); // oturumun ILK başlat anı (ms) — saat aralığı gösterimi
  const [recovery, setRecovery] = useState(null); // kurtarılabilir oturum
  const topic = topicName || "";

  const mode = useMemo(() => {
    if (modeKey === "CUSTOM") {
      return {
        key: "CUSTOM",
        label: String(customConfig.focus),
        rest: `${customConfig.break} DK`,
        desc: `${customConfig.focus} dk odak · ${customConfig.break} dk mola`,
        color: C.accent,
        focus: customConfig.focus,
        break: customConfig.break,
        longBreak: Math.max(10, customConfig.break * 2),
        cycles: customConfig.cycles || 4,
      };
    }
    return modes.find((item) => item.key === modeKey) || modes[1];
  }, [modeKey, modes, customConfig, C.accent]);

  const openCustomModal = useCallback(() => {
    setCustomModalVisible(true);
  }, []);

  const closeCustomModal = useCallback(() => {
    setCustomModalVisible(false);
  }, []);

  const applyCustomMode = useCallback((config) => {
    const nextConfig = {
      focus: Math.min(180, Math.max(5, Math.round(Number(config.focus)) || 30)),
      break: Math.min(60, Math.max(1, Math.round(Number(config.break)) || 5)),
      cycles: Math.min(12, Math.max(1, Math.round(Number(config.cycles)) || 4)),
    };
    setCustomConfig(nextConfig);
    setJson(STORAGE_KEYS.CUSTOM_TIMER_CONFIG, nextConfig).catch(() => {});

    const doApply = () => {
      accumulatedRef.current = 0;
      startedAtRef.current = null;
      setModeKey("CUSTOM");
      setPhase(STUDY_TIMER_PHASE.FOCUS);
      setElapsed(0);
      setCycleIndex(0);
      setRunning(false);
      setTotalFocusSeconds(0);
      sessionStartedAtRef.current = null;
      studyStartedTrackedRef.current = false;
      setCustomModalVisible(false);
    };

    if (elapsed > 30) {
      showAlert("Özel modu uygula", "Çalışman sıfırlanacak. Emin misin?", [
        { text: "İptal", style: "cancel" },
        { text: "Uygula", onPress: doApply },
      ]);
    } else {
      doApply();
    }
  }, [elapsed, showAlert]);
  const isPomodoro = modeKey !== "FREE";
  const hasSubject = !!selectedSubjectKey;
  const stopLabel = Number.isFinite(Number(taskContext.routeStopNumber))
    ? `${Math.max(1, Math.round(Number(taskContext.routeStopNumber)))}. durak`
    : null;
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

  // Duvar saati: ekrandaki `elapsed` sifirlanip saat referanslari
  // sifirlanmazsa bir sonraki tick eski sureyi geri getiriyordu (mod
  // degisince eski sure kayda giriyor, pomodoro fazi her saniye donuyordu).
  const restartClock = useCallback((keepRunning) => {
    accumulatedRef.current = 0;
    startedAtRef.current = keepRunning ? Date.now() : null;
  }, []);

  const resetTimer = useCallback((nextModeKey) => {
    restartClock(false);
    setModeKey(nextModeKey);
    setPhase(STUDY_TIMER_PHASE.FOCUS);
    setElapsed(0);
    setCycleIndex(0);
    setRunning(false);
    setTotalFocusSeconds(0);
    sessionStartedAtRef.current = null;
    studyStartedTrackedRef.current = false;
  }, [restartClock]);

  const advancePhase = useCallback(() => {
    H.success();
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
    restartClock(true);
    setElapsed(0);
  }, [cycleIndex, isPomodoro, mode, phase, phaseTargetSec, restartClock]);

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
      sessionStartedAt: sessionStartedAtRef.current,
      accumulated: accumulatedRef.current,
      modeKey,
      phase,
      cycleIndex,
      subjectKey: selectedSubjectKey,
      topic,
      questions,
      correctCount,
      totalFocusSeconds,
      taskContext,
      customConfig: modeKey === "CUSTOM" ? customConfig : undefined,
    });
  }, [running, modeKey, phase, cycleIndex, selectedSubjectKey, topic, questions, correctCount, totalFocusSeconds, taskContext, customConfig]);

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
    if (r.customConfig) setCustomConfig(r.customConfig);
    setPhase(r.phase || STUDY_TIMER_PHASE.FOCUS);
    setCycleIndex(r.cycleIndex || 0);
    if (r.subjectKey) setSelectedSubjectKey(r.subjectKey);
    setQuestions(r.questions || 0);
    setCorrectCount(r.correctCount || 0);
    setTotalFocusSeconds(r.totalFocusSeconds || 0);
    if (r.taskContext) setTaskContext(r.taskContext);
    sessionStartedAtRef.current = r.sessionStartedAt || null;
    studyStartedTrackedRef.current = true;
    setRunning(false);
    setRecovery(null);
  }, [recovery]);

  // "Oturum Kurtarıldı" onayı: (düzeltilmiş) süreyle bitir akışının aynısı —
  // anlık görüntü "kaydedilmeyi bekliyor" işaretlenir, kayıt ekranına geçilir.
  const confirmRecovered = useCallback((minutes) => {
    const r = recovery;
    if (!r) return;
    const savePayload = {
      duration: Math.min(720, Math.max(1, Math.round(Number(minutes) || 0))),
      questions: r.questions || 0,
      correctCount: r.correctCount || 0,
      subjectKey: r.subjectKey || undefined,
      topicName: r.topic || undefined,
      ...(r.taskContext || {}),
      startedAtMs: r.sessionStartedAt || undefined,
      endedAtMs: r.startedAt ? Date.now() : r.savedAt,
    };
    markTimerSessionPendingSave(savePayload);
    setRecovery(null);
    navigation.replace(SCREENS.STUDY_SAVE, savePayload);
  }, [recovery, navigation]);

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
        if (!sessionStartedAtRef.current) sessionStartedAtRef.current = startedAtRef.current;
        if (!studyStartedTrackedRef.current) {
          studyStartedTrackedRef.current = true;
          track(EVENTS.STUDY_STARTED, {
            mode: modeKey === "FREE" ? "free" : modeKey === "CUSTOM" ? "custom" : "pomodoro",
            source: taskContext.routeStopId ? "route" : taskContext.planTaskKey ? "plan" : "direct",
            hasSubject: Boolean(selectedSubjectKey),
          });
        }
      } else {
        // Duraklat: o ana kadarki süreyi biriktir, çapayı bırak.
        accumulatedRef.current = elapsedFrom(accumulatedRef.current, startedAtRef.current);
        startedAtRef.current = null;
        setElapsed(Math.round(accumulatedRef.current));
      }
      return next;
    });
    H.tap();
  }, [modeKey, selectedSubjectKey, taskContext.planTaskKey, taskContext.routeStopId]);

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
    H.select();
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
    H.select();
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
      ...taskContext,
      startedAtMs: sessionStartedAtRef.current || undefined,
      endedAtMs: Date.now(),
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
    taskContext,
  ]);

  const exit = useCallback(() => {
    const doExit = () => {
      if (navigation.canGoBack()) navigation.goBack();
      else openInTab(navigation, TAB_KEYS.ROTA, SCREENS.HOME_ROOT);
    };
    if (elapsed >= 30 || totalFocusSeconds >= 30) {
      showAlert("Çıkış", "Çalışmayı kaydetmeden çıkmak istiyor musun?", [
        { text: "İptal", style: "cancel" },
        { text: "Çıkış", style: "destructive", onPress: doExit },
      ]);
    } else {
      doExit();
    }
  }, [elapsed, navigation, showAlert, totalFocusSeconds]);

  // Gecmis Profil sekmesinde; oraya gitmek kok yigindaki sayaci kapatir.
  // Eskiden calisan sayac uyarisiz kapaniyordu.
  const openHistory = useCallback(() => {
    const go = () => openInTab(navigation, TAB_KEYS.PROFIL, SCREENS.STUDY_HISTORY);
    if (elapsed >= 30 || totalFocusSeconds >= 30) {
      showAlert("Sayaç kapanacak", "Geçmişi açarsan bu çalışma kaydedilmeden sayaç kapanır.", [
        { text: "Vazgeç", style: "cancel" },
        { text: "Yine de aç", style: "destructive", onPress: go },
      ]);
    } else {
      go();
    }
  }, [elapsed, navigation, showAlert, totalFocusSeconds]);

  return {
    // Yarım kalan oturum kurtarma — ekran bunu bir soru olarak gösterir.
    recovery,
    recoveryLabel: recovery ? describeRecovery(recovery) : null,
    resumeRecovered,
    confirmRecovered,
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
    stopLabel,
    toggle,
    topic,
    totalFocusSeconds,
    displaySeconds: isPomodoro ? Math.max(0, phaseTargetSec - elapsed) : elapsed,
    customConfig,
    customModalVisible,
    openCustomModal,
    closeCustomModal,
    applyCustomMode,
  };
}
