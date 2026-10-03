import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ReportableAvatar } from "../../../components/common/ReportableAvatar";
import { UserActionRow } from "../../../components/common/UserActionRow";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { getZone, ZONE } from "../../../lib/leagueZones";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Lig satiri -- grup uye satiriyla ayni dil: kutusuz, ince alt cizgi,
// sira duz rakam. Dusus kirmizi DEGIL (AGENTS.md: kotu haber bagirmaz).
export const LeaderboardRow = React.memo(function LeaderboardRow({ item, totalUsers, showZones }) {
  const C = useC();
  const isYou = item.you;
  const zone = showZones ? getZone(item.rank, totalUsers) : ZONE.SAFE;
  const zoneIcon = zone === ZONE.PROMOTION ? "trendUp" : zone === ZONE.DEMOTION ? "trendDown" : null;
  const zoneColor = zone === ZONE.PROMOTION ? C.up : C.down;
  const podium = item.rank <= 3;

  return (
    <UserActionRow userId={item.user_id} name={item.name} image={item.avatar_url} you={isYou}
      style={[s.row, { borderBottomColor: C.line }, isYou && { backgroundColor: C.void }]}>
      <Text style={[TYPOGRAPHY.tableValue, s.rank, { color: podium ? C.text : C.text3 }]}>{item.rank}</Text>
      <ReportableAvatar userId={item.user_id} name={item.name} image={item.avatar_url} size={34}
        color={isYou ? C.accent : undefined} you={isYou} />
      <View style={s.nameCol}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: isYou ? C.accentText : C.text }]} numberOfLines={1}>
          {isYou ? "Sen" : item.name || "Öğrenci"}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]} numberOfLines={1}>
          {item.streak ? `${item.streak} günlük seri` : `${item.trials || 0} deneme`}
        </Text>
      </View>
      {zoneIcon && !isYou ? <Icon name={zoneIcon} size={12} color={zoneColor} /> : null}
      <View style={s.stat}>
        <Text style={[TYPOGRAPHY.signalValue, { color: C.text }]}>{item.questions ?? item.weekly_xp ?? 0}</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>soru</Text>
      </View>
    </UserActionRow>
  );
});

const s = StyleSheet.create({
  row: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    borderBottomWidth: 1,
    paddingVertical: STEP.s1,
    paddingHorizontal: STEP.s1,
    borderRadius: 10,
  },
  rank: { width: 22, textAlign: "center" },
  nameCol: { flex: 1, minWidth: 0 },
  stat: { alignItems: "flex-end", minWidth: 44 },
});
