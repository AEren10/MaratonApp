import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Kutusuz bos hal: duz metin + oneri (kirmizi cerceve yok).
export function PlanDetailEmptyState({ C }) {
  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.subheading, { color: C.text, textAlign: "center" }]}>
        Bu gün için henüz durak yok.
      </Text>
      <Text style={[TYPOGRAPHY.body, { color: C.text3, textAlign: "center", marginTop: STEP.s1 }]}>
        İstersen 20 dakikalık bir dönüş durağı ekleyebilirsin.
      </Text>

      <View style={[s.recom, { borderTopColor: C.line }]}>
        <View style={s.recomHead}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ÖNERİLEN</Text>
          <View style={s.timeRow}>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>20</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>dk</Text>
          </View>
        </View>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accentText }]}>
          20 dakikalık dönüş durağı
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 2 }]}>
          10 dakika konu tekrarı · 10 soru
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  recom: { borderTopWidth: 1, marginTop: STEP.s4, paddingTop: STEP.s3 },
  recomHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: STEP.s2,
  },
  timeRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 / 2 },
});
