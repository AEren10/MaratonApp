import { View, Text, Pressable } from "react-native";
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

function urgencyColor(days, C) {
  if (days <= 7) return C.red;
  if (days <= 30) return C.amber;
  if (days <= 100) return C.blue;
  return C.green;
}

export function ExamCountdown({ onPress }) {
  const C = useC();
  const { daysUntilExam, examDate, examType } = useExam();
  if (daysUntilExam == null) return null;

  const color = urgencyColor(daysUntilExam, C);
  const milestone = getMilestone(daysUntilExam);
  const isExamDay = daysUntilExam <= 0;
  const dateStr = examDate
    ? examDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
    : "";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.94 }}>
      <View style={{
        flexDirection: "row", alignItems: "center", gap: SPACING.lg,
        borderRadius: RADIUS.xxl, padding: SPACING.md,
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
      }}>
        {/* Gün karosu — solid renk, beyaz dev rakam */}
        <View style={{
          width: 64, height: 64, borderRadius: 18,
          backgroundColor: color, alignItems: "center", justifyContent: "center",
          shadowColor: color, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.32, shadowRadius: 10, elevation: 4,
        }}>
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
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>
            {examType?.toUpperCase() || "YKS"} · {dateStr}
          </Text>
          <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 17, color: C.text, letterSpacing: -0.3 }}>
            {isExamDay ? "Bugün sınav günü!" : "Sınava kaldı"}
          </Text>
          {milestone && (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
              backgroundColor: color + "18", borderRadius: RADIUS.pill,
              paddingHorizontal: 10, paddingVertical: 4, marginTop: 2,
            }}>
              <Text style={{ fontSize: 12 }}>{milestone.emoji}</Text>
              <Text style={{ ...TYPOGRAPHY.micro, color, fontFamily: "Inter_600SemiBold" }}>{milestone.message}</Text>
            </View>
          )}
        </View>

        <Icon name="chevR" size={18} color={C.muted} />
      </View>
    </Pressable>
  );
}
