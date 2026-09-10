import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

const CHART_HEIGHT = 120;

export function SummaryWeeklyChart({ bars, deltaPct, loading }) {
  const C = useC();
  if (loading || !bars?.length) return null;

  const max = Math.max(1, ...bars.map((b) => b.questions));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>SON 7 GÜN · SORU</Text>
        <View style={[styles.line, { backgroundColor: C.line }]} />
        {deltaPct != null ? (
          <Text style={[TYPOGRAPHY.meta, { color: deltaPct >= 0 ? C.up : C.down, fontWeight: "600" }]}>
            {deltaPct >= 0 ? "+" : ""}{deltaPct}%
          </Text>
        ) : null}
      </View>

      <View style={styles.bars}>
        {bars.map((bar, i) => {
          const h = Math.max(4, Math.round((bar.questions / max) * CHART_HEIGHT));
          const isToday = i === bars.length - 1;
          return (
            <View key={bar.date} style={styles.barCol}>
              <Animated.View
                entering={FadeIn.delay(i * 40).duration(400)}
                style={[
                  styles.bar,
                  { height: h, backgroundColor: isToday ? C.accent : C.brandTint },
                ]}
              />
              <Text style={[TYPOGRAPHY.micro, { color: isToday ? C.text : C.text3, marginTop: STEP.s1 }]}>
                {bar.questions}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  header: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginBottom: STEP.s3 },
  line: { flex: 1, height: 1 },
  bars: { flexDirection: "row", gap: STEP.s1, alignItems: "flex-end", height: CHART_HEIGHT + 20 },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 8 },
});
