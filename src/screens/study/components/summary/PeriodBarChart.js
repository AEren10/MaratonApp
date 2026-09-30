import { View, Text, StyleSheet } from "react-native";
import { GrowBar } from "./GrowBar";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";

const PLOT_HEIGHT = 130;
const MIN_BAR = 4;

export function PeriodBarChart({ label, trailing, trailingTone = "up", bars = [], average = null }) {
  const C = useC();
  if (!bars.length) return null;
  const getVal = (b) => (b.value != null ? b.value : b.minutes != null ? b.minutes : (b.questions || 0));
  const getTopText = (b) => {
    if (b.labelTop) return b.labelTop;
    if (b.minutes != null && b.value != null) {
      return b.minutes >= 60
        ? `${Math.floor(b.minutes / 60)}s${b.minutes % 60 ? `${b.minutes % 60}d` : ""}`
        : `${b.minutes}d`;
    }
    return b.questions > 0 ? String(b.questions) : "";
  };
  const max = Math.max(1, ...bars.map(getVal));
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
          {bars.map((bar, i) => {
            const val = getVal(bar);
            const hasVal = val > 0;
            const topText = getTopText(bar);
            const barHeight = hasVal
              ? Math.max(MIN_BAR, Math.round((val / max) * PLOT_HEIGHT))
              : MIN_BAR;

            const barColor = bar.highlight
              ? C.accentBright
              : hasVal
              ? C.accent
              : C.track;

            return (
              <View key={bar.key} style={styles.col}>
                {hasVal && topText ? (
                  <Text
                    style={[
                      TYPOGRAPHY.micro,
                      styles.valTop,
                      { color: bar.highlight ? C.accentBright : C.text },
                    ]}
                  >
                    {topText}
                  </Text>
                ) : (
                  <View style={styles.valPlaceholder} />
                )}

                <GrowBar
                  index={i}
                  count={bars.length}
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      width: hasVal ? "100%" : "60%",
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
        {bars.map((bar) => {
          const hasQuestions = bar.questions > 0;
          return (
            <View key={bar.key} style={styles.dayCol}>
              <Text
                style={[
                  TYPOGRAPHY.tableHead,
                  styles.dayLabel,
                  { color: bar.highlight ? C.accentBright : hasQuestions ? C.text2 : C.text3 },
                ]}
              >
                {bar.label}
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
