import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useExam } from "../contexts/ExamContext";
import { setGoals, saveGoalsToStorage, selectGoals } from "../store/slices/goalsSlice";
import { useThresholdView } from "./useThresholdView";
import { SYNC_PENDING_COPY } from "../constants/stateCopy";
import { TARGET_NET_MIN, TARGET_NET_MAX, examNetLabel } from "../screens/onboarding/useGoalSetupForm";
import * as H from "../lib/haptics";

// Gunluk soru hedefi araligi: rota kapasite girdisi.
const DAILY_MIN = 20;
const DAILY_MAX = 200;
const DAILY_STEP = 10;

// Tasarim: "Hedef Duzenle" artboard'i — Ayarlar > Hedef net satirindan
// acilan tek-alanli duzenleyici. Is mantigi: hedef net taslagi + kaydet +
// senkron sonucunu okuma (updateTargetNet HIC reject etmiyor).
export function useGoalNetEditor() {
  const navigation = useNavigation();
  const { targetNet, targetDepartment, daysUntilExam, examType, updateTargetNet, updateGoal } = useExam();
  const dispatch = useDispatch();
  const goals = useSelector(selectGoals);
  const { currentNet, gapResult } = useThresholdView();

  const [value, setValue] = useState(TARGET_NET_MIN);
  const [saving, setSaving] = useState(false);
  const [pendingNote, setPendingNote] = useState(null);
  const seeded = targetNet != null;

  // Gunluk soru hedefi de bu ekranda duzenleniyor. Eski GoalsScreen bunu
  // duzenliyordu; yalniz hedef nete indirgemek Ayarlar'daki "Gunluk soru
  // hedefi" satirini ve kullanicinin kapasite girdisini cikmaz sokaga
  // cevirirdi (daily_question_goal gercek ve yazilabilir bir kolon).
  const [daily, setDaily] = useState(DAILY_MIN);

  useEffect(() => {
    if (targetNet != null) setValue(targetNet);
  }, [targetNet]);

  useEffect(() => {
    if (goals?.dailyQuestions != null) setDaily(goals.dailyQuestions);
  }, [goals?.dailyQuestions]);

  const decDaily = useCallback(() => {
    H.tap();
    setDaily((v) => Math.max(DAILY_MIN, v - DAILY_STEP));
  }, []);

  const incDaily = useCallback(() => {
    H.tap();
    setDaily((v) => Math.min(DAILY_MAX, v + DAILY_STEP));
  }, []);

  const dec = useCallback(() => {
    H.tap();
    setValue((v) => Math.max(TARGET_NET_MIN, v - 1));
  }, []);

  const inc = useCallback(() => {
    H.tap();
    setValue((v) => Math.min(TARGET_NET_MAX, v + 1));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);

    if (daily !== goals?.dailyQuestions) {
      const next = { ...goals, dailyQuestions: daily };
      dispatch(setGoals(next));
      saveGoalsToStorage(next).catch(() => {});
      updateGoal(daily);
    }

    const res = await updateTargetNet(value);
    setSaving(false);
    const pending = res && res.synced === false;
    setPendingNote(pending ? SYNC_PENDING_COPY.targetNet : null);
    H.success();
    // Senkron basarisizsa EKRANDAN CIKMIYORUZ: goBack cagrilirsa not
    // gosterilmeden ekran kapanir ve kullanici hedefinin sunucuya
    // yazilmadigini hic gormez.
    if (!pending) navigation.goBack();
  }, [value, daily, goals, dispatch, updateGoal, updateTargetNet, navigation]);

  const cancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    value,
    dec,
    inc,
    save,
    cancel,
    saving,
    pendingNote,
    seeded,
    netLabel: examNetLabel(examType),
    currentNet,
    gapResult,
    targetDepartment,
    daysUntilExam,
    min: TARGET_NET_MIN,
    max: TARGET_NET_MAX,
    daily,
    decDaily,
    incDaily,
    dailyMin: DAILY_MIN,
    dailyMax: DAILY_MAX,
  };
}
