import { useCallback } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { EmptyState, ErrorState, Skeleton } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { PRODUCT_FEATURES } from "../../constants/premium";
import { useFeatureEntry } from "../../hooks/useFeatureEntry";
import { useSummary } from "../../hooks/useSummary";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useRoadmapNextAction } from "../roadmap/useRoadmapNextAction";
import { SCREENS } from "../../constants/screens";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openInTab } from "../../navigation/tabJump";
import { SHARE_CARD_IDS } from "../../domain/share/shareCards";
import { normalizePeriod } from "../../domain/summary/periodRange";
import { STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { SummaryHeader } from "./components/SummaryHeader";
import { StreakZeroHero } from "./components/summary/StreakZeroHero";
import { SummaryLocked } from "./components/summary/SummaryLocked";
import { SummaryActions } from "./components/summary/SummaryActions";
import { DaySummaryBody } from "./components/summary/DaySummaryBody";
import { WeekSummaryBody } from "./components/summary/WeekSummaryBody";
import { MonthSummaryBody } from "./components/summary/MonthSummaryBody";

// Eski WeeklyReview / WeeklyTrialReview rotalari (bildirim, derin baglanti)
// bu ekrana haftalik modda duser.
const WEEK_ROUTES = new Set([SCREENS.WEEKLY_REVIEW, SCREENS.WEEKLY_TRIAL_REVIEW]);
const SHARE_IDS = { day: SHARE_CARD_IDS.STUDY_DAY, week: SHARE_CARD_IDS.WEEKLY_ROUTE };

function SummaryScreenInner() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const { open: openMonthlyReport } = useFeatureEntry(PRODUCT_FEATURES.monthly_report, "monthly_report");
  const period = WEEK_ROUTES.has(route.name) ? "week" : normalizePeriod(route.params?.period);
  const data = useSummary(period);
  const { routeCreated, weeks } = useStudyRoute({ persist: false });
  const { nextRouteAction, startNextRouteAction } = useRoadmapNextAction({
    navigation, routeCreated, weeks,
  });

  const handleClose = useCallback(() => navigation.goBack(), [navigation]);
  const handlePrimary = useCallback(() => {
    if (period === "month") openInTab(navigation, TAB_KEYS.PROGRAM, SCREENS.MONTH_PLAN, { monthOffset: 1 });
    else navigation.navigate(SCREENS.ROADMAP);
  }, [navigation, period]);
  const handleShare = useCallback(() => {
    navigation.navigate(SCREENS.SHARE_CARD, SHARE_IDS[period] ? { cardId: SHARE_IDS[period] } : undefined);
  }, [navigation, period]);
  const handlePromise = useCallback(() => navigation.navigate(SCREENS.PLAN_VS_ACTUAL), [navigation]);
  const handleUnlock = useCallback(() => {
    openMonthlyReport();
  }, [openMonthlyReport]);
  // Buton "Bugünün durağına başla" diyor; oyleyse duragi baslatmali.
  // Eskiden navigate(HOME) idi: ROTA yiginin koku HOME_ROOT adiyla kayitli
  // oldugu icin cagri zaten acik olan sekmeyi yeniden seciyordu, yani hicbir
  // sey olmuyordu. Durak yoksa en azindan sekmenin kokune donulur.
  const handleStart = useCallback(() => {
    if (nextRouteAction) { startNextRouteAction(); return; }
    navigation.popToTop();
  }, [navigation, nextRouteAction, startNextRouteAction]);
  const handleHowStreak = useCallback(() => navigation.navigate(SCREENS.HOW_IT_WORKS), [navigation]);

  let body;
  if (data.locked) {
    body = <SummaryLocked onUnlock={handleUnlock} />;
  } else if (data.loading) {
    body = (
      <View style={styles.pad}>
        <Skeleton height={96} radius={SHAPE.cardTight} />
        <Skeleton height={146} radius={SHAPE.panel} style={styles.gap} />
      </View>
    );
  } else if (data.error) {
    body = <View style={styles.pad}><ErrorState preset="server" onPrimary={data.retry} /></View>;
  } else if (data.streak === 0 && !data.hasActivity) {
    body = (
      <View style={[styles.pad, styles.emptyPad]}>
        <EmptyState preset="streakZero" onPrimary={handleStart} onSecondary={handleHowStreak} style={styles.streakEmpty}>
          <StreakZeroHero />
        </EmptyState>
      </View>
    );
  } else {
    body = (
      <>
        {period === "day" ? <DaySummaryBody data={data} onShare={handleShare} /> : null}
        {period === "week" ? <WeekSummaryBody data={data} onPromise={handlePromise} /> : null}
        {period === "month" ? <MonthSummaryBody data={data} /> : null}
        <SummaryActions period={period} ctaLabel={data.ctaLabel} onPrimary={handlePrimary} onShare={handleShare} />
      </>
    );
  }

  return (
    <ScrollView style={[styles.safe, { backgroundColor: C.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SummaryHeader dateLabel={data.headerLabel || ""} onClose={handleClose} />
      {body}
    </ScrollView>
  );
}

export default function SummaryScreen() {
  return (
    <ScreenErrorBoundary>
      <SummaryScreenInner />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingTop: STEP.s4, paddingBottom: STEP.s5 },
  pad: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  emptyPad: { flex: 1, justifyContent: "center", paddingTop: STEP.s2, paddingBottom: STEP.s5 * 2 },
  streakEmpty: { alignItems: "center" },
  gap: { marginTop: STEP.s3 },
});
