import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

export function GroupCompetitionBanner({ standing }) {
  const C = useC();
  if (!standing) return null;

  let text = "Grubundaki yarışa katıl, birlikte hedefe koşun!";
  const leaderQ = Number(standing.leaderQuestions) || 0;

  if (leaderQ === 0) {
    text = "Haftalık yarış yeni başladı! İlk soruyu çözen liderliği alır.";
  } else if (standing.isLeader) {
    text = standing.diff > 0
      ? `Zirvedesin! 2. sırayla aranda ${standing.diff} soru fark var 🏆`
      : "Zirvedesin! Liderliği elden bırakma ⚡";
  } else if (standing.diff === 0) {
    text = `${standing.leaderName} ile beraberesin! Bir soruyla öne geçebilirsin 🚀`;
  } else if (standing.rank) {
    text = `${standing.leaderName} ${leaderQ} soruyla lider. Fark sadece ${standing.diff} soru 🔥`;
  }

  const isUp = standing.isLeader && leaderQ > 0;
  const themeColor = isUp ? (C.up || C.green) : C.accent;

  return (
    <View style={[s.banner, { backgroundColor: themeColor + "10", borderColor: themeColor + "35" }]}>
      <View style={s.row}>
        <View style={[s.iconCircle, { backgroundColor: themeColor + "18" }]}>
          <Icon name="trophy" size={15} color={themeColor} />
        </View>
        <Text style={[TYPOGRAPHY.captionMedium, s.text, { color: C.text }]}>{text}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    lineHeight: 19,
  },
});
