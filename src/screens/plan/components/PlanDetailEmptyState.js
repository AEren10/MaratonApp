import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export function PlanDetailEmptyState({ C }) {
  return (
    <View style={s.wrap}>
      <Card tone="void" radius="panel" style={[s.emptyCard, { borderColor: C.line }]}>
        <Text style={[TYPOGRAPHY.subheading, s.emptyTitle, { color: C.text }]}>Bu gün için henüz durak yok.</Text>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, textAlign: "center" }]}>
          İstersen 20 dakikalık bir dönüş durağı ekleyebilirsin.
        </Text>
      </Card>

      <Card tone="surface" radius="panel" style={[s.recomCard, { borderColor: C.accent }]}>
        <View style={s.recomHead}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ÖNERİLEN</Text>
          <View style={s.timeRow}>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>20</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>dk</Text>
          </View>
        </View>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accent, marginBottom: STEP.s1 / 2 }]}>
          20 dakikalık dönüş durağı
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
          10 dakika konu tekrarı · 10 soru
        </Text>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s2 },
  emptyCard: { marginTop: STEP.s4, padding: STEP.s4, alignItems: "center", borderWidth: 1 },
  emptyTitle: { marginBottom: STEP.s1 },
  recomCard: { marginTop: STEP.s3, padding: STEP.s4, borderWidth: 1 },
  recomHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: STEP.s2 },
  timeRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 / 2 },
});
