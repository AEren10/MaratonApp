import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const WEEKDAYS_SHORT_TR = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];

function MonthPlanGrid({ C, cells }) {
  // Image 3 mockup days if cells is undefined
  const defaultDays = Array.from({ length: 30 }, (_, i) => ({
    key: String(i),
    day: i + 1,
    count: i % 7 === 6 ? 0 : (i % 7 === 1 ? 1 : 2) // pazarlar bos, salı 1 durak, digerleri 2 durak (örnek)
  }));
  const days = cells?.days || defaultDays;
  const leading = cells?.leading ?? 1; // Eylül 2026 starts on Tuesday (1 leading empty cell)

  const gridCells = [...Array(leading).fill(null), ...days];
  while (gridCells.length % 7) gridCells.push(null);

  const look = (count) => (count >= 2
    ? { backgroundColor: C.brandTint, borderColor: C.bandEdge }
    : count === 1
      ? { backgroundColor: C.surface, borderColor: C.elev }
      : { backgroundColor: C.void, borderColor: C.line });

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <View style={s.week}>
        {WEEKDAYS_SHORT_TR.map((w) => (
          <Text key={w} style={[TYPOGRAPHY.tableHead, s.head, { color: C.text3 }]}>{w}</Text>
        ))}
      </View>
      <View style={s.grid}>
        {gridCells.map((d, i) => (
          <View key={d?.key || \e\\} style={s.cellWrap}>
            {d ? (
              <View
                accessible
                accessibilityLabel={\\, \ durak\}
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

const s = StyleSheet.create({
  week: { flexDirection: "row", paddingHorizontal: STEP.s2, marginBottom: STEP.s2 },
  head: { flex: 1, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: { width: "14.28%", aspectRatio: 1, padding: 3 },
  cell: { flex: 1, borderRadius: SHAPE.cardTight, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  num: { fontFamily: "Archivo_500", fontSize: 13 },
  dots: { flexDirection: "row", gap: 2, position: "absolute", bottom: 6 },
  dot: { width: 4, height: 4, borderRadius: 1 },
});
