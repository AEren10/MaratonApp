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
  const { currentNet, gapResult } = useThresholdView();

  const isMulti = isMultiNetExam(examType);
  const isDil = examType === "dil";
  const secondLabel = isDil ? "YDT" : "AYT";
  const aytMin = isDil ? YDT_NET_MIN : AYT_NET_MIN;
  const aytMax = isDil ? YDT_NET_MAX : AYT_NET_MAX;

  const [tytValue, setTytValue] = useState(targetNetTYT || 75);
  const [aytValue, setAytValue] = useState(targetNetAYT || (isDil ? 55 : 45));
  const [value, setValue] = useState(targetNet || (isMulti ? 120 : TARGET_NET_MIN));
  const [saving, setSaving] = useState(false);
  const [pendingNote, setPendingNote] = useState(null);
  const seeded = targetNet != null;
  const [daily, setDaily] = useState(goals?.dailyQuestions || 80);

  useEffect(() => {
    if (targetNetTYT != null) setTytValue(targetNetTYT);
    if (targetNetAYT != null) setAytValue(targetNetAYT);
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
  const decTyt = useCallback(() => { H.tap(); setTytValue((v) => Math.max(TYT_NET_MIN, v - 1)); }, []);
  const incTyt = useCallback(() => { H.tap(); setTytValue((v) => Math.min(TYT_NET_MAX, v + 1)); }, []);
  const decAyt = useCallback(() => { H.tap(); setAytValue((v) => Math.max(aytMin, v - 1)); }, [aytMin]);
  const incAyt = useCallback(() => { H.tap(); setAytValue((v) => Math.min(aytMax, v + 1)); }, [aytMax]);
  const dec = useCallback(() => { H.tap(); setValue((v) => Math.max(TARGET_NET_MIN, v - 1)); }, []);
  const inc = useCallback(() => { H.tap(); setValue((v) => Math.min(TARGET_NET_MAX, v + 1)); }, []);

  const save = useCallback(async () => {
    setSaving(true);
    if (daily !== goals?.dailyQuestions) {
      const next = { ...goals, dailyQuestions: daily };
      dispatch(setGoals(next));
      saveGoalsToStorage(next, user?.id).catch(() => {});
      updateGoal(daily);
    }

    const totalToSave = isMulti ? tytValue + aytValue : value;
    const extra = isMulti ? { tyt: tytValue, ayt: aytValue } : {};
    const res = await updateTargetNet(totalToSave, extra);
    setSaving(false);
    const pending = res && res.synced === false;
    setPendingNote(pending ? SYNC_PENDING_COPY.targetNet : null);
    H.success();
    if (!pending) navigation.goBack();
  }, [daily, goals, isMulti, tytValue, aytValue, value, updateTargetNet, navigation, dispatch, user?.id, updateGoal]);

  const cancel = useCallback(() => { navigation.goBack(); }, [navigation]);

  return {
    isMulti, secondLabel, tytValue, decTyt, incTyt, aytValue, decAyt, incAyt,
    aytMin, aytMax, value, dec, inc, save, cancel, saving, pendingNote, seeded,
    netLabel: examNetLabel(examType), currentNet, gapResult, targetDepartment,
    daysUntilExam, min: TARGET_NET_MIN, max: TARGET_NET_MAX,
    daily, decDaily, incDaily, dailyMin: DAILY_MIN, dailyMax: DAILY_MAX,
  };
}
