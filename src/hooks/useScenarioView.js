import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectGoals, setGoals, saveGoalsToStorage } from "../store/slices/goalsSlice";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { usePremium } from "../contexts/PremiumContext";
import { useStudyRoute } from "./useStudyRoute";
import { updateProfile } from "../supabase/profiles";
import { captureError } from "../lib/errorReporting";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { PRODUCT_FEATURES } from "../constants/premium";
import * as H from "../lib/haptics";

/**
 * "Senaryolar" ekranının iş mantığı — AKIŞ 2.
 *
 * Tempo senaryosu seçme + "Bu tempoyu uygula": seçilen senaryonun haftalık
 * soru hedefini günlük soru hedefine çevirip goals'a yazar (tek gerçek
 * karşılığı bu — rota kapasitesi zaten günlük soru hedefinden türüyor).
 */
export function useScenarioView() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const showAlert = useAlert();
  const { accessLoading, accessError, accessSnapshot, showPaywall } = usePremium();
  const { tempoScenarios, forecast } = useStudyRoute({ persist: false });
  const goals = useAppSelector(selectGoals);

  const [selected, setSelected] = useState(1);
  const [applying, setApplying] = useState(false);

  const accessState = accessLoading ? "loading" : accessError ? "error" : "ready";
  const canAccess = canAccessProductFeature({
    accessState,
    features: accessSnapshot?.features,
    featureKey: PRODUCT_FEATURES.route_scenarios,
  });

  const selectedScenario = useMemo(
    () => tempoScenarios.find((item) => item.multiplier === selected) || null,
    [tempoScenarios, selected],
  );

  const selectScenario = useCallback((multiplier) => {
    if (!canAccess) { showPaywall("route_scenarios"); return; }
    H.select();
    setSelected(multiplier);
  }, [canAccess, showPaywall]);

  const applyTempo = useCallback(async () => {
    if (!canAccess) { showPaywall("route_scenarios"); return; }
    if (!selectedScenario || selectedScenario.multiplier === 1) {
      showAlert("Zaten uygulanıyor", "Şimdiki tempo hâlihazırda hedefin.");
      return;
    }
    setApplying(true);
    const nextDaily = Math.max(1, Math.round(selectedScenario.questionsPerWeek / 7));
    try {
      dispatch(setGoals({ dailyQuestions: nextDaily }));
      saveGoalsToStorage({ ...goals, dailyQuestions: nextDaily });
      if (user?.id && user.id !== "dev") {
        await updateProfile(user.id, { daily_question_goal: nextDaily });
      }
      H.success();
      showAlert("Uygulandı", `Günlük soru hedefin ${nextDaily} olarak güncellendi.`);
      navigation.goBack();
    } catch (e) {
      captureError(e, { context: "scenario_apply" });
      showAlert("Olmadı", "Tempo uygulanamadı. Tekrar dene.");
    } finally {
      setApplying(false);
    }
  }, [canAccess, showPaywall, selectedScenario, showAlert, dispatch, goals, user?.id, navigation]);

  return {
    forecast,
    scenarios: tempoScenarios,
    selected,
    selectedScenario,
    selectScenario,
    applyTempo,
    applying,
    canAccess,
  };
}
