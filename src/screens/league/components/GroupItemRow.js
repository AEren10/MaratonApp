import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, STEP, RADIUS, CONTROL } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

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
      <View
        style={[
          s.avatar,
          {
            backgroundColor: isSelected ? C.accent + "1C" : C.surface2,
            borderColor: isSelected ? C.accent + "40" : C.border,
          },
        ]}
      >
        <Text style={[s.avatarText, { color: isSelected ? C.accent : C.text2 }]}>
          {initial}
        </Text>
      </View>

      <View style={s.info}>
        <Text
          style={[s.name, { color: isSelected ? C.accent : C.text }]}
          numberOfLines={1}
        >
          {group.name}
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: 1 }]} numberOfLines={1}>
          {memberCount} üye · bu hafta {weeklyQuestions} soru
          {userRank ? ` · ${userRank}. sıra` : ""}
        </Text>
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
  avatar: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: {
    ...TYPOGRAPHY.subheading,
  },
  info: {
    flex: 1,
    marginLeft: STEP.s2,
    marginRight: SPACING.sm,
  },
  name: {
    ...TYPOGRAPHY.bodySemiBold,
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
