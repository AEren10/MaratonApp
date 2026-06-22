import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ProgressRing, Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

const LABELS = {
  "1k": "İlk 1.000", "5k": "İlk 5.000", "10k": "İlk 10.000",
  "25k": "İlk 25.000", "50k": "İlk 50.000", "100k": "İlk 100.000", "100k+": "100.000+",
};

function motivMsg(pct) {
  if (pct < 0.10) return "Yolculuk yeni başlıyor! Her gün önemli.";
  if (pct < 0.25) return "Temel atılıyor — güzel gidiyorsun!";
  if (pct < 0.50) return "Çeyreği aştın, tempoyu koru!";
  if (pct < 0.75) return "Yarıyı geçtin — son düzlüğe hazırlan!";
  return "Bitiş çizgisi yakın — son sprint!";
}

export function GoalHeroCard({ targetRanking, targetDepartment, daysUntilExam, onEdit }) {
  const label = LABELS[targetRanking] || "Hedef belirlenmedi";
  const totalDays = 365;
  const elapsed = Math.max(0, totalDays - (daysUntilExam ?? totalDays));
  const pct = Math.max(0, Math.min(1, elapsed / totalDays));
  const noGoal = !targetRanking;

  return (
    <LinearGradient
      colors={["#8b5cf6", "#7c3aed"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: RADIUS.xxl, padding: SPACING.lg, overflow: "hidden" }}
    >
      <View style={{ position: "absolute", top: -15, right: -15, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.06)" }} />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ ...TYPOGRAPHY.label, color: "rgba(255,255,255,0.7)" }}>HEDEFİM</Text>
        <Pressable onPress={onEdit} hitSlop={12} style={editBtn}>
          <Icon name={noGoal ? "target" : "edit"} size={13} color="#FFF" />
          <Text style={editText}>{noGoal ? "Belirle" : "Güncelle"}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.lg, marginTop: SPACING.lg }}>
        <ProgressRing
          size={90} stroke={8} value={pct}
          color="rgba(255,255,255,0.85)" trackColor="rgba(255,255,255,0.2)"
        >
          <Text style={ringPct}>%{Math.round(pct * 100)}</Text>
        </ProgressRing>

        <View style={{ flex: 1, gap: 4 }}>
          <Text style={rankText}>{label}</Text>
          {targetDepartment ? <Text style={deptText}>{targetDepartment}</Text> : null}
          <Text style={motivStyle}>{motivMsg(pct)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md }}>
        <View style={statBox}>
          <Text style={statNum}>{elapsed}</Text>
          <Text style={statLabel}>gün geçti</Text>
        </View>
        <View style={statBox}>
          <Text style={statNum}>{daysUntilExam || 0}</Text>
          <Text style={statLabel}>gün kaldı</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const editBtn = {
  flexDirection: "row", alignItems: "center", gap: 4,
  backgroundColor: "rgba(255,255,255,0.18)", borderRadius: RADIUS.pill,
  paddingHorizontal: 10, paddingVertical: 5,
};
const editText = { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFF" };
const ringPct = { fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: "#FFF" };
const rankText = { fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: "#FFF", letterSpacing: -0.5 };
const deptText = { ...TYPOGRAPHY.caption, color: "rgba(255,255,255,0.8)" };
const motivStyle = { ...TYPOGRAPHY.micro, color: "rgba(255,255,255,0.65)", marginTop: 4 };
const statBox = {
  flex: 1, backgroundColor: "rgba(255,255,255,0.15)",
  borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: "center",
};
const statNum = { fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: "#FFF" };
const statLabel = { ...TYPOGRAPHY.micro, color: "rgba(255,255,255,0.7)" };
