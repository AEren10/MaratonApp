import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER, STEP } from "../../../themes/tokens";
import { PendingSection } from "../../../components/common/PendingSection";

export function AnalysisInsightsCard({ C, insights }) {
  // Bu karta hicbir zaman gercek icgoru gecilmedi: herkese ayni uc cumle
  // yaziliyordu ("Matematik netin son 5 denemede dususte"), hesap yeni olsa
  // bile. Gercek icgoru uretimi baglanana kadar durust hali gosteriyoruz.
  if (!insights?.length) {
    return (
      <PendingSection
        label="BU HAFTA NE OKUYORUZ"
        title="Okunacak bir şey birikmedi"
        note="Çalışma ve deneme kaydettikçe buraya haftalık çıkarımlar düşer."
      />
    );
  }

  const items = insights;

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