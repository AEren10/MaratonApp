import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

const MILESTONES = [
  { days: 365, emoji: "🏁", message: "Maraton başladı!" },
  { days: 180, emoji: "📅", message: "6 ay kaldı — tempoyu artır" },
  { days: 100, emoji: "💯", message: "Son 100 gün!" },
  { days: 60, emoji: "⚡", message: "Son 60 gün — yoğunlaş" },
  { days: 30, emoji: "🔥", message: "Son 30 gün — full gaz!" },
  { days: 14, emoji: "⏰", message: "Son 2 hafta — tekrar odaklı" },
  { days: 7, emoji: "🎯", message: "Son hafta — sakin ve odaklı" },
  { days: 1, emoji: "🌟", message: "Yarın sınav — erken yat!" },
  { days: 0, emoji: "🚀", message: "Bugün sınav günü! Başarılar!" },
];

function getMilestone(days) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (days <= MILESTONES[i].days) return MILESTONES[i];
  }
  return null;
}

function urgencyGradient(days) {
  if (days <= 7) return ["#E23B49", "#C0222E"];
  if (days <= 30) return ["#E8841A", "#D06A08"];
  if (days <= 100) return ["#2D6FE0", "#1A4FAA"];
  return ["#15A86A", "#0D8A52"];
}

export function ExamCountdown({ onPress }) {
  const C = useC();
  const { daysUntilExam, examDate, examType } = useExam();
  if (daysUntilExam == null) return null;

  const gradient = urgencyGradient(daysUntilExam);
  const milestone = getMilestone(daysUntilExam);
  const isExamDay = daysUntilExam <= 0;
  const dateStr = examDate
    ? examDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const pct = Math.max(0, Math.min(1, 1 - daysUntilExam / 365));

  return (
    <Animated.View entering={FadeInDown.delay(160).duration(440).springify().damping(16)}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.94 }}>
        <View style={{
          borderRadius: RADIUS.xxl, overflow: "hidden",
          backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.lg, padding: SPACING.md }}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 68, height: 68, borderRadius: 20,
                alignItems: "center", justifyContent: "center",
                shadowColor: gradient[0], shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
              }}
            >
              {isExamDay ? (
                <Text style={{ fontSize: 30 }}>🚀</Text>
              ) : (
                <>
                  <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, lineHeight: 30, color: "#FFFFFF", letterSpacing: -1 }}>
                    {daysUntilExam}
                  </Text>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 9, color: "rgba(255,255,255,0.9)", letterSpacing: 1 }}>GÜN</Text>
                </>
              )}
            </LinearGradient>

            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>{examType?.toUpperCase() || "YKS"}</Text>
                <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>·</Text>
                <Text style={{ ...TYPOGRAPHY.micro, color: C.sec }}>{dateStr}</Text>
              </View>
              <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 17, color: C.text, letterSpacing: -0.3 }}>
                {isExamDay ? "Bugün sınav günü!" : "Sınava kaldı"}
              </Text>
              {milestone && (
                <View style={{
                  flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
                  backgroundColor: gradient[0] + "14", borderRadius: RADIUS.pill,
                  paddingHorizontal: 10, paddingVertical: 4, marginTop: 2,
                }}>
                  <Text style={{ fontSize: 12 }}>{milestone.emoji}</Text>
                  <Text style={{ ...TYPOGRAPHY.micro, color: gradient[0], fontFamily: "Inter_600SemiBold" }}>{milestone.message}</Text>
                </View>
              )}
            </View>

            <Icon name="chevR" size={18} color={C.muted} />
          </View>

          <View style={{ height: 3, backgroundColor: C.surface2, marginHorizontal: SPACING.md, borderRadius: 2, marginBottom: SPACING.sm }}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${Math.round(pct * 100)}%`, height: 3, borderRadius: 2 }}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
