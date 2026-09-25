import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { SHAPE, STEP } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

function formatNum(n) {
  if (n == null || isNaN(n)) return "0,00";
  return Number(n).toFixed(2).replace(".", ",");
}

function formatDelta(n) {
  if (n == null || isNaN(n)) return "+0,0";
  const sign = n >= 0 ? "+" : "-";
  return `${sign}${Math.abs(n).toFixed(1).replace(".", ",")}`;
}

export function TrialHistoryItem({ C, item, onPress }) {
  const isUp = item.trend >= 0;
  const dc = isUp ? C.up : C.down;

  return (
    <Press haptic="none"
      accessibilityRole="button"
      accessibilityLabel={`${item.type} deneme detayı`}
      onPress={onPress}
      style={[s.row, { borderTopColor: C.line }]}
    >
      <View style={s.rowContent}>
        <View style={s.metaRow}>
          <Text style={[s.typeLabel, { color: C.text2 }]}>{item.type}</Text>
          <Text style={[s.dateLabel, { color: C.text3 }]}>{item.date}</Text>
          {item.latest && (
            <View style={[s.latestBadge, { backgroundColor: C.elev }]}>
              <Text style={[s.latestText, { color: C.text2 }]}>EN SON</Text>
            </View>
          )}
        </View>

        <View style={s.scoreRow}>
          <Text style={[s.netText, { color: C.text }]}>{formatNum(item.net)}</Text>
          <View style={s.deltaWrap}>
            <Icon name={isUp ? "trendUp" : "trendDown"} size={10} color={dc} sw={2} />
            <Text style={[s.deltaText, { color: dc }]}>{formatDelta(item.trend)}</Text>
          </View>
        </View>
      </View>

      <Text style={[s.moodText, { color: C.text3 }]}>{item.mood}</Text>
      <Icon name="chevR" size={14} color={C.text5 || C.text4} />
    </Press>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s3,
    borderTopWidth: 1,
  },
  rowContent: { flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  typeLabel: { fontFamily: "Archivo_700", fontSize: 11.5, letterSpacing: 1.84 },
  dateLabel: { fontFamily: "Archivo_500", fontSize: 11.5 },
  latestBadge: { height: 18, paddingHorizontal: STEP.s1, borderRadius: SHAPE.chip, alignItems: "center", justifyContent: "center" },
  latestText: { fontFamily: "Archivo_700", fontSize: 11.5, letterSpacing: 1.4 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginTop: 4 },
  netText: { fontFamily: "Bricolage_400", fontSize: 24, fontVariant: ["tabular-nums"] },
  deltaWrap: { flexDirection: "row", alignItems: "center", gap: 3 },
  deltaText: { fontFamily: "Archivo_600", fontSize: 12, fontVariant: ["tabular-nums"] },
  moodText: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.5 },
});