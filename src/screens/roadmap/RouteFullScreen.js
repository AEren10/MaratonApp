import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { useRouteFull } from "../../hooks/useRouteFull";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { RouteAccessGate } from "./components/RouteAccessGate";
import { RouteFullSummary } from "./components/RouteFullSummary";
import { RouteHeader } from "./components/RouteHeader";
import RouteLinkRow from "./components/RouteLinkRow";
import { RouteStatusLegend } from "./components/RouteStatusLegend";

const enter = (i) => FadeInDown.delay(i * 80).duration(600);

// Tasarim AKIS 2 · "Rotanın tamamı".
export default function RouteFullScreen() {
  const C = useC();
  const d = useRouteFull();

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader title="Rotanın tamamı" onBack={d.goBack} />
      <RouteAccessGate
        loading={d.access.loading}
        error={d.access.error}
        hasAccess={d.access.hasAccess}
        onRetry={d.access.retry}
        onPaywall={d.access.paywall}
      >
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={enter(0)} style={s.top}>
            <RouteFullSummary
              counts={d.counts}
              segments={d.segments}
              debtHours={d.debtHours}
              daysLeft={d.daysLeft}
            />
          </Animated.View>
          <Animated.View entering={enter(1)} style={s.section}>
            <RouteStatusLegend />
          </Animated.View>
          <Animated.View entering={enter(2)} style={s.section}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>GÖRÜNÜMLER</Text>
            <View style={s.links}>
              <RouteLinkRow
                title="Program"
                subtitle="Durakların gün gün dağılımı"
                value={d.weekStops != null ? `bu hafta ${d.weekStops}` : null}
                onPress={d.openProgram}
              />
              <RouteLinkRow
                title="Konu borcu"
                subtitle="Tamamlanmamış duraklar"
                chip={d.debtHours > 0 ? `${d.debtHours} sa` : null}
                onPress={d.openDebt}
              />
              <RouteLinkRow
                title="Söz ve gerçek"
                subtitle="Planlanan ve tamamlanan durak sayısı"
                value={d.promiseGap != null ? `${d.promiseGap} durak` : null}
                onPress={d.openPromise}
              />
            </View>
          </Animated.View>
          <View style={s.redrawWrap}>
            <Pressable
              onPress={d.openRedraw}
              accessibilityRole="button"
              accessibilityLabel="Rotayı yeniden çiz"
              style={({ pressed }) => [s.redraw, { borderTopColor: C.line, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[TYPOGRAPHY.metaSemiBold, s.flex, { color: C.text2 }]}>Rotayı yeniden çiz</Text>
              <Icon name="chevR" size={13} color={C.text5} />
            </Pressable>
          </View>
        </ScrollView>
      </RouteAccessGate>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: STEP.s4 },
  top: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  section: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  links: { gap: STEP.s1, marginTop: STEP.s2 },
  redrawWrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  redraw: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    minHeight: CONTROL.buttonPrimary,
    borderTopWidth: 1,
  },
  flex: { flex: 1 },
});
