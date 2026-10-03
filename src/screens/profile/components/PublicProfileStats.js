import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const items = (profile) => [
  { value: profile.currentStreak, label: "GÜN SERİ" },
  { value: profile.weeklyQuestions, label: "SORU / HAFTA" },
  { value: profile.weeklyMinutes, label: "DAKİKA / HAFTA" },
];

export function PublicProfileStats({ profile }) {
  const C = useC();
  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      {items(profile).map((item, index) => (
        <View
          key={item.label}
          style={[styles.item, index > 0 && { borderLeftWidth: 1, borderLeftColor: C.line }]}
        >
          <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]}>{item.value}</Text>
          <Text style={[TYPOGRAPHY.micro, styles.label, { color: C.text3 }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", marginHorizontal: GUTTER, marginTop: STEP.s3,
    borderWidth: 1, borderRadius: SHAPE.card, paddingVertical: STEP.s3,
  },
  item: { flex: 1, alignItems: "center", paddingHorizontal: STEP.s1 },
  label: { marginTop: 4, textAlign: "center" },
});
