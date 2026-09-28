import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, STEP, RADIUS, CONTROL } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";
import { GroupAvatarStack } from "./GroupAvatarStack";

export const GroupItemRow = React.memo(function GroupItemRow({
  group,
  isSelected,
  onSelect,
  onLeave,
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
  const preview = Array.isArray(group.member_preview ?? group.memberPreview)
    ? (group.member_preview ?? group.memberPreview)
    : [];

  return (
    <Press haptic="none"
      onPress={handlePress}
      onLongPress={onLeave}
      accessibilityRole="button"
      accessibilityLabel={`${group.name} grubuna gir`}
      accessibilityHint="Grup odasını açar, uzun basışta ayrılma seçeneği sunar"
      style={[
        s.row,
        {
          backgroundColor: isSelected ? C.accent + "10" : C.surface,
          borderColor: isSelected ? C.accent + "70" : C.border,
        }
      ]}
    >
      <View style={s.info}>
        <View style={s.titleRow}>
          <Text
            style={[s.name, { color: isSelected ? C.accent : C.text }]}
            numberOfLines={1}
          >
            {group.name}
          </Text>
          {userRank ? (
            <View style={[s.rankPill, { backgroundColor: C.elev, borderColor: C.border }]}>
              <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>#{userRank}</Text>
            </View>
          ) : null}
        </View>
        <Text
          style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: 1 }]}
          numberOfLines={1}
        >
          Bu hafta {weeklyQuestions} soru
        </Text>
        <GroupAvatarStack initial={initial} memberCount={memberCount} members={preview} />
      </View>

      <View style={[s.enter, { backgroundColor: C.elev, borderColor: C.border }]}>
        <Icon name="chevR" size={14} color={C.text2} />
      </View>
    </Press>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 84,
    paddingHorizontal: SPACING.md,
    paddingVertical: STEP.s2 + 2,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  name: {
    flex: 1,
    ...TYPOGRAPHY.bodySemiBold,
  },
  rankPill: {
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  enter: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
});
