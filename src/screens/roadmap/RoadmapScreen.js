import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";
import { useRouteDetail } from "../../hooks/useRouteDetail";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useRoadmapNextAction } from "./useRoadmapNextAction";
import { openProgram, PROGRAM_VIEWS } from "../../navigation/openProgram";
import { flattenRouteStops, routeDateTag, upcomingRouteStops } from "../../domain/route/routeOverview";
import { SCREENS } from "../../constants/screens";
import { GUTTER, STEP } from "../../themes/tokens";
import { RouteAccessGate } from "./components/RouteAccessGate";
import { RouteNetIntro } from "./components/RouteNetIntro";
import { RouteEmptyState } from "./components/RouteEmptyState";
import { RouteHeader } from "./components/RouteHeader";
import RouteLinkRow from "./components/RouteLinkRow";
import { RouteProjectionCard } from "./components/RouteProjectionCard";
import { RouteTempoSection } from "./components/RouteTempoSection";
import { RouteUpcomingStops } from "./components/RouteUpcomingStops";
import { RouteThisWeekStrip } from "./components/RouteThisWeekStrip";
import { RouteNextActionCard } from "./components/RouteNextActionCard";
import { RouteWeeksTimeline } from "./components/RouteWeeksTimeline";
import { RouteTopicDebtRow } from "./components/RouteTopicDebtRow";

export default function RoadmapScreen() {
  const C = useC();
  const navigation = useNavigation();
  const d = useRouteDetail();
  const { view } = d;
  const route = useStudyRoute({ persist: false });
  const { weeks, isPaused, routeCreated } = route;

  const { nextRouteAction, startNextRouteAction } = useRoadmapNextAction({
    navigation,
    routeCreated,
    weeks,
  });

  const enrichedUpcoming = useMemo(() => {
    const flat = flattenRouteStops(weeks, { routeFrozen: isPaused });
    return upcomingRouteStops(flat, 3).map((item) => {
      const seg = item.stop?.segmentIndex;
      return {
        key: item.key,
        name: item.stop.topic,
        part: seg != null && seg > 0 ? `${seg + 1}. bölüm` : null,
        note: item.stop.subjectLabel || null,
        date: routeDateTag(item.weekStart),
      };
    });
  }, [weeks, isPaused]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader title="Rota" onBack={d.goBack} />
      <RouteAccessGate
        loading={d.access.loading}
        error={d.access.error}
        hasAccess={d.access.hasAccess}
        onRetry={d.access.retry}
        onPaywall={d.access.paywall}
      >
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {d.isEmpty ? (
            <RouteEmptyState
              daysLeft={d.daysLeft}
              examDateTag={d.examDateTag}
              loading={d.creating}
              onAddFirstStop={d.addFirstStop}
            />
          ) : (
            <>
              <RouteNetIntro
                C={C}
                view={view}
                chartReady={d.chartReady}
                targetNet={d.targetNet}
                examDateTag={d.examDateTag}
                declared={d.declared}
              />

              <RouteThisWeekStrip
                C={C}
                currentWeek={weeks?.[0]}
                promiseText={d.promiseText}
                onPress={() => openProgram(navigation, PROGRAM_VIEWS.WEEK)}
              />

              {nextRouteAction ? (
                <RouteNextActionCard
                  C={C}
                  action={nextRouteAction}
                  onStart={startNextRouteAction}
                  onOpenStop={() => d.openStop(nextRouteAction.stopId || nextRouteAction.topicName)}
                />
              ) : null}

              <RouteTopicDebtRow C={C} onPress={() => navigation.navigate(SCREENS.TOPIC_DEBT)} />

              <Animated.View style={s.cardSection}>
                <RouteProjectionCard projectedNet={view.projectedNet} note={view.note} rangeText={view.rangeText} />
              </Animated.View>

              <Animated.View style={s.section}>
                {view.tempoRows?.length ? (
                  <RouteTempoSection rows={view.tempoRows} locked={d.scenariosLocked} onOpen={d.openScenarios} />
                ) : null}
                <View style={s.links}>
                  {d.targetNet != null ? (
                    <RouteLinkRow
                      title={`${d.examLabel ? `${d.examLabel} ` : ""}${d.targetNet} net ≈ hangi bölümler?`}
                      subtitle="Hedef netinin karşılığı · 24 devlet üniversitesi"
                      onPress={d.openThreshold}
                    />
                  ) : null}
                </View>
              </Animated.View>

              <RouteWeeksTimeline C={C} weeks={weeks} />

              <Animated.View style={s.section}>
                {enrichedUpcoming.length > 0 ? (
                  <RouteUpcomingStops items={enrichedUpcoming} onStop={d.openStop} />
                ) : null}
              </Animated.View>
            </>
          )}
        </ScrollView>
      </RouteAccessGate>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  cardSection: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 6 },
  section: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 + 4 },
  links: { gap: STEP.s1 + 2, marginTop: STEP.s2 + 4 },
});
