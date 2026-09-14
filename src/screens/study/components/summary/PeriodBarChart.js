import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../../themes/tokens";

const CHART_HEIGHT = 146;
const MIN_BAR = 2;

// "SON 7 GÜN · SORU" / "GÜNLERİN" / "HAFTA HAFTA SORU": basliga yapisik cizgi,
// sagda ozet; cubuk altinda deger ve etiket. average verilirse kesik ORT cizgisi.
export function PeriodBarChart({ label, trailing, trailingTone = "up", bars = [], average = null }) {
  const C = useC();
  if (!bars.length) return null;
  const max = Math.max(1, ...bars.map((b) => b.questions));
  const avgBottom = average ? Math.round((average / max) * CHART_HEIGHT) : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: C.line }]} />
        {trailing ? (
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: trailingTone === "up" ? C.up : C.text3 }]}>{trailing}</Text>
        ) : null}
      </View>

      <View style={styles.plot}>
        <View style={styles.bars}>
          {bars.map((bar, i) => (
            <View key={bar.key} style={styles.col}>
              <Animated.View
                entering={FadeInDown.delay(i * 40).duration(500)}
                style={[styles.bar, {
                  height: Math.max(MIN_BAR, Math.round((bar.questions / max) * CHART_HEIGHT)),
                  backgroundColor: bar.highlight ? C.accent : C.barIdle,
                }]}
              />
            </View>
          ))}
        </View>
        {avgBottom != null ? (
          <>
            <View pointerEvents="none" style={[styles.avgLine, { bottom: avgBottom, borderColor: C.text4 }]} />
            <Text style={[TYPOGRAPHY.tableHead, styles.avgLabel, { bottom: avgBottom + 4, color: C.text3, backgroundColor: C.bg }]}>
              ORT {average}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.bars}>
        {bars.map((bar) => (
          <View key={bar.key} style={[styles.col, styles.meta]}>
            <Text style={[TYPOGRAPHY.micro, { color: bar.highlight ? C.text : C.text3 }]}>{bar.questions}</Text>
            <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{bar.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginBottom: STEP.s3 },
  line: { flex: 1, height: 1 },
  plot: { height: CHART_HEIGHT },
  bars: { flexDirection: "row", gap: STEP.s1, alignItems: "flex-end" },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: CHART_HEIGHT },
  bar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  avgLine: { position: "absolute", left: 0, right: 0, height: 0, borderTopWidth: 1, borderStyle: "dashed" },
  avgLabel: { position: "absolute", right: 0, paddingHorizontal: STEP.s1 / 2 },
  meta: { height: undefined, gap: STEP.s1 / 2, marginTop: STEP.s1 },
});
