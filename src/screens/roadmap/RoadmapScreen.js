import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";
import { useRouteDetail } from "../../hooks/useRouteDetail";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useRoadmapNextAction } from "./useRoadmapNextAction";
import { useReplayOnFocus } from "../../hooks/useReplayOnFocus";
import { openProgram, PROGRAM_VIEWS } from "../../navigation/openProgram";
import { SCREENS } from "../../constants/screens";
import { GUTTER, STEP } from "../../themes/tokens";
import { RouteAccessGate } from "./components/RouteAccessGate";
import { RouteNetIntro } from "./components/RouteNetIntro";
import { RouteEmptyState } from "./components/RouteEmptyState";
import { RouteHeader } from "./components/RouteHeader";
import RouteLinkRow from "./components/RouteLinkRow";
import { RouteProjectionCard } from "./components/RouteProjectionCard";
import { RouteFeasibilityNote } from "../../components/route/RouteFeasibilityNote";
import { feasibilityNote } from "../../domain/route/feasibility";
import { RouteTempoSection } from "./components/RouteTempoSection";
import { RouteWhyThisWeek } from "./components/RouteWhyThisWeek";
import { RouteWeeksTimeline } from "./components/RouteWeeksTimeline";
import { RouteTopicDebtRow } from "./components/RouteTopicDebtRow";

export default function RoadmapScreen() {
  const C = useC();
  const navigation = useNavigation();
  const d = useRouteDetail();
  const { view } = d;
  const replay = useReplayOnFocus();
  const route = useStudyRoute({ persist: false });
  const { weeks, isPaused, routeCreated } = route;
  const feasibility = useMemo(() => feasibilityNote({
    shortfall: route.shortfall, capacity: route.capacity, weeksLeft: route.route?.weeksLeft,
  }), [route.shortfall, route.capacity, route.route?.weeksLeft]);

  const { nextRouteAction, startNextRouteAction } = useRoadmapNextAction({
    navigation,
    routeCreated,
    weeks,
  });

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
                key={`net-${replay}`}
                C={C}
                view={view}
                chartReady={d.chartReady}
                targetNet={d.targetNet}
                examDateTag={d.examDateTag}
                declared={d.declared}
              />

              {/* Haftalik "N durak · M bitti" kutusu kalkti (kullanici, 3 Ekim):
                  yerine rotanin bu haftaki kararlari ve gerekceleri. */}
              <RouteWhyThisWeek
                C={C}
                week={weeks?.[0]}
                onOpenStop={d.openStop}
                onOpenWeek={() => openProgram(navigation, PROGRAM_VIEWS.WEEK)}
              />

              {/* Dev "Calismaya basla" karti kalkti (kullanici, 4 Ekim): bu sayfa
                  rotayi okumak icin; calismaya ana sayfadan gidilir. */}

              <RouteTopicDebtRow C={C} onPress={() => navigation.navigate(SCREENS.TOPIC_DEBT)} />

              <RouteFeasibilityNote note={feasibility} style={s.feasible} />
              {/* Tahmin yoksa ("—") kart hic gorunmez; bos kutu kafa karistiriyordu. */}
              {view.projectedNet != null ? (
                <Animated.View style={s.cardSection}>
                  <RouteProjectionCard projectedNet={view.projectedNet} note={view.note} rangeText={view.rangeText} />
                </Animated.View>
              ) : null}

              <Animated.View style={s.section}>
                {view.tempoRows?.length ? (
                  <RouteTempoSection rows={view.tempoRows} locked={d.scenariosLocked} onOpen={d.openScenarios} />
                ) : null}
                <View style={s.links}>
                  {/* Universite/bolum esigi YKS icin; LGS ogrencisine anlamsiz. */}
                  {d.targetNet != null && !d.isLGS ? (
                    <RouteLinkRow
                      plain
                      title={`${d.examLabel ? `${d.examLabel} ` : ""}${d.targetNet} net ≈ hangi bölümler?`}
                      subtitle="Hedef netinin karşılığı · üniversite ve bölümler"
                      onPress={d.openThreshold}
                    />
                  ) : null}
                </View>
              </Animated.View>

              {/* "Gelecek duraklar" kalkti: ayni bilgi haftalik yolda ve
                  Program > Hafta'da zaten var; sayfa gurultusunu azaltir. */}
              <RouteWeeksTimeline C={C} weeks={weeks} />
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
  feasible: { marginHorizontal: GUTTER, marginTop: STEP.s3 },
  cardSection: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 6 },
  section: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 + 4 },
  links: { gap: STEP.s1 + 2, marginTop: STEP.s2 + 4 },
});
