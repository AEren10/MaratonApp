import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, RADIUS } from "../../../themes/tokens";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import * as haptic from "../../../lib/haptics";

// Bugünün önceliği — kimlik renkli hero kart.
// Urgency tier'a göre badge:
//   - red:   "🚨 Bayadır dönmedin"
//   - amber: gün uyarısı
//   - blue:  düzenli tekrar
// task: { topicLabel, subjectLabel, reason, subject, rkind, urgencyDays }
// plan: { dersler, hours }
export function PriorityCard({ task, plan, onStart }) {
  const C = useC();
  const subjectId = useSubjectIdentity(task?.subject);
  const title = task?.topicLabel || task?.subjectLabel || "Günlük plan";
  const reason = task?.reason || (plan ? `${plan.dersler} ders · ${plan.hours}` : "Çalışmaya hazır mısın?");

  // Tier rengi — engine'in verdiği `badge` öncelikli, yoksa rkind'den türet
  const tier =
    task?.tier === "critical" || task?.rkind === "red"
      ? { color: C.red,    bg: C.red + "12",    label: task?.badge || "ACİL"   } :
    task?.tier === "high" || task?.rkind === "amber"
      ? { color: C.amber,  bg: C.amber + "14",  label: task?.badge || "DİKKAT" } :
    task?.rkind === "blue"
      ? { color: C.blue,   bg: C.blue + "12",   label: task?.badge || "DÜZENLİ" } :
      { color: subjectId?.solid || C.purple, bg: subjectId?.tint || C.purple + "10", label: task?.badge || "BUGÜN" };

  const onStartHandler = () => { haptic.tap(); onStart?.(); };

  const gradientColors = [tier.color, tier.color + "BB"];

  return (
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={s.headRow}>
        <View style={[s.tierChip, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
          <Text style={[s.tierText, { color: "#FFFFFF" }]}>{tier.label}</Text>
        </View>
        <Text style={[s.label, { color: "rgba(255,255,255,0.8)" }]}>BUGÜNÜN ÖNCELİĞİ</Text>
      </View>

      <Text style={[s.title, { color: "#FFFFFF" }]} numberOfLines={2}>{title}</Text>
      <Text style={[s.reason, { color: "rgba(255,255,255,0.75)" }]} numberOfLines={2}>{reason}</Text>

      <Pressable
        onPress={onStartHandler}
        style={({ pressed }) => [
          s.btn,
          { backgroundColor: "rgba(255,255,255,0.22)" },
          pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
        ]}
      >
        <Text style={s.btnText}>Çalışmaya Başla</Text>
        <Icon name="arrowR" size={18} color="#FFFFFF" sw={2.5} />
      </Pressable>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: RADIUS.xxl, padding: 20, overflow: "hidden" },
  headRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  tierChip: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  tierText: { ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  label: { ...TYPOGRAPHY.micro, letterSpacing: 0.6 },
  title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24, marginTop: 4, letterSpacing: -0.5 },
  reason: { ...TYPOGRAPHY.caption, marginTop: 6, lineHeight: 18 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: RADIUS.xl, paddingVertical: 15, marginTop: 18,
  },
  btnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" },
});
