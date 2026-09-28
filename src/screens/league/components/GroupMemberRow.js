import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Avatar } from "../../../components/design";

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
  const medal = rank === 1 ? C.amber : rank === 2 ? C.text2 : rank === 3 ? C.text3 : null;
  const weeklyQuestions = item.weekly_questions ?? item.questions ?? item.weekly_xp ?? 0;
  const weeklyMinutes = item.weekly_minutes ?? item.weeklyMinutes ?? item.minutes ?? 0;

  return (
    <View style={[
      s.row,
      { backgroundColor: C.surface, borderColor: C.border },
      isYou && { backgroundColor: C.accent + "14", borderWidth: 1, borderColor: C.accent + "40" },
    ]}>
      <View style={[s.rankCol, { backgroundColor: medal ? medal + "18" : C.elev, borderColor: medal || C.border }]}>
        <Text style={[s.rankText, { color: medal || C.text2 }]}>{rank || "-"}</Text>
      </View>
      <Avatar init={(item.name || "?").slice(0, 2).toUpperCase()} image={item.avatar_url} size={34} color={isYou ? C.accent : undefined} />
      <View style={s.nameCol}>
        <Text style={[s.name, TYPOGRAPHY.bodyMedium, { color: isYou ? C.accent : C.text }]} numberOfLines={1}>
          {isYou ? "Sen" : item.name || "Öğrenci"}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: item.is_studying_now ? C.green : C.muted }]} numberOfLines={1}>
          {medal ? "Podyumda" : item.is_studying_now ? "Şu an çalışıyor" : "Haftalık yarış"}
        </Text>
      </View>
      <View style={s.statsCol}>
        <View style={s.statBlock}>
          <Text style={[s.count, { color: C.text }]}>{weeklyQuestions}</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>soru</Text>
        </View>
        <View style={s.statBlock}>
          <Text style={[s.time, { color: C.text2 }]}>{formatMinutes(weeklyMinutes)}</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>süre</Text>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    minHeight: CONTROL.tapMin + SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  rankCol: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  rankText: {
    ...TYPOGRAPHY.captionMedium,
  },
  nameCol: { flex: 1, marginLeft: SPACING.sm },
  name: { marginBottom: 1 },
  statsCol: {
    minWidth: 104,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.md,
  },
  statBlock: { alignItems: "flex-end" },
  count: { ...TYPOGRAPHY.statMedium },
  time: { ...TYPOGRAPHY.tableValue },
});
