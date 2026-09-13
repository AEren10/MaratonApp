import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { useRouteStopDetail } from "../../hooks/useRouteStopDetail";
import { GUTTER, STEP } from "../../themes/tokens";
import { subjectColorOf } from "../../themes/subjectPalette";
import { RouteAccessGate } from "./components/RouteAccessGate";
import { RouteHeader } from "./components/RouteHeader";
import { RouteStatTiles } from "./components/RouteStatTiles";
import { RouteStopHero } from "./components/RouteStopHero";
import { RouteStopPlace } from "./components/RouteStopPlace";
import { RouteStopWhy } from "./components/RouteStopWhy";

const enter = (i) => FadeInDown.delay(i * 80).duration(600);

// Tasarim AKIS 2 · "Durak Detayı": rotadaki tek durak.
// Parametre: { stopKey } (routeOverview.routeStopKey).
export default function RouteStopDetailScreen() {
  const C = useC();
  const d = useRouteStopDetail();
  const { stop } = d;
  const color = stop ? subjectColorOf(C, stop.subject) : C.accent;
  const studied = stop && Number(stop.q) > 0;

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader onBack={d.goBack} onMore={stop ? d.openMore : null} moreLabel="Durak seçenekleri" />
      <RouteAccessGate
        loading={d.access.loading || (d.access.hasAccess && !d.access.error && !stop)}
        error={d.access.error}
        hasAccess={d.access.hasAccess}
        onRetry={d.access.retry}
        onPaywall={d.access.paywall}
      >
        {stop ? (
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            <Animated.View entering={enter(0)}>
              <RouteStopHero number={d.number} stop={stop} color={color} subjectCompleted={d.subjectCompleted} />
            </Animated.View>
            <Animated.View entering={enter(1)}>
              <RouteStopWhy stop={stop} color={color} />
            </Animated.View>
            <Animated.View entering={enter(2)}>
              <RouteStopPlace prev={d.prev} next={d.next} />
            </Animated.View>
            <Animated.View entering={enter(3)}>
              <RouteStatTiles
                tiles={[
                  { label: "SON ÇALIŞMA", value: studied ? `${Math.round(stop.neglectedDays || 0)} gün` : null },
                  { label: "ÇÖZÜLEN", value: studied ? Math.round(stop.q) : null },
                  { label: "DEFTER", value: d.notebook },
                ]}
              />
            </Animated.View>
            <Animated.View entering={enter(4)} style={s.actions}>
              {d.canStart ? (
                <Button size="lg" fullWidth onPress={d.start}>Çalışmaya Başla</Button>
              ) : null}
              {d.canPostpone ? (
                <Button variant="outline" size="md" fullWidth loading={d.postponing} onPress={d.postpone}>
                  Durağı erteleyeyim
                </Button>
              ) : null}
            </Animated.View>
          </ScrollView>
        ) : null}
      </RouteAccessGate>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: STEP.s4 },
  actions: { paddingHorizontal: GUTTER, paddingTop: STEP.s4, gap: STEP.s2 },
});
