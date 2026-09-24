import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function GroupCompetitionBanner({ standing }) {
  const C = useC();
  if (!standing) return null;

  let text = "Grubundaki yarışa katıl, birlikte hedefe koşun!";
  if (standing.isLeader) {
    text = standing.diff > 0
      ? `Zirvedesin! 🔥 2. sırayla aranda ${standing.diff} soru fark var.`
      : "Zirvedesin! 🔥 Liderliği elden bırakma.";
  } else if (standing.rank) {
    text = `${standing.leaderName} ${standing.leaderQuestions} soru çözdü, liderle aranda ${standing.diff} soru var!`;
  }

  return (
    <View style={[s.banner, { backgroundColor: C.elev, borderColor: C.border }]}>
      <View style={s.row}>
        <Icon name="trophy" size={16} color={standing.isLeader ? C.up : C.accent} />
        <Text style={[TYPOGRAPHY.captionMedium, s.text, { color: C.text }]}>{text}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    padding: STEP.s2 + 2,
    borderRadius: SHAPE.cardTight - 4,
    borderWidth: 1,
    marginBottom: STEP.s2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 + 2,
  },
  text: {
    flex: 1,
    lineHeight: 18,
  },
});
