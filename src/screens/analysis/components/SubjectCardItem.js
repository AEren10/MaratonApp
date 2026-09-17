import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { SubjectSparklineSvg } from "./SubjectSparklineSvg";

function formatNum(n) {
  if (n == null || isNaN(n)) return "0,00";
  return Number(n).toFixed(2).replace(".", ",");
}

function formatDelta(n) {
  if (n == null || isNaN(n)) return "+0,00";
  const sign = n >= 0 ? "+" : "-";
  return `${sign}${Math.abs(n).toFixed(2).replace(".", ",")}`;
}

export function SubjectCardItem({ C, card, onPress }) {
  const isUp = (card.delta ?? 0) >= 0;
  const dc = isUp ? C.up : C.down;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${card.name} trend detayı`}
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        { backgroundColor: C.surface, borderColor: pressed ? C.border : C.elev },
      ]}
    >
      <View style={s.cardTop}>
        <View style={[s.dot, { backgroundColor: card.color }]} />
        <Text style={[s.name, { color: C.text }]}>{card.name}</Text>
        <Text style={[s.net, { color: C.text }]}>{formatNum(card.net)}</Text>
        <View style={[s.badge, { backgroundColor: C.void }]}>
          <Icon name={isUp ? "trendUp" : "trendDown"} size={10} color={dc} sw={2.2} />
          <Text style={[s.badgeText, { color: dc }]}>{formatDelta(card.delta)}</Text>
        </View>
      </View>

      <SubjectSparklineSvg series={card.series} color={card.color} />

      <View style={s.cardBottom}>
        <Text style={[s.boundText, { color: C.text3 }]}>{formatNum(card.lo)} en düşük</Text>
        <Text style={[s.boundText, { color: C.text3 }]}>{formatNum(card.hi)} en yüksek</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 9, height: 9, borderRadius: 1 },
  name: { flex: 1, fontFamily: "Archivo_500", fontSize: 14.5 },
  net: { fontFamily: "Bricolage_400", fontSize: 24, fontVariant: ["tabular-nums"] },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, height: 26, paddingHorizontal: 8, borderRadius: 6 },
  badgeText: { fontFamily: "Archivo_600", fontSize: 11, fontVariant: ["tabular-nums"] },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  boundText: { fontFamily: "Archivo_500", fontSize: 11.5 },
});