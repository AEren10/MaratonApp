import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { GroupAvatarStack } from "./GroupAvatarStack";
import { GrowBar } from "../../../components/design/GrowBar";

// Grup karti: ad, uyeler (yuz yigini), haftanin ortak hedefine ilerleme ve
// senin siran. Eskiden yalniz bir harf rozeti + "N uye · N soru" satiriydi;
// ayrilma yalniz basili tutunca, gizli bir jestle mumkundu (artik detayda).
export const GroupItemRow = React.memo(function GroupItemRow({ group, onSelect, onLeave }) {
  const C = useC();
  const weekly = Number(group.weekly_questions ?? group.weeklyQuestions ?? 0) || 0;
  const target = Number(group.weekly_target ?? group.weeklyTarget ?? 0) || 0;
  const members = Number(group.member_count ?? group.memberCount ?? 0) || 0;
  const rank = Number(group.user_rank ?? group.userRank) || null;
  const preview = group.member_preview ?? group.memberPreview ?? [];
  const share = target > 0 ? Math.min(1, weekly / target) : 0;
  // "12-A Sayısal" -> "1S", "Dershane Akşam" -> "DA": iki kelimenin bas harfi.
  const initial = (group.name || "G").trim().split(/\s+/).slice(0, 2)
    .map((w) => w.slice(0, 1)).join("").toLocaleUpperCase("tr-TR");

  return (
    <Press
      onPress={onSelect}
      onLongPress={onLeave}
      accessibilityLabel={`${group.name}, ${members} üye, bu hafta ${weekly} soru`}
      accessibilityHint="Grup odasını açar"
      style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}
    >
      <View style={s.top}>
        <View style={[s.badge, { backgroundColor: C.void, borderColor: C.line }]}>
          <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{initial}</Text>
        </View>
        <View style={s.flex}>
          <Text style={[TYPOGRAPHY.topicName, { color: C.text }]} numberOfLines={1}>{group.name}</Text>
          <GroupAvatarStack initial={initial} memberCount={members} members={preview} />
        </View>
        {rank ? (
          <View style={[s.rank, { borderColor: C.line }]}>
            <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{rank}.</Text>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>sıran</Text>
          </View>
        ) : <Icon name="chevR" size={14} color={C.text3} />}
      </View>

      <View style={s.week}>
        <View style={s.weekText}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BU HAFTA</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
            <Text style={{ color: C.text }}>{weekly}</Text>{target > 0 ? ` / ${target} soru` : " soru"}
          </Text>
        </View>
        {target > 0 ? (
          <GrowBar value={share} color={share >= 1 ? C.up : C.accent} track={C.track} />
        ) : null}
      </View>
    </Press>
  );
});

const s = StyleSheet.create({
  card: { borderRadius: SHAPE.card, borderWidth: 1, padding: STEP.s3, gap: STEP.s2 },
  top: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  badge: { width: 44, height: 44, borderRadius: SHAPE.iconBox, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0 },
  rank: { alignItems: "center", borderWidth: 1, borderRadius: SHAPE.chip + 4, paddingHorizontal: STEP.s1 + 2, paddingVertical: 4 },
  week: { gap: 6 },
  weekText: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
});
