import { useCallback, useRef, useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useSync } from "../../contexts/DataSyncContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { useAuth } from "../../contexts/AuthContext";
import { TrialReportCard } from "./components/TrialReportCard";
import { NudgePopup } from "../../components/common/NudgePopup";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useNudgePopup } from "../../hooks/useNudgePopup";
import { useTrialCompareEntry } from "../../hooks/useTrialCompareEntry";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import { useResolvedTrial } from "./useResolvedTrial";
import { useTrialDetail } from "./useTrialDetail";
import { useTrialDetailMenu } from "./useTrialDetailMenu";
import { useDepthTint } from "../../hooks/useDepthTint";
import { TrialDetailHeader } from "./components/TrialDetailHeader";
import { TrialDetailSubjectTable } from "./components/TrialDetailSubjectTable";
import { TrialDetailLinks } from "./components/TrialDetailLinks";
import { TrialDetailStateViews } from "./components/TrialDetailStateViews";
import { trialStory } from "../../domain/insight/storyLines";
import { CountUpText } from "../../components/design/CountUpText";
import { DepthScrollView } from "../../components/design/DepthScroll";

const fmtNet = (n) => String(Math.round(Number(n || 0) * 100) / 100).replace(".", ",");

function TrialDetailScreenInner() {
  const C = useC();
  const navigation = useNavigation();
  const openCompare = useTrialCompareEntry();
  const route = useRoute();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const trials = useSelector(selectTrials);
  const { syncedOnce, error: syncError, refresh } = useSync();
  const { user } = useAuth();
  const cardRef = useRef(null);
  const showAlert = useAlert();
  const nudges = useRecommendations();
  const { popup: nudgePopup, showNext: showNudgePopup, dismiss: dismissNudgePopup } = useNudgePopup(nudges);

  const fromEntry = route.params?.fromEntry;
  const latest = useResolvedTrial({
    trial: route.params?.trial, linkedId: route.params?.id || route.params?.trialId, trials, user,
  });
  const detail = useTrialDetail({ latest: latest || {}, trials, C });
  useDepthTint(latest ? detail.topSubjectKey : null);
  const { handleMenu } = useTrialDetailMenu({ latest, user, navigation, showAlert, cardRef });

  useEffect(() => {
    if (fromEntry) showNudgePopup(2500);
  }, [fromEntry, showNudgePopup]);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";
  const readError = syncError?.sourceKeys?.includes("trials") ? syncError : null;

  const dateStr = latest?.date
    ? new Date(latest.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
    : "—";

  const story = useMemo(
    () => trialStory({ subjects: (detail.bars || []).map((b) => ({ label: b.name, net: b.net, empty: b.empty })) }),
    [detail.bars]
  );

  const deltaText = detail.prev && detail.trend !== 0
    ? `${detail.trend > 0 ? "+" : "−"}${fmtNet(Math.abs(detail.trend))} net`
    : null;
  const deltaColor = detail.trend > 0 ? C.up : C.down;

  const links = useMemo(
    () => [
      { label: "Deneme karşılaştır", note: "İki denemeyi ders ders yan yana koy", go: () => openCompare() },
      { label: "Yanlışları deftere ekle", note: "Bu denemedeki soruları kaydet", go: () => navigation.navigate(SCREENS.ADD_WRONG, { trialId: latest?.id }) },
    ],
    [openCompare, navigation, latest?.id]
  );

  if (!latest) {
    return (
      <TrialDetailStateViews
        C={C} onBack={goBack} loading={!syncedOnce} readError={readError}
        onRetry={refresh} onNavigateEntry={(s) => navigation.navigate(s)}
      />
    );
  }

  const typeLabel = (detail.typeMeta?.label || latest.trialType || "DENEME").toLocaleUpperCase("tr-TR");

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <TrialDetailHeader C={C} onBack={goBack} onMenu={handleMenu} />
      <DepthScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.heroSection}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{`${typeLabel} · ${dateStr.toLocaleUpperCase("tr-TR")}`}</Text>
          <View style={s.heroRow}>
            <CountUpText value={Number(detail.rawNet || 0)} decimals={2} style={[TYPOGRAPHY.stat, { color: C.text }]} />
            {deltaText ? <Text style={[TYPOGRAPHY.bodySemiBold, { color: deltaColor }]}>{deltaText}</Text> : null}
          </View>
          <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>{story}</Text>
        </View>

        <TrialDetailSubjectTable C={C} bars={detail.bars} />
        <TrialDetailLinks C={C} links={links} />
      </DepthScrollView>

      <NudgePopup
        nudge={nudgePopup}
        visible={!!nudgePopup}
        onDismiss={dismissNudgePopup}
        onAction={(n) => {
          dismissNudgePopup();
          if (n.subject) navigation.navigate(SCREENS.ANALYSIS);
        }}
      />

      <View style={s.offscreen} pointerEvents="none">
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

export default function TrialDetailScreen() {
  return (
    <ScreenErrorBoundary>
      <TrialDetailScreenInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: STEP.s5 * 2 },
  heroSection: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  heroRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2, marginTop: STEP.s1 },
  offscreen: { position: "absolute", left: -10000, top: 0 },
});
