import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function GroupCompetitionBanner({ standing, group, onShare }) {
  const C = useC();
  if (!group) return null;

  let text = "Grubundaki yarışa katıl, birlikte hedefe koşun!";
  if (standing?.isLeader) {
    text = standing.diff > 0
      ? `Zirvedesin! 🔥 2. sırayla aranda ${standing.diff} soru fark var.`
      : "Zirvedesin! 🔥 Liderliği elden bırakma.";
  } else if (standing?.rank) {
    text = `${standing.leaderName} ${standing.leaderQuestions} soru çözdü, liderle aranda ${standing.diff} soru var!`;
  }

  return (
    <View style={s.wrap}>
      <View style={[s.banner, { backgroundColor: C.elev, borderColor: C.border }]}>
        <View style={s.row}>
          <Icon name="trophy" size={16} color={standing?.isLeader ? C.up : C.accent} />
          <Text style={[TYPOGRAPHY.captionMedium, s.text, { color: C.text }]}>{text}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => {
          H.tap();
          onShare?.(group);
        }}
        accessibilityRole="button"
        accessibilityLabel="Grubu WhatsApp ve arkadaşlarınla paylaş"
        style={({ pressed }) => [
          s.shareBtn,
          {
            backgroundColor: pressed ? C.elev : C.surface,
            borderColor: C.border,
          },
        ]}
      >
        <Icon name="share" size={14} color={C.accent} />
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.accent }]}>
          Kod: <Text style={{ fontFamily: "Bricolage_400" }}>{group.code}</Text> · Arkadaşlarını Gruba Çağır
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingBottom: STEP.s2, gap: STEP.s1 + 2 },
  banner: { padding: STEP.s2 + 2, borderRadius: SHAPE.cardTight - 4, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2 },
  text: { flex: 1, lineHeight: 18 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
    height: 42,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
});
