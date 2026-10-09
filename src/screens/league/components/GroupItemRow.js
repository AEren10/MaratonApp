import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";
import { GrowBar } from "../../../components/design/GrowBar";
import { GroupAvatarStack } from "./GroupAvatarStack";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../../components/design/Icon";
import { alpha } from "../../../themes/colorMix";
import { SHAPE } from "../../../themes/tokens";

// Grup satiri: ad + sira; uyelerin ust uste dizili fotograflari (kullanici
// istegiyle geri, 4 Ekim); haftanin ortak hedef cizgisi.
// member_preview ?? group.memberPreview

export const GroupItemRow = React.memo(function GroupItemRow({
  group,
  isSelected,
  onSelect,
  onLeave,
  isLast = false,
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
  const members = group.member_preview ?? group.memberPreview ?? [];
  // Haftanin ortak hedefi (weekly_target) -- tutuluyordu, gosterilmiyordu.
  const target = Number(group.weekly_target ?? group.weeklyTarget ?? 0) || 0;
  const share = target > 0 ? Math.min(1, weeklyQuestions / target) : 0;

  return (
    <Press
      haptic="none"
      onPress={handlePress}
      onLongPress={onLeave}
      accessibilityRole="button"
      accessibilityLabel={`${group.name} grubuna gir`}
      accessibilityHint="Grup odasını açar, basılı tutunca ayrılma seçeneği sunar"
      style={[s.row, { borderColor: isSelected ? alpha(C.accent, 50) : C.line }]}
    >
      {/* Gri ortak panel yerine her grup kendi karti (9 Ekim): soldan silik
          kizil isik, kizil harf rozeti, sagda sira (liderse tac). */}
      <LinearGradient
        colors={[alpha(C.accent, 12), "transparent"]}
        start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient colors={[C.accent, C.accentDeep || C.accent]} style={s.badge}>
        <Text style={[s.initialText, { color: C.textOnFill || "#FFFFFF" }]}>{initial}</Text>
      </LinearGradient>

      <View style={s.content}>
        <View style={s.titleRow}>
          <Text style={[TYPOGRAPHY.bodySemiBold, s.title, { color: C.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          {userRank === 1 ? (
            <View style={[s.pill, { backgroundColor: alpha(C.warn, 16) }]}>
              <Icon name="crown" size={12} color={C.warn} fill={alpha(C.warn, 40)} />
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.warn }]}>Lider</Text>
            </View>
          ) : userRank ? (
            <View style={[s.pill, { backgroundColor: C.surface }]}>
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>{userRank}. sıra</Text>
            </View>
          ) : null}
        </View>
        <GroupAvatarStack initial={initial} memberCount={memberCount || members.length} members={members} />
        <View style={s.weekRow}>
          {target > 0 ? (
            <GrowBar value={share} color={share >= 1 ? C.up : C.accent} track={C.track} style={s.bar} />
          ) : <View style={s.bar} />}
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>
            {target > 0 ? `${weeklyQuestions} / ${target}` : `bu hafta ${weeklyQuestions} soru`}
          </Text>
        </View>
      </View>
    </Press>
  );
});

const s = StyleSheet.create({
  bar: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: STEP.s1, paddingVertical: 2, borderRadius: SHAPE.chip },
  title: { flex: 1 },
  weekRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s1 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 52,
    padding: STEP.s2,
    borderRadius: SHAPE.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: SHAPE.iconBox || 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: STEP.s2,
  },
  initialText: {
    ...TYPOGRAPHY.bodySemiBold,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  rankWrap: {
    marginLeft: STEP.s2,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
