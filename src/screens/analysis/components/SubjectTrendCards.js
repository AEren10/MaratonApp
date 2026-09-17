import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER } from "../../../themes/tokens";
import { SubjectCardItem } from "./SubjectCardItem";

export function SubjectTrendCards({ C, bars = [], onSelectSubject }) {
  const cards = useMemo(() => {
    const defaultData = [
      { key: "turkce", name: "Türkçe", color: C.subjects?.turkce || "#74A9E8", net: 32.0, delta: 1.25, lo: 24.5, hi: 32.0, series: [24.5, 27.0, 26.0, 29.5, 30.0, 32.0] },
      { key: "matematik", name: "Matematik", color: C.subjects?.matematik || "#E0A570", net: 16.75, delta: 1.5, lo: 12.25, hi: 16.75, series: [12.25, 13.5, 15.0, 13.0, 15.25, 16.75] },
      { key: "fen", name: "Fen Bilimleri", color: C.subjects?.fizik || "#6ECFC0", net: 5.5, delta: -1.25, lo: 5.5, hi: 8.25, series: [8.25, 7.5, 7.0, 8.0, 6.75, 5.5] },
      { key: "sosyal", name: "Sosyal Bilimler", color: C.subjects?.felsefe || "#A78BFA", net: 6.0, delta: 0.5, lo: 4.5, hi: 6.0, series: [4.5, 5.0, 5.5, 5.25, 5.75, 6.0] },
    ];

    if (!bars || bars.length === 0) return defaultData;

    return bars.map((b) => {
      const match = defaultData.find((d) => d.key === b.key || d.name.toLowerCase() === b.name?.toLowerCase());
      return {
        key: b.key,
        name: b.name,
        color: b.color || match?.color || C.accent,
        net: b.net || match?.net || 0,
        delta: match?.delta || 0,
        lo: match?.lo || Math.max(0, (b.net || 0) - 4),
        hi: match?.hi || Math.max(b.net || 0, 10),
        series: match?.series,
      };
    });
  }, [bars, C]);

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