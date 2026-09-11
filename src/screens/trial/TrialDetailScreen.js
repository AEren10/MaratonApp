import { useCallback, useRef, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { EmptyState } from "../../components/design";
import { TYPOGRAPHY, STEP } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { useAuth } from "../../contexts/AuthContext";
import { TrialReportCard } from "./components/TrialReportCard";
import { NudgePopup } from "../../components/common/NudgePopup";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useNudgePopup } from "../../hooks/useNudgePopup";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import { useResolvedTrial } from "./useResolvedTrial";
import { useTrialDetail } from "./useTrialDetail";
import { useTrialDetailMenu } from "./useTrialDetailMenu";
import { TrialDetailHeader } from "./components/TrialDetailHeader";
import { TrialDetailHero } from "./components/TrialDetailHero";
import { TrialDetailNetCards } from "./components/TrialDetailNetCards";
import { TrialDetailSubjectTable } from "./components/TrialDetailSubjectTable";
import { TrialDetailDifficultyCard } from "./components/TrialDetailDifficultyCard";
import { TrialDetailRouteImpact } from "./components/TrialDetailRouteImpact";
import { TrialDetailActions } from "./components/TrialDetailActions";

export default function TrialDetailScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const trials = useSelector(selectTrials);
  const { user } = useAuth();
  const cardRef = useRef(null);
  const showAlert = useAlert();
  const nudges = useRecommendations();
  const { popup: nudgePopup, showNext: showNudgePopup, dismiss: dismissNudgePopup } = useNudgePopup(nudges);

  const fromEntry = route.params?.fromEntry;
  const latest = useResolvedTrial({
    trial: route.params?.trial, linkedId: route.params?.id, trials, user,
  });
  const detail = useTrialDetail({ latest: latest || {}, trials, C });
  const { handleMenu } = useTrialDetailMenu({ latest, user, navigation, showAlert, cardRef });

  useEffect(() => {
    if (fromEntry) showNudgePopup(2500);
  }, [fromEntry, showNudgePopup]);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";

  if (!latest) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
        <TrialDetailHeader C={C} onBack={goBack} onMenu={() => {}} />
        <View style={styles.emptyBox}>
          <EmptyState preset="trialRecords" onPrimary={() => navigation.navigate(SCREENS.TRIAL_ENTRY)} />
        </View>
      </SafeAreaView>
    );
  }

  const dateStr = latest.date
    ? new Date(latest.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
    : "—";

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <TrialDetailHeader C={C} onBack={goBack} onMenu={handleMenu} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {fromEntry && (
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, textAlign: "center", marginBottom: STEP.s2 }]}>
            Deneme Kaydedildi!
          </Text>
        )}

        <TrialDetailHero
          C={C} latest={latest} dateStr={dateStr} typeMeta={detail.typeMeta}
          rawNet={detail.rawNet} trend={detail.trend} prev={detail.prev}
        />
        <TrialDetailNetCards
          C={C} rawNet={detail.rawNet} normalizedNet={detail.normalizedNet}
          hasNormalization={detail.hasNormalization} publisherLabel={detail.publisherLabel}
          difficultyMultiplier={detail.difficultyMultiplier}
        />
        <TrialDetailSubjectTable C={C} bars={detail.bars} />
        {detail.showDifficultyCard && (
          <TrialDetailDifficultyCard C={C} difficultyLabel={detail.difficultyLabel} />
        )}
        <TrialDetailRouteImpact C={C} routeImpact={detail.routeImpact} />
        <TrialDetailActions
          onAddWrong={() => navigation.navigate(SCREENS.ADD_WRONG)}
          onCompare={() => navigation.navigate(SCREENS.TRIAL_COMPARE)}
        />
      </ScrollView>

      <NudgePopup
        nudge={nudgePopup}
        visible={!!nudgePopup}
        onDismiss={dismissNudgePopup}
        onAction={(n) => {
          dismissNudgePopup();
          if (n.subject) navigation.navigate(SCREENS.ANALYSIS);
        }}
      />

      <View style={styles.offscreen} pointerEvents="none">
        <TrialReportCard
          ref={cardRef}
          name={displayName}
          typeLabel={detail.typeMeta?.label || latest.name || "Deneme"}
          net={detail.rawNet}
          dateStr={dateStr}
          bars={detail.bars}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  emptyBox: { flex: 1, justifyContent: "center", paddingHorizontal: STEP.s3 },
  offscreen: { position: "absolute", left: -10000, top: 0 },
});
