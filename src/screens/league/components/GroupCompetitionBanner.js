import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { SPACING, TYPOGRAPHY } from "../../../themes/tokens";

export function GroupCompetitionBanner({ standing }) {
  const C = useC();
  if (!standing) return null;

  let text = "Grubundaki yarışa katıl, birlikte hedefe koşun!";
  const leaderQ = Number(standing.leaderQuestions) || 0;

  if (leaderQ === 0) {
    text = "Haftalık yarış yeni başladı! İlk soruyu çözen liderliği alır.";
  } else if (standing.isLeader) {
    text = standing.diff > 0
      ? `Zirvedesin. 2. sırayla aranda ${standing.diff} soru fark var.`
      : "Zirvedesin. Liderliği elden bırakma.";
  } else if (standing.diff === 0) {
    text = `${standing.leaderName} ile berabersin. Bir soruyla öne geçebilirsin.`;
  } else if (standing.rank) {
    text = `${standing.leaderName} ${leaderQ} soruyla lider. Aradaki fark ${standing.diff} soru.`;
  }

  const isUp = standing.isLeader && leaderQ > 0;
  const themeColor = isUp ? (C.up || C.green) : C.accent;

  return (
    // Kutusuz tek satir: kupa + cumle (emoji yok, tasarim kurali).
    <View style={s.banner}>
      <View style={s.row}>
        <Icon name="trophy" size={16} color={themeColor} />
        <Text style={[TYPOGRAPHY.captionMedium, s.text, { color: C.text }]}>{text}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  text: {
    flex: 1,
    lineHeight: 19,
  },
});
