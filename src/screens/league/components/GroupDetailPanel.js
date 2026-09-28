import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { GroupCodeCard } from "./GroupCodeCard";
import { GroupCompetitionBanner } from "./GroupCompetitionBanner";
import { GroupMemberRow } from "./GroupMemberRow";

export function GroupDetailPanel({
  group,
  board,
  boardError,
  standing,
  onRetry,
  onShare,
}) {
  const C = useC();
  const members = board?.list || [];

  if (!group) return null;

  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, s.secLabel, { color: C.text3 }]}>
        {group.name.toUpperCase()} · ODA
      </Text>
      <GroupCodeCard group={group} onShare={onShare} />
      <GroupCompetitionBanner standing={standing} />

      <View style={s.memberHead}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ÜYELER</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Bu hafta</Text>
      </View>
      {boardError ? (
        <View style={s.boardError}>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
            Sıralama yüklenemedi. Bağlantını kontrol edip tekrar dene.
          </Text>
          <Press haptic="none" onPress={onRetry} style={[s.retryBtn, { borderColor: C.border }]}>
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Tekrar dene</Text>
          </Press>
        </View>
      ) : members.length === 0 ? (
        <Text style={[TYPOGRAPHY.caption, s.emptySub, { color: C.text3 }]}>
          Bu hafta kimse aktif değil.
        </Text>
      ) : (
        <View style={s.memberList}>
          {members.map((m) => (
            <GroupMemberRow key={String(m.user_id)} item={m} />
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: SPACING.xs },
  secLabel: { letterSpacing: 1.2, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  memberHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  memberList: { gap: SPACING.xs, marginBottom: SPACING.md },
  boardError: { alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.lg },
  retryBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1 },
  emptySub: { textAlign: "center", paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
});
