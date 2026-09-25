import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import { setGoals, saveGoalsToStorage } from "../../store/slices/goalsSlice";
import * as H from "../../lib/haptics";
import { SCREENS } from "../../constants/screens";
import { SYNC_PENDING_COPY } from "../../constants/stateCopy";

export const TYT_NET_MIN = 20, TYT_NET_MAX = 120, TYT_NET_DEFAULT = 75;
export const AYT_NET_MIN = 10, AYT_NET_MAX = 80, AYT_NET_DEFAULT = 45;
export const YDT_NET_MIN = 10, YDT_NET_MAX = 80, YDT_NET_DEFAULT = 55;
export const LGS_NET_MIN = 20, LGS_NET_MAX = 90, LGS_NET_DEFAULT = 65;
export const DAILY_Q_MIN = 20, DAILY_Q_MAX = 500, DAILY_Q_STEP = 10;
export const TARGET_NET_MIN = TYT_NET_MIN, TARGET_NET_MAX = TYT_NET_MAX, TARGET_NET_DEFAULT = TYT_NET_DEFAULT;

export function isMultiNetExam(examType) {
  return examType === "tyt_ayt" || examType === "dil";
}

export function examNetLabel(examType) {
  if (examType === "lgs") return "LGS";
  if (examType === "tyt_ayt") return "TYT + AYT";
  if (examType === "dil") return "TYT + YDT";
  return "TYT";
}

function estimateHours(q) {
  const h = q / 50;
  return h % 1 === 0 ? `${h}` : h.toFixed(1);
}

export function useGoalSetupForm() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useAuth();
  const {
    updateGoal, updateTargetNet, examType, targetNet,
    targetNetTYT, targetNetAYT, skipSetup,
  } = useExam();

  const isMulti = isMultiNetExam(examType);
  const isDil = examType === "dil";
  const isLgs = examType === "lgs";
  const secondLabel = isDil ? "YDT" : "AYT";

  const [tytNet, setTytNet] = useState(targetNetTYT || TYT_NET_DEFAULT);
  const [aytNet, setAytNet] = useState(targetNetAYT || (isDil ? YDT_NET_DEFAULT : AYT_NET_DEFAULT));
  const [singleNet, setSingleNet] = useState(targetNet || (isLgs ? LGS_NET_DEFAULT : TYT_NET_DEFAULT));
  const [dailyQuestions, setDailyQuestions] = useState(80);
  const [targetNetPending, setTargetNetPending] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    if (targetNet == null && targetNetTYT == null && targetNetAYT == null) return;
    seeded.current = true;
    if (targetNetTYT != null) setTytNet(targetNetTYT);
    if (targetNetAYT != null) setAytNet(targetNetAYT);
    if (targetNet != null) setSingleNet(targetNet);
  }, [targetNet, targetNetTYT, targetNetAYT]);

  const totalNet = isMulti ? tytNet + aytNet : singleNet;
  const hours = estimateHours(dailyQuestions);
  const netLabel = examNetLabel(examType);

  const saveGoalsAndNet = useCallback(() => {
    const goals = { dailyQuestions, weeklyTrials: 2, weeklyMinutes: 1200 };
    dispatch(setGoals(goals));
    saveGoalsToStorage(goals, user?.id).catch(() => {});
    updateGoal(dailyQuestions).catch(() => {});

    const extra = isMulti
      ? { tyt: tytNet, ayt: aytNet }
      : { tyt: isLgs ? null : singleNet, ayt: null };
    return updateTargetNet(totalNet, extra);
  }, [dailyQuestions, dispatch, isMulti, isLgs, singleNet, tytNet, aytNet, totalNet, updateGoal, updateTargetNet, user?.id]);

  const finish = useCallback(async () => {
    H.success();
    saveGoalsAndNet().then((res) => {
      if (res && res.synced === false) setTargetNetPending(true);
    });

    navigation.navigate(SCREENS.LEVEL_TEST);
  }, [navigation, saveGoalsAndNet]);

  const skipToHome = useCallback(async () => {
    H.tap();
    saveGoalsAndNet().catch(() => {});
    await skipSetup();
  }, [saveGoalsAndNet, skipSetup]);

  return {
    isMulti, isDil, isLgs, secondLabel,
    tytNet, setTytNet, aytNet, setAytNet, singleNet, setSingleNet, totalNet,
    targetNetPending, targetNetPendingNote: targetNetPending ? SYNC_PENDING_COPY.targetNet : null,
    dailyQuestions, setDailyQuestions, hours, netLabel, finish, skipToHome,
  };
}
