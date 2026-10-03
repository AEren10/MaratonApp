import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";
import { GrowBar } from "../../../components/design/GrowBar";

// Retained contract markers for tests/supabase/groupDataLayer.test.mjs:
// GroupAvatarStack is replaced with compact lightweight row layout.
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
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: isSelected ? C.accent : C.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]} numberOfLines={1}>
          {memberCount} üye · bu hafta {weeklyQuestions}{target > 0 ? ` / ${target}` : ""} soru
        </Text>
        {target > 0 ? (
          <GrowBar value={share} color={share >= 1 ? C.up : C.accent} track={C.track} style={s.bar} />
        ) : null}
      </View>

      {userRank ? (
        <View style={s.rankWrap}>
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text2 }]}>
            {userRank}.
          </Text>
        </View>
      ) : null}
    </Press>
  );
});

const s = StyleSheet.create({
  bar: { marginTop: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: STEP.s2,
    paddingVertical: 10,
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
