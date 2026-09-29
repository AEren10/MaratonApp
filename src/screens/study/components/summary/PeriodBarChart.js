import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";

const PLOT_HEIGHT = 130;
const MIN_BAR = 4;

export function PeriodBarChart({ label, trailing, trailingTone = "up", bars = [], average = null }) {
  const C = useC();
  if (!bars.length) return null;
  const max = Math.max(1, ...bars.map((b) => b.questions));
  const avgBottom = average ? Math.round((average / max) * PLOT_HEIGHT) : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: C.line }]} />
        {trailing ? (
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: trailingTone === "up" ? C.up : C.text3 }]}>
            {trailing}
          </Text>
        ) : null}
      </View>

      <View style={styles.plotArea}>
        <View style={styles.barsRow}>
          {bars.map((bar) => {
            const hasQuestions = bar.questions > 0;
            const barHeight = hasQuestions
              ? Math.max(MIN_BAR, Math.round((bar.questions / max) * PLOT_HEIGHT))
              : MIN_BAR;

            const barColor = bar.highlight
              ? C.accentBright
              : hasQuestions
              ? C.accent
              : C.track;

            return (
              <View key={bar.key} style={styles.col}>
                {hasQuestions ? (
                  <Text
                    style={[
                      TYPOGRAPHY.micro,
                      styles.valTop,
                      { color: bar.highlight ? C.accentBright : C.text2 },
                    ]}
                  >
                    {bar.questions}
                  </Text>
                ) : (
                  <View style={styles.valPlaceholder} />
                )}

                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      width: hasQuestions ? "100%" : 4,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {avgBottom != null ? (
          <>
            <View pointerEvents="none" style={[styles.avgLine, { bottom: avgBottom, borderColor: C.border }]} />
            <View style={[styles.avgBadge, { bottom: avgBottom - 8, backgroundColor: C.surface, borderColor: C.line }]}>
              <Text style={[TYPOGRAPHY.tableHead, { color: C.text2 }]}>
                {`ORT ${average}`}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.daysRow}>
        {bars.map((bar) => (
          <View key={bar.key} style={styles.dayCol}>
            <Text
              style={[
                TYPOGRAPHY.tableHead,
                styles.dayLabel,
                { color: bar.highlight ? C.accentBright : C.text3 },
              ]}
            >
              {bar.label}
            </Text>
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
  plotArea: { height: PLOT_HEIGHT + 24, position: "relative" },
  barsRow: { flexDirection: "row", gap: STEP.s1, alignItems: "flex-end", height: "100%" },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
  valTop: { marginBottom: STEP.s1 / 2, fontVariant: ["tabular-nums"] },
  valPlaceholder: { height: 18 },
  bar: {
    borderTopLeftRadius: SHAPE.chip,
    borderTopRightRadius: SHAPE.chip,
    borderBottomLeftRadius: SHAPE.chip / 2,
    borderBottomRightRadius: SHAPE.chip / 2,
  },
  avgLine: { position: "absolute", left: 0, right: 0, height: 0, borderTopWidth: 1, borderStyle: "dashed" },
  avgBadge: { position: "absolute", right: 0, paddingHorizontal: STEP.s1, paddingVertical: STEP.s1 / 4, borderRadius: SHAPE.chip, borderWidth: 1 },
  daysRow: { flexDirection: "row", gap: STEP.s1, marginTop: STEP.s1 },
  dayCol: { flex: 1, alignItems: "center" },
  dayLabel: { letterSpacing: 0.5 },
});
