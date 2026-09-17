import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER, STEP } from "../../../themes/tokens";

export function AnalysisInsightsCard({ C, insights }) {
  const defaultItems = [
    { color: C.down, text: "Matematik netin son 5 denemede düşüşte." },
    { color: C.warn, text: "Bu hafta Matematikte en az çalıştığın konu Permütasyon." },
    { color: C.accent, text: "Defterinde Matematikten 5 tekrar bekliyor." },
  ];

  const items = insights?.length ? insights : defaultItems;

  return (
    <View style={s.wrap}>
      <Text style={[s.sectionLabel, { color: C.text2 }]}>BU HAFTA NE OKUYORUZ</Text>
      <View style={s.list}>
        {items.map((item, idx) => (
          <View key={idx} style={s.row}>
            <View style={[s.dot, { backgroundColor: item.color }]} />
            <Text style={[s.itemText, { color: C.text }]}>{item.text}</Text>
          </View>
        ))}
      </View>
      <Text style={[s.footnote, { color: C.text3 }]}>
        Ders neti trendi, çalışma geçmişin, yanlış defterin ve rota ilerlemesi birlikte okunur.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    paddingTop: 26,
  },
  sectionLabel: {
    fontFamily: "Archivo_600",
    fontSize: 11.5,
    letterSpacing: 1.84, // .16em of 11.5
    textTransform: "uppercase",
  },
  list: {
    gap: 13,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    marginTop: 7,
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    fontFamily: "Bricolage_400",
    fontSize: 15.5,
    lineHeight: 22,
  },
  footnote: {
    fontFamily: "Archivo_400",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 16,
  },
});