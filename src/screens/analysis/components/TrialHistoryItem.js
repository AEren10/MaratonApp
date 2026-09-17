import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";

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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.type} deneme detayı`}
      onPress={onPress}
      style={s.row}
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
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#34343F",
  },
  rowContent: { flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeLabel: { fontFamily: "Archivo_700", fontSize: 11.5, letterSpacing: 1.84 },
  dateLabel: { fontFamily: "Archivo_500", fontSize: 11.5 },
  latestBadge: { height: 18, paddingHorizontal: 8, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  latestText: { fontFamily: "Archivo_700", fontSize: 10.5, letterSpacing: 1.4 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", gap: 9, marginTop: 4 },
  netText: { fontFamily: "Bricolage_400", fontSize: 24, fontVariant: ["tabular-nums"] },
  deltaWrap: { flexDirection: "row", alignItems: "center", gap: 3 },
  deltaText: { fontFamily: "Archivo_600", fontSize: 12, fontVariant: ["tabular-nums"] },
  moodText: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.5 },
});