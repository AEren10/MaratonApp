import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { useExam } from "../../contexts/ExamContext";
import { usePremium } from "../../contexts/PremiumContext";
import { useSync } from "../../contexts/DataSyncContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { buildAnalysisViewModel } from "../../domain/analysis/analysisModel";
import { SCREENS } from "../../constants/screens";
import { trackButtonTap } from "../../lib/analytics";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useNudgePopup } from "../../hooks/useNudgePopup";
import * as H from "../../lib/haptics";

export function useAnalysisController(C) {
  const navigation = useNavigation();
  const { examType } = useExam();
  const { checkFeature, showPaywall } = usePremium();
  const { refresh } = useSync();
  const trials = useSelector(selectTrials);
  const nudges = useRecommendations();
  const { popup: nudgePopup, showNext: showNudgePopup, dismiss: dismissNudgePopup } = useNudgePopup(nudges);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const analysis = useMemo(
    () => buildAnalysisViewModel({ C, examType, filter, trials }),
    [C, examType, filter, trials],
  );

  useEffect(() => {
    setLoading(false);
    showNudgePopup(3000);
  }, [showNudgePopup]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const changeFilter = useCallback((value) => {
    H.select();
    trackButtonTap("analysis_filter_change", { filter: value });
    setFilter(value);
  }, []);

  const go = useCallback((screen, params, analyticsId = "analysis_nav") => {
    trackButtonTap(analyticsId, { targetScreen: screen, filter });
    navigation.navigate(screen, params);
  }, [filter, navigation]);

  const openSimulator = useCallback(() => {
    if (!checkFeature("exam_simulator")) {
      showPaywall("analysis_exam_simulator");
      return;
    }
    go(SCREENS.EXAM_SIMULATOR, undefined, "analysis_practice_simulator");
  }, [checkFeature, go, showPaywall]);

  const handleNudgeAction = useCallback((nudge) => {
    dismissNudgePopup();
    if (nudge.subject) {
      go(SCREENS.SUBJECT_DETAIL, { subjectKey: nudge.subject }, "analysis_nudge_subject");
    }
  }, [dismissNudgePopup, go]);

  return {
    analysis,
    changeFilter,
    filter,
    go,
    handleNudgeAction,
    loading,
    nudgePopup,
    onRefresh,
    openSimulator,
    refreshing,
    dismissNudgePopup,
    screens: SCREENS,
  };
}
