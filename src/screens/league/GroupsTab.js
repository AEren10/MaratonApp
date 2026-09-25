import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Share } from "react-native";

import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../../components/design";
import { GroupsSkeleton } from "./components/GroupsSkeleton";
import { GroupMemberRow } from "./components/GroupMemberRow";
import { GroupItemRow } from "./components/GroupItemRow";
import { GroupCodeCard } from "./components/GroupCodeCard";
import { GroupCodeModal } from "./components/GroupCodeModal";
import { GroupCompetitionBanner } from "./components/GroupCompetitionBanner";
import { EmptyState } from "../../components/common/EmptyState";
import { groupLeaderboard } from "../../supabase/groups";
import { useGroupsController } from "./useGroupsController";
import { SCREENS } from "../../constants/screens";
import { appUrl } from "../../navigation/routes";
import * as H from "../../lib/haptics";
import { Press } from "../../components/design/Press";

export function GroupsTab({ user, initialGroupCode }) {
  const C = useC();
  const c = useGroupsController({ user, initialGroupCode });
  const [board, setBoard] = useState({ list: [] });
  const [boardError, setBoardError] = useState(null);

  const loadBoard = useCallback(async () => {
    if (!c.selected?.id || !user?.id) return;
    setBoardError(null);
    try {
      setBoard(await groupLeaderboard(c.selected.id, user.id));
    } catch (e) {
      setBoardError(e?.message || "Sıralama yüklenemedi.");
    }
  }, [c.selected?.id, user?.id]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  const standing = useMemo(() => {
    if (!board.list?.length) return null;
    const leader = board.list[0];
    const mine = board.list.find((m) => m.you);
    if (!mine) return null;
    const isLeader = mine.rank === 1;
    const second = board.list[1];
    const myQ = mine.weekly_questions ?? mine.questions ?? 0;
    const leaderQ = leader.weekly_questions ?? leader.questions ?? 0;
    const secQ = second ? (second.weekly_questions ?? second.questions ?? 0) : 0;
    const diff = isLeader ? Math.max(0, myQ - secQ) : Math.max(0, leaderQ - myQ);
    return { isLeader, rank: mine.rank, diff, leaderName: leader.name || "Lider", leaderQuestions: leaderQ };
  }, [board.list]);

  const shareCode = (g) => {
    Share.share({ message: `Maraton'da "${g.name}" grubuma katıl!\nKod: ${g.code}\n${appUrl(SCREENS.LEAGUE, { groupCode: g.code })}` }).catch(() => {});
  };

  if (c.loading) return <GroupsSkeleton />;

  return (
    <View style={s.fill}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.actions}>
          <Press haptic="none" onPress={() => { H.tap(); c.setCreateOpen(true); }} style={[s.actBtn, { backgroundColor: C.accent }]}>
            <Icon name="plus" size={15} color={C.textOnFill} sw={2.5} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.textOnFill }]}>Yeni Grup Oluştur</Text>
          </Press>
          <Press haptic="none" onPress={() => { H.tap(); c.setJoinOpen(true); }} style={[s.actBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}>
            <Icon name="users" size={15} color={C.text} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Kodu Gir</Text>
          </Press>
        </View>

        {c.groups.length === 0 ? (
          <EmptyState icon="users" title="Çalışma grubunu kur" message="Sınıf arkadaşlarınla grup oluştur veya var olan bir gruba katıl. Kurmak 1 dakika sürer!" color="accent" />
        ) : (
          <>
            <Text style={[TYPOGRAPHY.label, s.secLabel, { color: C.text3 }]}>GRUPLARIN ({c.groups.length})</Text>
            <View style={[s.groupListCard, { backgroundColor: C.surface, borderColor: C.border }]}>
              {c.groups.map((g, i) => (
                <GroupItemRow key={g.id} group={g} isSelected={c.selected?.id === g.id} isLast={i === c.groups.length - 1} onSelect={() => c.setSelected(g)} onLeave={() => c.doLeave(g)} />
              ))}
            </View>

            {c.selected ? (
              <>
                <Text style={[TYPOGRAPHY.label, s.secLabel, { color: C.text3 }]}>{c.selected.name.toUpperCase()} · DAVET & BİLGİ</Text>
                <GroupCodeCard group={c.selected} onShare={shareCode} />
                <GroupCompetitionBanner standing={standing} />

                <Text style={[TYPOGRAPHY.label, s.secLabel, { color: C.text3 }]}>HAFTALIK SIRALAMA</Text>
                {boardError ? (
                  <View style={s.boardError}>
                    <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>Sıralama yüklenemedi. Bağlantını kontrol edip tekrar dene.</Text>
                    <Press haptic="none" onPress={loadBoard} style={[s.retryBtn, { borderColor: C.border }]}>
                      <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Tekrar dene</Text>
                    </Press>
                  </View>
                ) : board.list.length === 0 ? (
                  <Text style={[TYPOGRAPHY.caption, s.emptySub, { color: C.text3 }]}>Bu hafta kimse aktif değil.</Text>
                ) : (
                  <View style={s.memberList}>
                    {board.list.map((m) => (
                      <GroupMemberRow key={String(m.user_id)} item={m} />
                    ))}
                  </View>
                )}
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <GroupCodeModal visible={c.createOpen} title="Yeni Grup Oluştur" subtitle="Grubun için bir isim belirle" placeholder="Grup adı (örn. 12-A Sayısal)" value={c.name} onChange={c.setName} onSubmit={c.doCreate} onClose={() => c.setCreateOpen(false)} busy={c.busy} cta="Oluştur" />
      <GroupCodeModal visible={c.joinOpen} title="Gruba Katıl" subtitle="Arkadaşından aldığın 6 haneli kodu gir" placeholder="XXXXXX" autoCap maxLen={6} value={c.code} onChange={c.setCode} onSubmit={c.doJoin} onClose={() => c.setJoinOpen(false)} busy={c.busy} cta="Katıl" />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  actions: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.sm },
  actBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs, minHeight: 48, borderRadius: RADIUS.lg },
  secLabel: { letterSpacing: 1.2, marginTop: SPACING.md, marginBottom: SPACING.xs },
  groupListCard: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: "hidden", marginBottom: SPACING.sm },
  memberList: { gap: SPACING.xs, marginBottom: SPACING.md },
  boardError: { alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.lg },
  retryBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1 },
  emptySub: { textAlign: "center", paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
});
