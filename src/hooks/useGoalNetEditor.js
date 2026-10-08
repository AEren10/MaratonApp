import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { setGoals, saveGoalsToStorage, selectGoals } from "../store/slices/goalsSlice";
import { useThresholdView } from "./useThresholdView";
import { SYNC_PENDING_COPY } from "../constants/stateCopy";
import {
  TYT_NET_MIN,
  TYT_NET_MAX,
  AYT_NET_MIN,
  AYT_NET_MAX,
  YDT_NET_MIN,
  YDT_NET_MAX,
  TARGET_NET_MIN,
  TARGET_NET_MAX,
  isMultiNetExam,
  examNetLabel,
} from "../screens/onboarding/useGoalSetupForm";
import * as H from "../lib/haptics";

const DAILY_MIN = 20;
const DAILY_MAX = 500;
const DAILY_STEP = 10;

export function useGoalNetEditor() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const {
    targetNet,
    targetNetTYT,
    targetNetAYT,
    targetDepartment,
    daysUntilExam,
    examType,
    updateTargetNet,
    updateGoal,
  } = useExam();
  const dispatch = useDispatch();
  const goals = useSelector(selectGoals);
  const { currentNet, gapResult, examLabel } = useThresholdView();

  const isMulti = isMultiNetExam(examType);
  const isDil = examType === "dil";
  const secondLabel = isDil ? "YDT" : "AYT";
  const aytMin = isDil ? YDT_NET_MIN : AYT_NET_MIN;
  const aytMax = isDil ? YDT_NET_MAX : AYT_NET_MAX;

  // Ayri TYT/AYT hedefleri yalniz cihazda tutuluyor; yeni cihazda ya da
  // yeniden kurulumda bos gelir, sunucuda yalniz TOPLAM vardir. Eskiden
  // adimlayicilar 75+45'e dusuyor ve kaydet (yalniz gunluk soru icin bile)
  // toplami sessizce 120'ye cekiyordu. Artik: bolunme bilinmiyorsa gercek
  // toplam varsayilan oranla bolunur; net adimlayicisina dokunulmadikca
  // hedef hic yazilmaz.
  const defTyt = 75;
  const defSecond = isDil ? 55 : 45;
  const splitKnown = targetNetTYT != null && targetNetAYT != null;
  const seedTyt = splitKnown || !targetNet ? (targetNetTYT || defTyt) : Math.round((targetNet * defTyt) / (defTyt + defSecond));
  const seedAyt = splitKnown || !targetNet ? (targetNetAYT || defSecond) : Math.round(targetNet) - seedTyt;
  const [tytValue, setTytValue] = useState(seedTyt);
  const [aytValue, setAytValue] = useState(seedAyt);
  const [netTouched, setNetTouched] = useState(false);
  const [value, setValue] = useState(targetNet || (isMulti ? 120 : TARGET_NET_MIN));
  const [saving, setSaving] = useState(false);
  const [pendingNote, setPendingNote] = useState(null);
  const seeded = targetNet != null;
  const [daily, setDaily] = useState(goals?.dailyQuestions || 80);

  useEffect(() => {
    if (netTouched) return;
    setTytValue(seedTyt);
    setAytValue(seedAyt);
    if (targetNet != null) setValue(targetNet);
  }, [targetNet, targetNetTYT, targetNetAYT]);

  useEffect(() => {
    if (isMulti) setValue(tytValue + aytValue);
  }, [isMulti, tytValue, aytValue]);

  useEffect(() => {
    if (goals?.dailyQuestions != null) setDaily(goals.dailyQuestions);
  }, [goals?.dailyQuestions]);

  const decDaily = useCallback(() => { H.tap(); setDaily((v) => Math.max(DAILY_MIN, v - DAILY_STEP)); }, []);
  const incDaily = useCallback(() => { H.tap(); setDaily((v) => Math.min(DAILY_MAX, v + DAILY_STEP)); }, []);
  const touch = (fn) => { H.tap(); setNetTouched(true); fn(); };
  const decTyt = useCallback(() => touch(() => setTytValue((v) => Math.max(TYT_NET_MIN, v - 1))), []);
  const incTyt = useCallback(() => touch(() => setTytValue((v) => Math.min(TYT_NET_MAX, v + 1))), []);
  const decAyt = useCallback(() => touch(() => setAytValue((v) => Math.max(aytMin, v - 1))), [aytMin]);
  const incAyt = useCallback(() => touch(() => setAytValue((v) => Math.min(aytMax, v + 1))), [aytMax]);
  const dec = useCallback(() => touch(() => setValue((v) => Math.max(TARGET_NET_MIN, v - 1))), []);
  const inc = useCallback(() => touch(() => setValue((v) => Math.min(TARGET_NET_MAX, v + 1))), []);
  const changeTyt = useCallback((next) => { setNetTouched(true); setTytValue(next); }, []);
  const changeAyt = useCallback((next) => { setNetTouched(true); setAytValue(next); }, []);
  const changeNet = useCallback((next) => { setNetTouched(true); setValue(next); }, []);
  const changeDaily = useCallback((next) => setDaily(next), []);

  const save = useCallback(async () => {
    setSaving(true);
    if (daily !== goals?.dailyQuestions) {
      const next = { ...goals, dailyQuestions: daily };
      dispatch(setGoals(next));
      saveGoalsToStorage(next, user?.id).catch(() => {});
      updateGoal(daily);
    }

    // Hedef yalniz degistirildiyse (ya da hic yoksa) yazilir.
    let res = null;
    if (netTouched || targetNet == null) {
      const totalToSave = isMulti ? tytValue + aytValue : value;
      const extra = isMulti ? { tyt: tytValue, ayt: aytValue } : {};
      res = await updateTargetNet(totalToSave, extra);
    }
    setSaving(false);
    const pending = res && res.synced === false;
    setPendingNote(pending ? SYNC_PENDING_COPY.targetNet : null);
    H.success();
    if (!pending) navigation.goBack();
  }, [daily, goals, isMulti, tytValue, aytValue, value, netTouched, targetNet, updateTargetNet, navigation, dispatch, user?.id, updateGoal]);

  const cancel = useCallback(() => { navigation.goBack(); }, [navigation]);

  return {
    isMulti, secondLabel, tytValue, decTyt, incTyt, changeTyt,
    aytValue, decAyt, incAyt, changeAyt,
    aytMin, aytMax, value, dec, inc, save, cancel, saving, pendingNote, seeded,
    changeNet,
    netLabel: examNetLabel(examType), currentNet, gapResult, examLabel, targetDepartment,
    daysUntilExam, min: TARGET_NET_MIN, max: TARGET_NET_MAX,
    daily, decDaily, incDaily, changeDaily, dailyMin: DAILY_MIN, dailyMax: DAILY_MAX,
  };
}
