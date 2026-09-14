import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { WEEKDAYS_SHORT_TR } from "../../../lib/trWords";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Aylik Plan izgarasi: iki+ durak tint, bir durak surface, bos gun void.
// Durak sayisi nokta olarak (en fazla iki).
function MonthPlanGrid({ days, leading }) {
  const C = useC();
  const cells = [...Array(leading).fill(null), ...days];
  while (cells.length % 7) cells.push(null);

  const look = (count) => (count >= 2
    ? { backgroundColor: C.brandTint, borderColor: C.bandEdge }
    : count === 1
      ? { backgroundColor: C.surface, borderColor: C.elev }
      : { backgroundColor: C.void, borderColor: C.line });

  return (
    <View>
      <View style={s.week}>
        {WEEKDAYS_SHORT_TR.map((w) => (
          <Text key={w} style={[TYPOGRAPHY.tableHead, s.head, { color: C.text3 }]}>{w}</Text>
        ))}
      </View>
      <View style={s.grid}>
        {cells.map((d, i) => (
          <View key={d?.key || `e${i}`} style={s.cellWrap}>
            {d ? (
              <View
                accessible
                accessibilityLabel={`${d.day}, ${d.count} durak`}
                style={[s.cell, look(d.count)]}
              >
                <Text style={[TYPOGRAPHY.meta, s.num, { color: d.count ? C.text : C.text3 }]}>{d.day}</Text>
                <View style={s.dots}>
                  {Array.from({ length: Math.min(2, d.count) }, (_, k) => (
                    <View key={k} style={[s.dot, { backgroundColor: C.accent }]} />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default memo(MonthPlanGrid);

const DOT = 4;

const s = StyleSheet.create({
  week: { flexDirection: "row", marginBottom: STEP.s1 + 2 },
  head: { flex: 1, textAlign: "center", letterSpacing: 1.1 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: STEP.s1 / 2 - 1 },
  cell: { flex: 1, borderRadius: SHAPE.button, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: STEP.s1 / 2 - 1 },
  num: { fontVariant: ["tabular-nums"] },
  dots: { flexDirection: "row", gap: STEP.s1 / 4, height: DOT },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 4 },
});
