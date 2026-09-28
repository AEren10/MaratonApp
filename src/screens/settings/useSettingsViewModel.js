import { useCallback, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import { usePremium } from "../../contexts/PremiumContext";
import { useExam } from "../../contexts/ExamContext";
import { useTheme } from "../../contexts/ThemeContext";
import { selectGoals } from "../../store/slices/goalsSlice";
import { displayNameOf } from "../../lib/displayName";
import { getExamPhase } from "../../domain/exam/examPhase";
import { isHapticEnabled, setHapticEnabled } from "../../lib/haptics";
import * as H from "../../lib/haptics";
import { useSettingsActions } from "./useSettingsActions";

const EXAM_LABELS = { tyt: "TYT", tyt_ayt: "TYT + AYT", dil: "TYT + YDT", lgs: "LGS" };
const FIELD_LABELS = { sayisal: "Sayısal", ea: "Eşit Ağırlık", sozel: "Sözel", dil: "Dil" };
const THEME_LABELS = { dark: "Koyu", light: "Açık", system: "Sistem" };

export function useSettingsViewModel(navigation) {
  const { handleHelp, handleLogout, handleDeleteAccount } = useSettingsActions();
  const { checkFeature, showPaywall, isPremium, isInGrace } = usePremium();
  const { examType, field, examDate, targetNet, targetNetTYT, targetNetAYT } = useExam();
  const { pref } = useTheme();
  const goals = useSelector(selectGoals);
  const [hapticsOn, setHapticsOn] = useState(isHapticEnabled());
  const { user } = useAuth();

  const displayName = displayNameOf(user) || "Profilim";
  const examLabel = EXAM_LABELS[examType]
    ? [EXAM_LABELS[examType], FIELD_LABELS[field]].filter(Boolean).join(" · ")
    : null;
  const { daysLeft } = useMemo(() => getExamPhase(examDate), [examDate]);

  const secondLabel = examType === "dil" ? "YDT" : "AYT";
  const targetNetLabel = targetNetTYT != null && targetNetAYT != null && (examType === "tyt_ayt" || examType === "dil")
    ? `TYT ${targetNetTYT} · ${secondLabel} ${targetNetAYT}`
    : targetNet != null ? String(targetNet) : null;
  const examDateLabel = examDate
    ? examDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const dailyGoalLabel = goals?.dailyQuestions ? String(goals.dailyQuestions) : null;
  const themeLabel = THEME_LABELS[pref] || null;
  const hasSubscription = isPremium || isInGrace;

  const toggleHaptics = useCallback((val) => {
    setHapticsOn(val);
    setHapticEnabled(val);
    if (val) H.tap();
  }, []);

  const go = useCallback((s) => () => { H.tap(); navigation.navigate(s); }, [navigation]);
  const gatedGo = useCallback((key, screen) => () => {
    H.tap();
    if (checkFeature(key)) navigation.navigate(screen);
    else showPaywall(`settings_${key}`);
  }, [checkFeature, showPaywall, navigation]);

  return {
    displayName,
    examLabel,
    daysLeft,
    targetNetLabel,
    examDateLabel,
    dailyGoalLabel,
    themeLabel,
    hasSubscription,
    hapticsOn,
    toggleHaptics,
    handleHelp,
    handleLogout,
    handleDeleteAccount,
    go,
    gatedGo,
    user,
  };
}
