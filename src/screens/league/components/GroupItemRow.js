import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";
import { GrowBar } from "../../../components/design/GrowBar";
import { GroupAvatarStack } from "./GroupAvatarStack";

// Grup satiri: ad + sira; uyelerin ust uste dizili fotograflari (kullanici
// istegiyle geri, 4 Ekim); haftanin ortak hedef cizgisi.
// member_preview ?? group.memberPreview

export const GroupItemRow = React.memo(function GroupItemRow({
  group,
  isSelected,
  onSelect,
  onLeave,
  isLast = false,
}) {
  const C = useC();

  const handlePress = () => {
    H.tap();
    onSelect?.();
  };

  const initial = (group.name || "G").trim().slice(0, 1).toUpperCase();
  const weeklyQuestions = Number(group.weekly_questions ?? group.weeklyQuestions ?? 0) || 0;
  const memberCount = Number(group.member_count ?? group.memberCount ?? 0) || 0;
  const userRank = Number(group.user_rank ?? group.userRank) || null;
  const members = group.member_preview ?? group.memberPreview ?? [];
  // Haftanin ortak hedefi (weekly_target) -- tutuluyordu, gosterilmiyordu.
  const target = Number(group.weekly_target ?? group.weeklyTarget ?? 0) || 0;
  const share = target > 0 ? Math.min(1, weeklyQuestions / target) : 0;

  return (
    <Press
      haptic="none"
      onPress={handlePress}
      onLongPress={onLeave}
      accessibilityRole="button"
      accessibilityLabel={`${group.name} grubuna gir`}
      accessibilityHint="Grup odasını açar, basılı tutunca ayrılma seçeneği sunar"
      style={[
        s.row,
        {
          backgroundColor: isSelected ? C.void : "transparent",
          borderBottomColor: C.line,
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
    >
      <View style={[s.badge, { backgroundColor: C.void, borderColor: C.line }]}>
        <Text style={[s.initialText, { color: C.text }]}>{initial}</Text>
      </View>

      <View style={s.content}>
        <View style={s.titleRow}>
          <Text style={[TYPOGRAPHY.bodySemiBold, s.title, { color: isSelected ? C.accent : C.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          {userRank ? <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>{userRank}. sıradasın</Text> : null}
        </View>
        <GroupAvatarStack initial={initial} memberCount={memberCount || members.length} members={members} />
        <View style={s.weekRow}>
          {target > 0 ? (
            <GrowBar value={share} color={share >= 1 ? C.up : C.accent} track={C.track} style={s.bar} />
          ) : <View style={s.bar} />}
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>
            {target > 0 ? `${weeklyQuestions} / ${target}` : `bu hafta ${weeklyQuestions} soru`}
          </Text>
        </View>
      </View>
    </Press>
  );
});

const s = StyleSheet.create({
  bar: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  title: { flex: 1 },
  weekRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s1 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 52,
    paddingHorizontal: STEP.s2,
    paddingVertical: STEP.s2,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: STEP.s2,
  },
  initialText: {
    ...TYPOGRAPHY.bodySemiBold,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  rankWrap: {
    marginLeft: STEP.s2,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
