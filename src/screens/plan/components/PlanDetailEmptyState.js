import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";

// Kutusuz bos hal: duz metin + oneri. Oneriye dokununca ekleme ekrani 25 dk
// secili acilir (eskiden oneri vardi ama eklenemiyordu).
export function PlanDetailEmptyState({ C, onAddRecommended }) {
  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.subheading, { color: C.text, textAlign: "center" }]}>
        Bu gün için henüz durak yok.
      </Text>
      <Text style={[TYPOGRAPHY.body, { color: C.text3, textAlign: "center", marginTop: STEP.s1 }]}>
        İstersen 25 dakikalık bir dönüş durağı ekleyebilirsin.
      </Text>

      <Press haptic="tap" onPress={onAddRecommended} accessibilityRole="button" accessibilityLabel="25 dakikalık dönüş durağı ekle"
        style={[s.recom, { borderTopColor: C.line }]}>
        <View style={s.recomHead}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ÖNERİLEN</Text>
          <View style={s.timeRow}>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>25</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>dk</Text>
          </View>
        </View>
        <View style={s.addRow}>
          <View style={s.flex}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accentText }]}>25 dakikalık dönüş durağı</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 2 }]}>15 dakika konu tekrarı · 10 soru</Text>
          </View>
          <Icon name="plus" size={18} color={C.accentText} />
        </View>
      </Press>
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
  addRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  flex: { flex: 1 },
});
