import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: "SANA NE GONDERIRIZ" karti listesi (label="Bildirim Izni").
const ITEMS = [
  { key: "predict", dotKey: "accent", text: "“Tahminin 71'den 73'e çıktı.”" },
  { key: "repeat", dotKey: "matematik", text: "“Bugün 6 soru tekrar zamanı.”" },
  { key: "stop", dotKey: "warn", text: "“Bekleyen iki durağın hazır.”" },
  { key: "report", dotKey: "up", text: "“Haftalık raporun hazır.”" },
];

function dotColor(C, key) {
  if (key === "accent") return C.accent;
  if (key === "matematik") return C.subjects?.matematik || C.accent;
  if (key === "warn") return C.warn;
  if (key === "up") return C.up;
  return C.accent;
}

export function NotificationBenefitList() {
  const C = useC();
  return (
    <View style={{ gap: STEP.s1 }}>
      {ITEMS.map((item) => (
        <View
          key={item.key}
          style={[styles.row, { backgroundColor: C.surface, borderColor: C.elev }]}
        >
          <View style={[styles.dot, { backgroundColor: dotColor(C, item.dotKey) }]} />
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2, flex: 1 }]}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 1, flexShrink: 0 },
});
