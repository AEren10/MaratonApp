import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER } from "../../../themes/tokens";
import { SubjectCardItem } from "./SubjectCardItem";
import { PendingSection } from "../../../components/common/PendingSection";

export function SubjectTrendCards({ C, bars = [], onSelectSubject }) {
  // Buradaki kartlar bir zamanlar sabit bir ornek listeden besleniyordu ve
  // gercek veri gelse bile trend oku ile mini grafigi O listeden esliyordu.
  // Artik yalniz analysisModel ne hesapladiysa o: hesaplanamayan alan null,
  // kart da o parcayi cizmiyor.
  const cards = useMemo(
    () => (bars || []).map((b) => ({
      key: b.key,
      name: b.name,
      color: b.color || C.accent,
      net: b.net || 0,
      delta: b.delta,
      lo: b.lo,
      hi: b.hi,
      series: b.series,
    })),
    [bars, C],
  );

  if (!cards.length) {
    return (
      <PendingSection
        label="DERS BAZLI TREND"
        title="Ders netlerin henüz yok"
        note="Bir deneme girdiğinde her dersin neti burada ayrı ayrı görünür."
      />
    );
  }
  return (
    <View style={s.wrap}>
      <Text style={[s.sectionLabel, { color: C.text2 }]}>DERS BAZLI TREND</Text>
      <View style={s.list}>
        {cards.map((c) => (
          <SubjectCardItem key={c.key} C={C} card={c} onPress={() => onSelectSubject(c)} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: 26 },
  sectionLabel: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.84, textTransform: "uppercase" },
  list: { gap: 10, marginTop: 14 },
});