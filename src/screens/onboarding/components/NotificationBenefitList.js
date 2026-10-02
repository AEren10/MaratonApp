import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const ITEMS = [
  // Yalniz gercekten gonderilen turler (domain/notify/notificationPlan).
  { key: "daily", dotKey: "matematik", text: "Sıradaki durak seni bekliyor, 15 dakika yeter." },
  { key: "evening", dotKey: "warn", text: "12 günlük serin bu akşam bitmesin." },
  { key: "trial", dotKey: "accent", text: "Son denemen 8 gün önceydi; yenisi rotanı ve tahminini günceller." },
  { key: "report", dotKey: "up", text: "Haftan bitti: kaç saat, kaç soru; pazar akşamı." },
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
    <View style={[styles.container, { borderTopColor: C.line, borderBottomColor: C.line }]}>
      {ITEMS.map((item, index) => (
        <View
          key={item.key}
          style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}
        >
          <View style={[styles.dot, { backgroundColor: dotColor(C, item.dotKey) }]} />
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2, flex: 1 }]}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, borderBottomWidth: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2 + 2,
    minHeight: 44,
  },
  dot: { width: 7, height: 7, borderRadius: 1, flexShrink: 0 },
});
