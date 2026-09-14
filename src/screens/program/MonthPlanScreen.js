import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Skeleton } from "../../components/design";
import { EyebrowHeader } from "../../components/common/EyebrowHeader";
import PillTabs from "../../components/common/PillTabs";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { useMonthPlan } from "../../hooks/useMonthPlan";
import { formatNumber } from "../../lib/format";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import MonthPlanGrid from "./components/MonthPlanGrid";
import MonthWeightList from "./components/MonthWeightList";

const TABS = [{ key: "week", label: "Hafta" }, { key: "month", label: "Ay" }];
const LEGEND = [["İki durak", "brandTint", "bandEdge"], ["Bir durak", "surface", "elev"], ["Boş gün", "void", "line"]];

// Tasarim AKIS 7 · "Aylık Plan" — Program'in ay sekmesi.
function MonthPlanInner() {
  const C = useC();
  const navigation = useNavigation();
  const { params } = useRoute();
  const m = useMonthPlan(Number(params?.monthOffset) || 0);
  const toWeek = () => navigation.navigate(SCREENS.DAILY_PLAN);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <EyebrowHeader label="PROGRAM" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <PillTabs options={TABS} value="month" onChange={toWeek} />
        {m.loading ? (
          <Skeleton height={420} radius={SHAPE.panel} style={s.block} />
        ) : (
          <Animated.View entering={FadeInDown.duration(600)}>
            <View style={[s.hero, s.block]}>
              <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]} allowFontScaling={false}>{m.totalStops}</Text>
              <View style={s.heroCopy}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>durak planlandı</Text>
                <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{`${m.monthName} · ${m.workDays} çalışma günü`}</Text>
              </View>
              <View style={s.heroSide}>
                <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{formatNumber(m.totalQuestions)}</Text>
                <Text style={[TYPOGRAPHY.tableHead, { color: C.text3, letterSpacing: 0 }]}>soru</Text>
              </View>
            </View>
            <View style={s.monthNav}>
              <Pressable onPress={m.prev} accessibilityRole="button" accessibilityLabel="Önceki ay" style={s.tap}>
                <Icon name="chevL" size={14} color={C.text3} />
              </Pressable>
              <Text style={[TYPOGRAPHY.subheading, s.monthTitle, { color: C.text }]}>{m.title}</Text>
              <Pressable onPress={m.next} accessibilityRole="button" accessibilityLabel="Sonraki ay" style={s.tap}>
                <Icon name="chevR" size={14} color={C.text3} />
              </Pressable>
            </View>
            <MonthPlanGrid days={m.days} leading={m.leading} />
            <View style={s.legend}>
              {LEGEND.map(([label, bg, bd]) => (
                <View key={label} style={s.legendItem}>
                  <View style={[s.swatch, { backgroundColor: C[bg], borderColor: C[bd] }]} />
                  <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{label}</Text>
                </View>
              ))}
            </View>
            {m.hasStops ? <MonthWeightList weights={m.weights} /> : null}
          </Animated.View>
        )}
        <Pressable onPress={toWeek} accessibilityRole="button" style={s.back}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Haftalık görünüme dön</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function MonthPlanScreen() {
  return (
    <ScreenErrorBoundary>
      <MonthPlanInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 4, paddingBottom: STEP.s4 },
  block: { marginTop: STEP.s4 - 6 },
  hero: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2 + 2 },
  heroCopy: { flex: 1, gap: STEP.s1 / 2, paddingBottom: STEP.s1 - 2 },
  heroSide: { alignItems: "flex-end", paddingBottom: STEP.s1 - 2 },
  monthNav: { flexDirection: "row", alignItems: "center", marginTop: STEP.s3 + 6, marginBottom: STEP.s2 },
  tap: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  monthTitle: { flex: 1, textAlign: "center", fontSize: TYPOGRAPHY.subheading.fontSize - 3 },
  legend: { flexDirection: "row", flexWrap: "wrap", columnGap: STEP.s3 - 2, rowGap: STEP.s1 + 2, marginTop: STEP.s3 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: STEP.s1 - 1 },
  swatch: { width: 12, height: 12, borderRadius: SHAPE.chip - 2, borderWidth: 1 },
  back: { alignItems: "center", justifyContent: "center", minHeight: CONTROL.tapMin + 4, marginTop: STEP.s4 - 8 },
});
