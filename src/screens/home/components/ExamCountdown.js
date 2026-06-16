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

function getUrgencyColor(days, C) {
  if (days <= 7) return C.red;
  if (days <= 30) return C.amber;
  if (days <= 100) return C.blue;
  return C.green;
}

export function ExamCountdown({ onPress }) {
  const C = useC();
  const { daysUntilExam, examDate, examType } = useExam();

  if (daysUntilExam == null) return null;

  const color = getUrgencyColor(daysUntilExam, C);
  const milestone = getMilestone(daysUntilExam);
  const dateStr = examDate
    ? examDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
    : "";

  return (
    <Pressable onPress={onPress}>
      <View style={{
        borderRadius: RADIUS.xxl,
        padding: SPACING.lg,
        backgroundColor: color + "0D",
        borderWidth: 1,
        borderColor: color + "30",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <View style={{
              width: 40, height: 40, borderRadius: 14,
              backgroundColor: color + "20", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="clock" size={20} color={color} />
            </View>
            <View>
              <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>
                {examType?.toUpperCase() || "YKS"} · {dateStr}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 32, color }}>
                  {daysUntilExam}
                </Text>
                <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.sec }}>gün kaldı</Text>
              </View>
            </View>
          </View>
          <Icon name="chevR" size={16} color={C.muted} />
        </View>

        {milestone && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            marginTop: SPACING.sm, paddingTop: SPACING.sm,
            borderTopWidth: 1, borderTopColor: color + "15",
          }}>
            <Text style={{ fontSize: 16 }}>{milestone.emoji}</Text>
            <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.sec }}>{milestone.message}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
