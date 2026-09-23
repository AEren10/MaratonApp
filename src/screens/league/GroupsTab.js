import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, Share } from "react-native";

import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../../components/design";
import { GroupsSkeleton } from "./components/GroupsSkeleton";
import { GroupMemberRow } from "./components/GroupMemberRow";
import { GroupCodeModal } from "./components/GroupCodeModal";
import { GroupCompetitionBanner } from "./components/GroupCompetitionBanner";
import { EmptyState } from "../../components/common/EmptyState";
import { groupLeaderboard } from "../../supabase/groups";
import { useGroupsController } from "./useGroupsController";
import { SCREENS } from "../../constants/screens";
import { appUrl } from "../../navigation/routes";

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

  const renderGroupChip = useCallback(({ item }) => {
    const active = c.selected?.id === item.id;
    return (
      <Pressable onPress={() => c.setSelected(item)} onLongPress={() => c.doLeave(item)}
        style={[s.chip, { backgroundColor: C.surface, borderColor: active ? C.accent : C.border }, active && { backgroundColor: C.accent + "18" }]}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: active ? C.accent : C.text2 }]}>{item.name}</Text>
      </Pressable>
    );
  }, [c, C]);

  const renderMemberItem = useCallback(({ item }) => <GroupMemberRow item={item} />, []);

  if (c.loading) return <GroupsSkeleton />;

  return (
    <View style={s.fill}>
      <View style={s.actions}>
        <Pressable onPress={() => c.setCreateOpen(true)} style={[s.actBtn, { backgroundColor: C.accent }]}>
          <Icon name="plus" size={15} color={C.accentInk} sw={2.5} /><Text style={[TYPOGRAPHY.button, { color: C.accentInk }]}>Yeni Grup Oluştur</Text>
        </Pressable>
        <Pressable onPress={() => c.setJoinOpen(true)} style={[s.actBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}>
          <Icon name="users" size={15} color={C.text} /><Text style={[TYPOGRAPHY.button, { color: C.text }]}>Kodu Gir</Text>
        </Pressable>
      </View>
      {c.groups.length === 0 ? (
        <EmptyState icon="users" title="Çalışma grubunu kur" message="Sınıf arkadaşlarınla grup oluştur veya var olan bir gruba katıl. Kurmak 1 dakika sürer!" color="accent" />
      ) : (
        <>
          <FlatList horizontal data={c.groups} keyExtractor={(g) => g.id} showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipList} renderItem={renderGroupChip} />
          {c.selected ? (
            <FlatList data={board.list} keyExtractor={(m) => String(m.user_id)} renderItem={renderMemberItem} windowSize={5} maxToRenderPerBatch={10}
              ListHeaderComponent={<GroupCompetitionBanner standing={standing} group={c.selected} onShare={shareCode} />}
              contentContainerStyle={s.boardList}
              ListEmptyComponent={boardError ? (
                <View style={s.boardError}><Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>Sıralama yüklenemedi. Bağlantını kontrol edip tekrar dene.</Text><Pressable onPress={loadBoard} style={[s.retryBtn, { borderColor: C.border }]}><Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Tekrar dene</Text></Pressable></View>
              ) : <Text style={[TYPOGRAPHY.caption, s.emptySub, { color: C.text3 }]}>Bu hafta kimse aktif değil.</Text>}
            />
          ) : null}
        </>
      )}
      <GroupCodeModal visible={c.createOpen} title="Yeni Grup Oluştur" placeholder="Grup adı (örn. 12-A Sayısal)" value={c.name} onChange={c.setName} onSubmit={c.doCreate} onClose={() => c.setCreateOpen(false)} busy={c.busy} cta="Oluştur" />
      <GroupCodeModal visible={c.joinOpen} title="Gruba Katıl" placeholder="6 haneli kod" autoCap maxLen={6} value={c.code} onChange={c.setCode} onSubmit={c.doJoin} onClose={() => c.setJoinOpen(false)} busy={c.busy} cta="Katıl" />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  actions: { flexDirection: "row", gap: SPACING.sm, paddingHorizontal: 16, marginBottom: SPACING.sm },
  actBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 48, borderRadius: RADIUS.lg },
  chipList: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  boardList: { paddingHorizontal: 16, paddingBottom: 100, gap: 6 },
  boardError: { alignItems: "center", gap: SPACING.sm, paddingTop: SPACING.lg },
  retryBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1 },
  emptySub: { textAlign: "center", paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
});
