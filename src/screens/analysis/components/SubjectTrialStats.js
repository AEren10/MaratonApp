import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

function Stat({ label, value, color, C }) {
  return (
    <View style={styles.stat}>
      <Text style={[TYPOGRAPHY.statMedium, { color: color || C.text }]}>{value}</Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 / 2 }]}>{label}</Text>
    </View>
  );
}

export const SubjectTrialStats = React.memo(function SubjectTrialStats({ C, stats }) {
  if (!stats.hasData) return null;

  return (
    <Card tone="surface" style={styles.card}>
      <Stat label="Ort. Net" value={stats.netAvg} C={C} />
      <Stat label="Doğru" value={stats.totalCorrect} C={C} />
      <Stat label="Yanlış" value={stats.totalWrong} C={C} />
      {stats.accuracy !== null && <Stat label="Başarı %" value={stats.accuracy} C={C} />}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: GUTTER,
    marginTop: STEP.s3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: { alignItems: "center", flex: 1 },
});
