import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Avatar, Icon } from "../../../components/design";

function formatMinutes(value) {
  const minutes = Math.max(0, Number(value) || 0);
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} sa ${rest} dk` : `${hours} sa`;
}

export const GroupMemberRow = React.memo(function GroupMemberRow({ item }) {
  const C = useC();
  const isYou = item.you;
  const rank = Number(item.rank) || 0;
  const medalColor = rank === 1 ? C.amber : rank === 2 ? C.text2 : rank === 3 ? C.text3 : null;
  const weeklyQuestions = Number(item.weekly_questions ?? item.questions ?? item.weekly_xp ?? 0) || 0;
  const weeklyMinutes = Number(item.weekly_minutes ?? item.weeklyMinutes ?? item.minutes ?? 0) || 0;

  const subtitle = rank === 1 && weeklyQuestions > 0
    ? "Liderlik koltuğunda 👑"
    : rank === 2 && weeklyQuestions > 0
    ? "2. sıra · Zirve takibinde"
    : rank === 3 && weeklyQuestions > 0
    ? "3. sıra · Podyumda"
    : item.is_studying_now
    ? "Şu an çalışıyor 🟢"
    : item.streak
    ? `${item.streak} günlük seri`
    : "Haftalık yarış";

  return (
    <View
      style={[
        s.row,
        {
          backgroundColor: isYou ? C.accent + "14" : C.surface,
          borderColor: isYou ? C.accent + "50" : C.border,
        },
      ]}
    >
      <View style={[s.rankCol, medalColor && { backgroundColor: medalColor + "18", borderColor: medalColor + "40" }]}>
        {medalColor ? (
          <Icon name="trophy" size={15} color={medalColor} />
        ) : (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.muted }]}>{rank || "-"}</Text>
        )}
      </View>

      <Avatar
        init={(item.name || "?").slice(0, 2).toUpperCase()}
        image={item.avatar_url}
        size={36}
        color={isYou ? C.accent : undefined}
      />

      <View style={s.nameCol}>
        <View style={s.nameRow}>
          <Text style={[s.name, TYPOGRAPHY.bodySemiBold, { color: isYou ? C.accent : C.text }]} numberOfLines={1}>
            {isYou ? "Sen" : item.name || "Öğrenci"}
          </Text>
          {isYou ? (
            <View style={[s.youTag, { backgroundColor: C.accent, borderColor: C.accent }]}>
              <Text style={[TYPOGRAPHY.micro, s.youTagText, { color: C.textOnFill }]}>SEN</Text>
            </View>
          ) : null}
        </View>
        <Text style={[TYPOGRAPHY.micro, { color: item.is_studying_now ? C.green : C.muted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={s.statsCol}>
        <View style={s.statBlock}>
          <Text style={[TYPOGRAPHY.signalValue, { color: isYou ? C.accent : C.text }]}>{weeklyQuestions}</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>soru</Text>
        </View>
        <View style={s.statBlock}>
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text2 }]}>{formatMinutes(weeklyMinutes)}</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>süre</Text>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  rankCol: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "transparent",
    marginRight: SPACING.sm,
  },
  nameCol: {
    flex: 1,
    marginLeft: SPACING.sm,
    marginRight: SPACING.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  name: {
    marginBottom: 1,
  },
  youTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  youTagText: {
    letterSpacing: 0.5,
  },
  statsCol: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SPACING.md,
  },
  statBlock: {
    alignItems: "flex-end",
  },
});
