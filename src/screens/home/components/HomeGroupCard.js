import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function HomeGroupCard({ groupsData, onPress }) {
  const C = useC();
  const { hasGroup, primaryGroup, standing } = groupsData;

  const handlePress = () => {
    H.tap();
    onPress?.();
  };

  if (!hasGroup) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Çalışma grubu kur veya katıl"
        style={({ pressed }) => [
          s.card,
          {
            backgroundColor: pressed ? C.elev : C.surface,
            borderColor: C.border,
          },
        ]}
      >
        <View style={s.topRow}>
          <View style={[s.badge, { backgroundColor: C.accent + "18" }]}>
            <Icon name="users" size={13} color={C.accent} />
            <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>ÇALIŞMA GRUBUN</Text>
          </View>
        </View>

        <Text style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>
          Yalnız çalışma!
        </Text>
        <Text style={[TYPOGRAPHY.caption, s.desc, { color: C.text2 }]}>
          Sınıf arkadaşlarınla grup kur veya koda katıl, birlikte yarışın.
        </Text>

        <View style={[s.cta, { backgroundColor: C.accent }]}>
          <Icon name="plus" size={14} color={C.accentInk} sw={2.5} />
          <Text style={[TYPOGRAPHY.button, s.ctaText, { color: C.accentInk }]}>Grup Kur / Katıl</Text>
        </View>
      </Pressable>
    );
  }

  const groupName = primaryGroup?.name || "Çalışma Grubum";
  let statusText = "Grupta durumunu gör ve yarışa katıl";
  if (standing?.isLeader) {
    statusText = standing.diff > 0
      ? `Zirvedesin! 🔥 2. sırayla farkın ${standing.diff} soru.`
      : "Zirvedesin! 🔥 Harika gidiyorsun.";
  } else if (standing?.rank) {
    statusText = `${standing.rank}. sıradasın · Liderle fark ${standing.diff} soru!`;
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${groupName} grubunu aç`}
      style={({ pressed }) => [
        s.card,
        {
          backgroundColor: pressed ? C.elev : C.surface,
          borderColor: C.border,
        },
      ]}
    >
      <View style={s.topRow}>
        <View style={[s.badge, { backgroundColor: C.track }]}>
          <Icon name="users" size={13} color={C.accent} />
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ÇALIŞMA GRUBUM</Text>
        </View>
        <View style={s.flex} />
        {standing?.rank ? (
          <View style={[s.rankChip, { backgroundColor: C.void, borderColor: C.line }]}>
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: standing.isLeader ? C.up : C.text }]}>
              #{standing.rank}
            </Text>
          </View>
        ) : null}
      </View>

      <Text numberOfLines={1} style={[TYPOGRAPHY.subheading, s.groupTitle, { color: C.text }]}>
        {groupName}
      </Text>

      <Text style={[TYPOGRAPHY.caption, s.status, { color: standing?.isLeader ? C.up : C.text2 }]}>
        {statusText}
      </Text>

      <View style={[s.linkRow, { borderTopColor: C.line }]}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Grup sıralamasını gör</Text>
        <View style={s.flex} />
        <Icon name="chevR" size={13} color={C.text3} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { padding: STEP.s3, borderRadius: SHAPE.cardTight, borderWidth: 1, marginTop: STEP.s3 },
  topRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  badge: { flexDirection: "row", alignItems: "center", gap: STEP.s1 - 2, paddingHorizontal: STEP.s1 + 2, paddingVertical: STEP.s1 / 2, borderRadius: SHAPE.chip / 2 },
  rankChip: { paddingHorizontal: STEP.s2, paddingVertical: 2, borderRadius: SHAPE.chip / 2, borderWidth: 1 },
  title: { marginTop: STEP.s2, fontSize: 16 },
  groupTitle: { marginTop: STEP.s2, fontSize: 17 },
  desc: { marginTop: STEP.s1 / 2, lineHeight: 18 },
  status: { marginTop: STEP.s1 / 2, lineHeight: 18 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: STEP.s1, height: CONTROL.tapMin - 4, borderRadius: SHAPE.button, marginTop: STEP.s2 + 2 },
  ctaText: { fontSize: 14 },
  linkRow: { flexDirection: "row", alignItems: "center", marginTop: STEP.s2 + 2, paddingTop: STEP.s2, borderTopWidth: 1 },
  flex: { flex: 1 },
});
