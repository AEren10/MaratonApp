import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, FlatList, Modal, TextInput, ActivityIndicator, StyleSheet, Share } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon, Avatar } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { createGroup, joinByCode, listMyGroups, leaveGroup, groupLeaderboard } from "../../supabase/groups";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

const MemberRow = React.memo(function MemberRow({ item }) {
  const C = useC();
  const st = useMemo(() => makeStyles(C), [C]);
  const isYou = item.you;
  const medal = item.rank === 1 ? C.amber : item.rank === 2 ? "#C0C5CE" : item.rank === 3 ? "#CD7F47" : null;
  return (
    <View style={[st.row, isYou && st.rowYou]}>
      <View style={{ width: 26, alignItems: "center" }}>
        {medal ? <Icon name="trophy" size={16} color={medal} /> : <Text style={[TYPOGRAPHY.captionMedium, { color: C.muted }]}>{item.rank}</Text>}
      </View>
      <Avatar init={(item.name || "?").slice(0, 2).toUpperCase()} size={30} color={isYou ? C.amber : undefined} />
      <Text style={{ flex: 1, marginLeft: 10, ...TYPOGRAPHY.bodyMedium, color: isYou ? C.amber : C.text }} numberOfLines={1}>
        {isYou ? "Sen" : item.name || "Öğrenci"}
      </Text>
      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, color: C.text }}>{item.weekly_xp}</Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted, marginLeft: 3 }]}>XP</Text>
    </View>
  );
});

export function GroupsTab({ user }) {
  const C = useC();
  const showAlert = useAlert();
  const st = useMemo(() => makeStyles(C), [C]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [board, setBoard] = useState({ list: [] });
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const loadGroups = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = await listMyGroups(user.id);
      setGroups(list);
      if (list.length && !selected) setSelected(list[0]);
    } catch (e) {}
    setLoading(false);
  }, [user?.id, selected]);

  useEffect(() => { loadGroups(); }, [user?.id]);

  useEffect(() => {
    if (!selected?.id || !user?.id) return;
    groupLeaderboard(selected.id, user.id).then(setBoard).catch(() => setBoard({ list: [] }));
  }, [selected?.id, user?.id]);

  const doCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const g = await createGroup(name);
      H.success();
      setCreateOpen(false);
      setName("");
      await loadGroups();
      setSelected(g);
      showAlert("Grup oluştu", `Kod: ${g.code}\nArkadaşlarınla paylaş!`);
    } catch (e) {
      showAlert("Hata", "Grup oluşturulamadı.");
    }
    setBusy(false);
  };

  const doJoin = async () => {
    if (code.trim().length < 4) return;
    setBusy(true);
    try {
      await joinByCode(code);
      H.success();
      setJoinOpen(false);
      setCode("");
      await loadGroups();
    } catch (e) {
      showAlert("Hata", "Kod geçersiz ya da grup bulunamadı.");
    }
    setBusy(false);
  };

  const doLeave = (g) => {
    H.warn();
    showAlert("Gruptan ayrıl", `${g.name} grubundan ayrılmak istiyor musun?`, [
      { text: "İptal", style: "cancel" },
      { text: "Ayrıl", style: "destructive", onPress: async () => {
        await leaveGroup(g.id, user.id).catch(() => {});
        if (selected?.id === g.id) setSelected(null);
        loadGroups();
      } },
    ]);
  };

  const shareCode = (g) => {
    Share.share({ message: `Maraton'da "${g.name}" grubuma katıl! Kod: ${g.code}` }).catch(() => {});
  };

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={C.amber} size="large" /></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={st.actions}>
        <Pressable onPress={() => setCreateOpen(true)} style={[st.actBtn, { backgroundColor: C.amber }]}>
          <Icon name="plus" size={15} color={C.bg} sw={2.5} />
          <Text style={[st.actText, { color: C.bg }]}>Grup Oluştur</Text>
        </Pressable>
        <Pressable onPress={() => setJoinOpen(true)} style={[st.actBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}>
          <Icon name="users" size={15} color={C.text} />
          <Text style={[st.actText, { color: C.text }]}>Koda Gir</Text>
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <EmptyState icon="users" title="Henüz grubun yok" message="Bir grup oluştur ya da arkadaşının koduyla katıl" />
      ) : (
        <>
          <FlatList
            horizontal
            data={groups}
            keyExtractor={(g) => g.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}
            renderItem={({ item }) => {
              const active = selected?.id === item.id;
              return (
                <Pressable
                  onPress={() => setSelected(item)}
                  onLongPress={() => doLeave(item)}
                  style={[st.chip, active && st.chipActive]}
                >
                  <Text style={[st.chipText, active && { color: C.amber }]}>{item.name}</Text>
                </Pressable>
              );
            }}
          />

          {selected ? (
            <FlatList
              data={board.list}
              keyExtractor={(m) => String(m.user_id)}
              renderItem={({ item }) => <MemberRow item={item} />}
              ListHeaderComponent={
                <Pressable onPress={() => shareCode(selected)} style={st.codeRow}>
                  <Icon name="share" size={14} color={C.amber} />
                  <Text style={st.codeText}>Kod: {selected.code} · paylaş</Text>
                </Pressable>
              }
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 6 }}
              ListEmptyComponent={<Text style={st.emptySub}>Bu hafta kimse aktif değil.</Text>}
            />
          ) : null}
        </>
      )}

      <CodeModal
        visible={createOpen} title="Grup Oluştur" placeholder="Grup adı"
        value={name} onChange={setName} onSubmit={doCreate} onClose={() => setCreateOpen(false)} busy={busy} cta="Oluştur"
      />
      <CodeModal
        visible={joinOpen} title="Koda Gir" placeholder="6 haneli kod" autoCap
        value={code} onChange={setCode} onSubmit={doJoin} onClose={() => setJoinOpen(false)} busy={busy} cta="Katıl"
      />
    </View>
  );
}

function CodeModal({ visible, title, placeholder, value, onChange, onSubmit, onClose, busy, cta, autoCap }) {
  const C = useC();
  const st = useMemo(() => makeStyles(C), [C]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={st.backdrop} onPress={onClose}>
        <Pressable style={st.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={st.handle} />
          <Text style={st.sheetTitle}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={C.muted}
            autoCapitalize={autoCap ? "characters" : "sentences"}
            style={st.input}
            autoFocus
          />
          <Pressable onPress={onSubmit} disabled={busy} style={[st.submit, busy && { opacity: 0.6 }]}>
            <Text style={st.submitText}>{busy ? "..." : cta}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (C) => StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", gap: SPACING.sm, paddingHorizontal: 16, marginBottom: SPACING.sm },
  actBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  actText: { ...TYPOGRAPHY.button },
  emptySub: { ...TYPOGRAPHY.caption, color: C.muted, textAlign: "center", paddingHorizontal: SPACING.xl },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.amber + "18", borderColor: C.amber },
  chipText: { ...TYPOGRAPHY.captionMedium, color: C.sec },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: SPACING.md },
  codeText: { ...TYPOGRAPHY.captionMedium, color: C.amber },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  rowYou: { backgroundColor: C.amber + "14", borderWidth: 1, borderColor: C.amber + "40" },
  backdrop: { flex: 1, backgroundColor: "#000000AA", justifyContent: "flex-end" },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: SPACING.md },
  sheetTitle: { ...TYPOGRAPHY.subheading, color: C.text, marginBottom: SPACING.md },
  input: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.body, color: C.text },
  submit: { backgroundColor: C.amber, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: "center", marginTop: SPACING.md },
  submitText: { ...TYPOGRAPHY.button, color: C.bg },
});
