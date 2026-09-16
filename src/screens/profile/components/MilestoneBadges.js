import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function MilestoneBadges() {
  const C = useC();
  
  const badges = [
    { value: "10", label: "DURAK" },
    { value: "24", label: "GÜN SERİ" },
    { value: "5", label: "DENEME" },
    { value: "---", label: "İLK 100" },
  ];

  return (
    <View style={styles.container}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2, marginBottom: STEP.s2 }]}>ROZETLERİN</Text>
      <View style={styles.row}>
        {badges.map((badge, i) => (
          <Card key={i} tone="surface" radius="sheet" padded={false} style={styles.badgeCard}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, fontSize: 18, marginBottom: 2 }]}>{badge.value}</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, fontSize: 9, letterSpacing: 0.5 }]}>{badge.label}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: STEP.s4 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: STEP.s1 },
  badgeCard: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    aspectRatio: 0.85 
  }
});
