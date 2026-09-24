import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, STEP, RADIUS } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export const GroupItemRow = React.memo(function GroupItemRow({
  group,
  isSelected,
  onSelect,
  onLeave,
  isLast,
}) {
  const C = useC();

  const handlePress = () => {
    H.tap();
    onSelect?.();
  };

  const initial = (group.name || "G").trim().slice(0, 1).toUpperCase();

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLeave}
      accessibilityRole="button"
      accessibilityLabel={`${group.name} grubu${isSelected ? ", aktif seçili" : ""}`}
      accessibilityHint="Grubu seçer, uzun basışta ayrılma seçeneği sunar"
      style={({ pressed }) => [
        s.row,
        {
          backgroundColor: isSelected ? C.accent + "0D" : "transparent",
          borderBottomColor: C.border,
          borderBottomWidth: isLast ? 0 : 1,
          opacity: pressed ? 0.75 : 1,
        },
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
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: 1 }]}>
          Kod: <Text style={TYPOGRAPHY.tableName}>{group.code}</Text>
          {isSelected ? " · Aktif" : ""}
        </Text>
      </View>

      {isSelected ? (
        <View style={[s.badge, { backgroundColor: C.accent + "18" }]}>
          <Icon name="check" size={11} color={C.accent} />
          <Text style={[s.badgeText, { color: C.accent }]}>Seçili</Text>
        </View>
      ) : (
        <Icon name="chevR" size={14} color={C.text3} />
      )}
    </Pressable>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: STEP.s2,
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    ...TYPOGRAPHY.micro,
  },
});
