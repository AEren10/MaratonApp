import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../../components/design";
import { useExam } from "../../../contexts/ExamContext";
import { useC } from "../../../contexts/ThemeContext";
import { SPACING, RADIUS } from "../../../themes/tokens";

function darken(hex, pct = 0.2) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round((n >> 16) * (1 - pct)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - pct)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - pct)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const MILESTONES = [
  { days: 365, emoji: "\u{1F3C1}", message: "Maraton başladı!" },
  { days: 180, emoji: "\u{1F4C5}", message: "6 ay kaldı — tempoyu artır" },
  { days: 100, emoji: "\u{1F4AF}", message: "Son 100 gün!" },
  { days: 60, emoji: "⚡", message: "Son 60 gün — yoğunlaş" },
  { days: 30, emoji: "\u{1F525}", message: "Son 30 gün — full gaz!" },
  { days: 14, emoji: "⏰", message: "Son 2 hafta — tekrar odaklı" },
  { days: 7, emoji: "\u{1F3AF}", message: "Son hafta — sakin ve odaklı" },
  { days: 1, emoji: "\u{1F31F}", message: "Yarın sınav — erken yat!" },
  { days: 0, emoji: "\u{1F680}", message: "Bugün sınav günü! Başarılar!" },
];

function getMilestone(days) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (days <= MILESTONES[i].days) return MILESTONES[i];
  }
  return null;
}

function urgencyGradient(C, days) {
  if (days <= 7) return [C.danger, darken(C.danger)];
  if (days <= 30) return [C.amber, darken(C.amber)];
  if (days <= 100) return [C.blue, darken(C.blue)];
  return [C.green, darken(C.green)];
}

export function ExamCountdown({ onPress }) {
  const C = useC();
  const { daysUntilExam, examDate, examType } = useExam();
  if (daysUntilExam == null) return null;

  const gradient = urgencyGradient(C, daysUntilExam);
  const milestone = getMilestone(daysUntilExam);
  const isExamDay = daysUntilExam <= 0;
  const dateStr = examDate
    ? examDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const pct = Math.max(0, Math.min(1, 1 - daysUntilExam / 365));

  return (
    <Animated.View entering={FadeInDown.delay(160).duration(440).springify().damping(16)}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.94 }}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: RADIUS.xxl, padding: SPACING.lg, overflow: "hidden" }}
        >
          <View style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.06)" }} />
          <View style={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.04)" }} />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={pill}>
                <Text style={pillText}>{examType?.toUpperCase() || "YKS"}</Text>
              </View>
              <Text style={dateLabel}>{dateStr}</Text>
            </View>
            <View style={gearWrap}>
              <Icon name="settings" size={15} color="rgba(255,255,255,0.9)" />
            </View>
          </View>

          <View style={{ alignItems: "center", paddingVertical: SPACING.xxl }}>
            {isExamDay ? (
              <Text style={{ fontSize: 48 }}>{"\u{1F680}"}</Text>
            ) : (
              <>
                <Text style={heroNum}>{daysUntilExam}</Text>
                <Text style={heroSub}>GÜN KALDI</Text>
              </>
            )}
          </View>

          {milestone && (
            <View style={badge}>
              <Text style={{ fontSize: 14 }}>{milestone.emoji}</Text>
              <Text style={badgeText}>{milestone.message}</Text>
            </View>
          )}

          <View style={track}>
            <View style={[fill, { width: `${Math.round(pct * 100)}%` }]} />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const pill = { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3 };
const pillText = { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#FFF", letterSpacing: 0.8 };
const dateLabel = { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.8)" };
const gearWrap = { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" };
const heroNum = {
  fontFamily: "SpaceGrotesk_700Bold", fontSize: 64, lineHeight: 68,
  color: "#FFF", letterSpacing: -2,
  textShadowColor: "rgba(0,0,0,0.15)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
};
const heroSub = { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "rgba(255,255,255,0.85)", letterSpacing: 3, marginTop: -2 };
const badge = {
  alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6,
  backgroundColor: "rgba(255,255,255,0.18)", borderRadius: RADIUS.pill,
  paddingHorizontal: 14, paddingVertical: 6, marginBottom: SPACING.md,
};
const badgeText = { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFF" };
const track = { height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2 };
const fill = { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.7)" };
