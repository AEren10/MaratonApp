import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function WeeklyGains() {
  const C = useC();
  
  const gains = [
    { label: "412 soru çözüldü", xp: "+206" },
    { label: "2 deneme girildi", xp: "+120" },
    { label: "7 gün seri korundu", xp: "+70" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2, flex: 1 }]}>BU HAFTA KAZANILAN</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "right", width: 120 }]}>
          soru x0,5 · deneme x60 · seri x10
        </Text>
      </View>
      
      <View style={styles.list}>
        {gains.map((gain, i) => (
          <Card key={i} tone="surface" radius="sheet" style={styles.card}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>{gain.label}</Text>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>{gain.xp}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: STEP.s4 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: STEP.s3, gap: STEP.s2 },
  list: { gap: STEP.s2 },
  card: { flexDirection: "row", alignItems: "center", paddingHorizontal: STEP.s3, paddingVertical: 18 }
});
