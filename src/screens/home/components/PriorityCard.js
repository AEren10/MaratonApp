import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";
import * as haptic from "../../../lib/haptics";

const FOREST = "#1E3A33";
const CREAM = "#FBF1DC";

// Ekranın tek "yıldız" kartı — solid krem, koyu orman yazı + başla CTA.
// task: { topicLabel, subjectLabel, reason } | plan: { dersler, hours }
export function PriorityCard({ task, plan, onStart }) {
  const title = task?.topicLabel || task?.subjectLabel || "Günlük plan";
  const reason = task?.reason || (plan ? `${plan.dersler} ders · ${plan.hours}` : "Çalışmaya hazır mısın?");

  return (
    <View style={s.card}>
      <Text style={s.label}>BUGÜNÜN ÖNCELİĞİ</Text>
      <Text style={s.title} numberOfLines={2}>{title}</Text>
      <Text style={s.reason} numberOfLines={1}>{reason}</Text>

      <Pressable
        onPress={() => { haptic.tap(); onStart(); }}
        style={({ pressed }) => [s.btn, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}
      >
        <Text style={s.btnText}>Çalışmaya Başla</Text>
        <Icon name="arrowR" size={18} color={CREAM} sw={2.5} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, backgroundColor: CREAM },
  label: { ...TYPOGRAPHY.micro, color: "#5C7A6E", letterSpacing: 0.6 },
  title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, color: FOREST, marginTop: 6, letterSpacing: -0.5 },
  reason: { ...TYPOGRAPHY.caption, color: "#6E8C80", marginTop: 4 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: FOREST, borderRadius: 15, paddingVertical: 14, marginTop: 18,
  },
  btnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: CREAM },
});
