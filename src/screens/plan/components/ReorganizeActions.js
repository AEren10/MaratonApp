import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export function ReorganizeScheduleCard({ onPress, C }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Haftalık ders programını düzenle"
      style={({ pressed }) => [
        s.scheduleCard,
        {
          backgroundColor: pressed ? C.elev : C.surface,
          borderColor: C.elev,
        },
      ]}
    >
      <View style={[s.cardIconBox, { backgroundColor: C.brandTint }]}>
        <Icon name="calendar" size={18} color={C.accent} />
      </View>
      <View style={s.cardContent}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Haftalık Ders Programı</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 4 }]}>
          Hangi gün kaç saat çalışacağını şablondan ayarla
        </Text>
      </View>
      <Icon name="chevR" size={16} color={C.text3} />
    </Pressable>
  );
}

export function ReorganizeClearButton({ onPress, C }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.clearCard, { backgroundColor: C.elev, borderColor: C.line }]}
      accessibilityRole="button"
      accessibilityLabel="Kalan durakları temizle"
    >
      <Icon name="trash" size={16} color={C.text3} />
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2, flex: 1 }]}>
        Kalan durakları temizle
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    gap: STEP.s3,
  },
  cardIconBox: {
    width: STEP.s5,
    height: STEP.s5,
    borderRadius: SHAPE.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1 },
  clearCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    padding: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    marginTop: STEP.s4,
  },
});
