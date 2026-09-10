import { useCallback } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { EmptyState } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { useSummary } from "../../hooks/useSummary";
import { SCREENS } from "../../constants/screens";
import { STEP, GUTTER } from "../../themes/tokens";
import { SummaryHeader } from "./components/SummaryHeader";
import { SummaryHero } from "./components/SummaryHero";
import { SummaryWeeklyChart } from "./components/SummaryWeeklyChart";
import { SummaryTaskList } from "./components/SummaryTaskList";
import { SummaryRouteImpact } from "./components/SummaryRouteImpact";
import { SummaryCta } from "./components/SummaryCta";

function SummaryScreenInner() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const period = route.params?.period || "day";
  const data = useSummary(period);

  const handleClose = useCallback(() => navigation.goBack(), [navigation]);
  const handlePrimary = useCallback(() => {
    if (period === "day") navigation.navigate(SCREENS.ROADMAP);
  }, [navigation, period]);
  const handleShare = useCallback(() => {
    navigation.navigate(SCREENS.SHARE_CARD, { type: period });
  }, [navigation, period]);

  if (!data.ready) {
    return (
      <View style={[styles.safe, { backgroundColor: C.bg }]}>
        <SummaryHeader dateLabel={data.dateLabel} onClose={handleClose} />
        <View style={styles.emptyWrap}>
          <EmptyState
            title={period === "week" ? "Haftalık özet hazırlanıyor" : "Aylık özet hazırlanıyor"}
            body="Bu dönem için veri toplama henüz bağlanmadı — sonraki sürümde tamamlanacak."
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.safe, { backgroundColor: C.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SummaryHeader dateLabel={data.dateLabel} onClose={handleClose} />

      {!data.hasData ? (
        <View style={styles.emptyWrap}>
          <EmptyState preset="streakZero" />
        </View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(60).duration(500)}>
            <SummaryHero
              headline={data.headline}
              totalQuestions={data.totalQuestions}
              stopsToday={data.stopsToday}
              durationLabel={data.durationLabel}
              dateLabel={data.dateLabel}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(500)}>
            <SummaryWeeklyChart
              bars={data.weeklyBars}
              deltaPct={data.questionsDeltaPct}
              loading={data.weeklyLoading}
            />
          </Animated.View>

          <SummaryTaskList tasks={data.tasks} />
          <SummaryRouteImpact impact={data.routeImpact} />
        </>
      )}

      <SummaryCta
        ctaLabel={data.ctaLabel}
        shareLabel={data.shareLabel}
        onPrimary={handlePrimary}
        onShare={handleShare}
      />
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
  content: { paddingTop: STEP.s4, paddingBottom: STEP.s5 },
  emptyWrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
});
