import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Skeleton, Button } from "../../components/design";
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
              <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]} allowFontScaling={false}>{m.totalStops || 43}</Text>
              <View style={s.heroCopy}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>durak planlandı</Text>
                <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{`${m.totalHours || 72} sa · ${m.activeDays || 26} çalışma günü`}</Text>
              </View>
              <View style={s.heroSide}>
                <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{formatNumber(m.totalQuestions || 3100)}</Text>
                <Text style={[TYPOGRAPHY.tableHead, { color: C.text3, letterSpacing: 0 }]}>soru</Text>
              </View>
            </View>
            <View style={s.monthNav}>
              <Pressable onPress={m.prev} accessibilityRole="button" accessibilityLabel="Önceki ay" style={s.tap}>
                <Icon name="chevL" size={16} color={C.text3} />
              </Pressable>
              <Text style={[TYPOGRAPHY.topicName, { color: C.text, fontVariant: ["tabular-nums"] }]}>
                {m.title || "Eylül 2026"}
              </Text>
              <Pressable onPress={m.next} accessibilityRole="button" accessibilityLabel="Sonraki ay" style={s.tap}>
                <Icon name="chevR" size={16} color={C.text3} />
              </Pressable>
            </View>
            <MonthPlanGrid C={C} cells={m.cells} />
            <View style={s.legend}>
              {LEGEND.map(([label, bgToken, borderToken]) => (
                <View key={label} style={s.legendItem}>
                  <View style={[s.legendBox, { backgroundColor: C[bgToken], borderColor: C[borderToken] }]} />
                  <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={[s.block, s.weights]}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2, marginBottom: STEP.s3 }]}>AYIN AĞIRLIĞI</Text>
              <MonthWeightList C={C} weights={m.weights} />
            </View>
            <View style={[s.note, { backgroundColor: C.surface, borderColor: C.elev }]}>
              <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
                Deneme provası olan pazarlar boş bırakıldı. Bir gün kaçarsa durak sonraki boş güne kayar, ay toplamı değişmez.
              </Text>
            </View>
            <View style={s.actions}>
              <Button variant="primary" size="lg" fullWidth>
                Eylül planını onayla
              </Button>
              <Button variant="ghost" size="md" fullWidth onPress={toWeek}>
                Haftalık görünüme dön
              </Button>
            </View>
          </Animated.View>
        )}
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
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s4 },
  block: { marginTop: STEP.s4 },
  hero: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  heroCopy: { flex: 1 },
  heroSide: { alignItems: "flex-end" },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: STEP.s5, paddingHorizontal: STEP.s2 },
  tap: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  legend: { flexDirection: "row", gap: STEP.s3, marginTop: STEP.s3, paddingHorizontal: STEP.s1 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendBox: { width: 14, height: 14, borderRadius: 3, borderWidth: 1 },
  weights: { marginTop: STEP.s5 },
  note: { marginTop: STEP.s4, paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  actions: { marginTop: STEP.s4, gap: STEP.s1 },
});
