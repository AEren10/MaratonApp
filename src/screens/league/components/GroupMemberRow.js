import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon, Avatar } from "../../../components/design";

export const GroupMemberRow = React.memo(function GroupMemberRow({ item }) {
  const C = useC();
  const isYou = item.you;
  const medal = item.rank === 1 ? C.amber : item.rank === 2 ? "#C0C5CE" : item.rank === 3 ? "#CD7F47" : null;
  const weeklyQuestions = item.weekly_questions ?? item.questions ?? item.weekly_xp ?? 0;

  return (
    <View style={[
      s.row,
      { backgroundColor: C.surface },
      isYou && { backgroundColor: C.accent + "14", borderWidth: 1, borderColor: C.accent + "40" },
    ]}>
      <View style={s.rankCol}>
        {medal ? (
          <Icon name="trophy" size={16} color={medal} />
        ) : (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.muted }]}>{item.rank}</Text>
        )}
      </View>
      <Avatar init={(item.name || "?").slice(0, 2).toUpperCase()} size={30} color={isYou ? C.accent : undefined} />
      <Text style={[s.name, TYPOGRAPHY.bodyMedium, { color: isYou ? C.accent : C.text }]} numberOfLines={1}>
        {isYou ? "Sen" : item.name || "Öğrenci"}
      </Text>
      <Text style={[s.count, { color: C.text }]}>{weeklyQuestions}</Text>
      <Text style={[TYPOGRAPHY.micro, s.unit, { color: C.muted }]}>soru</Text>
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  rankCol: { width: 26, alignItems: "center" },
  name: { flex: 1, marginLeft: 10 },
  count: { fontFamily: "Bricolage_400", fontSize: 15 },
  unit: { marginLeft: 3 },
});
