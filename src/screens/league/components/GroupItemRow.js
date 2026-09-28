import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
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

  const rankColor = userRank === 1 ? C.amber : userRank === 2 ? C.text2 : userRank === 3 ? C.text3 : null;

  return (
    <Press
      haptic="none"
      onPress={handlePress}
      onLongPress={onLeave}
      accessibilityRole="button"
      accessibilityLabel={`${group.name} grubuna gir`}
      accessibilityHint="Grup odasını açar, basılı tutunca ayrılma seçeneği sunar"
      style={[
        s.card,
        {
          backgroundColor: isSelected ? C.accent + "12" : C.surface,
          borderColor: isSelected ? C.accent + "70" : C.border,
        },
      ]}
    >
      <View style={[s.badge, { backgroundColor: C.accent + "14", borderColor: C.accent + "30" }]}>
        <Text style={[TYPOGRAPHY.subheading, { color: C.accent }]}>{initial}</Text>
      </View>

      <View style={s.content}>
        <View style={s.topRow}>
          <Text style={[s.name, { color: isSelected ? C.accent : C.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          {userRank ? (
            <View style={[s.rankPill, { backgroundColor: rankColor ? rankColor + "18" : C.elev, borderColor: rankColor || C.border }]}>
              {userRank <= 3 ? <Icon name="trophy" size={11} color={rankColor} style={s.trophy} /> : null}
              <Text style={[TYPOGRAPHY.micro, { color: rankColor || C.text2 }]}>#{userRank}</Text>
            </View>
          ) : null}
        </View>

        <Text style={[TYPOGRAPHY.caption, s.statsText, { color: C.text3 }]} numberOfLines={1}>
          {weeklyQuestions > 0 ? `Bu hafta ${weeklyQuestions} soru çözüldü` : "Bu hafta henüz soru çözülmedi"}
        </Text>

        <GroupAvatarStack initial={initial} memberCount={memberCount} members={preview} />
      </View>

      <View style={s.chevWrap}>
        <Icon name="chevR" size={15} color={C.text3} />
      </View>
    </Press>
  );
});

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 90,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  content: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.xs,
  },
  name: {
    flex: 1,
    ...TYPOGRAPHY.bodySemiBold,
  },
  rankPill: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 20,
    paddingHorizontal: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  trophy: {
    marginRight: 2,
  },
  statsText: {
    marginTop: 1,
    marginBottom: 2,
  },
  chevWrap: {
    paddingLeft: SPACING.xs,
    justifyContent: "center",
  },
});
