import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { useRouteDetail } from "../../hooks/useRouteDetail";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { RouteAccessGate } from "./components/RouteAccessGate";
import { RouteDetailChart } from "./components/RouteDetailChart";
import { RouteEmptyChart } from "./components/RouteEmptyChart";
import { RouteEmptyState } from "./components/RouteEmptyState";
import { RouteHeader } from "./components/RouteHeader";
import RouteLinkRow from "./components/RouteLinkRow";
import { RouteProjectionCard } from "./components/RouteProjectionCard";
import { RouteTempoSection } from "./components/RouteTempoSection";
import { RouteUpcomingStops } from "./components/RouteUpcomingStops";

const enter = (i) => FadeInDown.delay(i * 80).duration(600);

export default function RoadmapScreen() {
  const C = useC();
  const d = useRouteDetail();
  const { view } = d;

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
              <Animated.View entering={enter(0)} style={s.intro}>
                <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>NET ORTALAMASI</Text>
                {view.caption ? (
                  <Text style={[TYPOGRAPHY.caption, s.caption, { color: C.text3 }]}>{view.caption}</Text>
                ) : null}
                <View style={s.chart}>
                  {d.chartReady && view.chart ? (
                    <RouteDetailChart chart={view.chart} target={d.targetNet} examDateTag={d.examDateTag} />
                  ) : (
                    <RouteEmptyChart examDateTag={d.examDateTag} />
                  )}
                </View>
              </Animated.View>
              
              <Animated.View entering={enter(1)}>
                <RouteProjectionCard projectedNet={view.projectedNet} note={view.note} rangeText={view.rangeText} />
              </Animated.View>
              
              <Animated.View entering={enter(2)} style={s.section}>
                {view.tempoRows?.length ? (
                  <RouteTempoSection rows={view.tempoRows} locked={d.scenariosLocked} onOpen={d.openScenarios} />
                ) : null}
                <View style={s.links}>
                  {d.targetNet != null ? (
                    <RouteLinkRow
                      title={`${d.targetNet} net ≈ hangi bölümler?`}
                      subtitle="Hedef netinin karşılığı"
                      onPress={d.openThreshold}
                    />
                  ) : null}
                  <RouteLinkRow title="Söz ve gerçek" subtitle={d.promiseText} onPress={d.openPromise} />
                </View>
              </Animated.View>
              
              <Animated.View entering={enter(3)} style={s.section}>
                {(d.upcoming?.length ?? 0) > 0 ? (
                  <RouteUpcomingStops items={d.upcoming} onStop={d.openStop} />
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
  intro: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  caption: { marginTop: STEP.s1 / 2 },
  chart: { marginTop: STEP.s2 },
  section: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  links: { gap: STEP.s1, marginTop: STEP.s2 },
});
