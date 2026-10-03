import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { ReportableAvatar } from "../../../components/common/ReportableAvatar";

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
  const medalColor = rank >= 1 && rank <= 3 ? C.text : null;
  const weeklyQuestions = Number(item.weekly_questions ?? item.questions ?? item.weekly_xp ?? 0) || 0;
  const weeklyMinutes = Number(item.weekly_minutes ?? item.weeklyMinutes ?? item.minutes ?? 0) || 0;

  const subtitle = rank === 1 && weeklyQuestions > 0
    ? "Liderlik koltuğunda"
    : rank === 2 && weeklyQuestions > 0
    ? "2. sıra · Zirve takibinde"
    : rank === 3 && weeklyQuestions > 0
    ? "3. sıra · Podyumda"
    : item.is_studying_now
    ? "Şu an çalışıyor"
    : item.streak
    ? `${item.streak} günlük seri`
    : "Haftalık yarış";

  return (
    <View
      style={[s.row, { borderBottomColor: C.line }]}
    >
      {/* Kutusuz satir (Ders analizi dili): sira duz rakam, ilk uc madalya renginde. */}
      <Text style={[TYPOGRAPHY.tableValue, s.rank, { color: medalColor && weeklyQuestions > 0 ? medalColor : C.text3 }]}>
        {rank || "-"}
      </Text>

      <ReportableAvatar userId={item.user_id} name={item.name} image={item.avatar_url}
        size={36} color={isYou ? C.accent : undefined} you={isYou} />

      <View style={s.nameCol}>
        <View style={s.nameRow}>
          <Text style={[s.name, TYPOGRAPHY.bodySemiBold, { color: isYou ? C.accentText : C.text }]} numberOfLines={1}>
            {isYou ? "Sen" : item.name || "Öğrenci"}
          </Text>
        </View>
        <Text style={[TYPOGRAPHY.micro, { color: subtitle === "Şu an çalışıyor" ? C.up : C.text3 }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={s.statsCol}>
        <View style={s.statBlock}>
          <Text style={[TYPOGRAPHY.signalValue, { color: C.text }]}>{weeklyQuestions}</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>soru</Text>
        </View>
        <View style={s.statBlock}>
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text2 }]}>{formatMinutes(weeklyMinutes)}</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>süre</Text>
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
    borderBottomWidth: 1,
    paddingVertical: SPACING.sm + 2,
  },
  rank: { width: 24, textAlign: "center", marginRight: SPACING.sm, fontVariant: ["tabular-nums"] },
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
