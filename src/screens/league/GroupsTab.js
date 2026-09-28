import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { TYPOGRAPHY, SPACING, RADIUS, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../../components/design";
import { GroupsSkeleton } from "./components/GroupsSkeleton";
import { GroupDetailPanel } from "./components/GroupDetailPanel";
import { GroupItemRow } from "./components/GroupItemRow";
import { GroupCodeModal } from "./components/GroupCodeModal";
import { EmptyState } from "../../components/common/EmptyState";
import { useGroupsController } from "./useGroupsController";
import * as H from "../../lib/haptics";
import { Press } from "../../components/design/Press";

export function GroupsTab({ user, initialGroupCode }) {
  const C = useC();
  const c = useGroupsController({ user, initialGroupCode });
  const [detailOpen, setDetailOpen] = useState(false);

  const openGroup = useCallback((group) => {
    c.setSelected(group);
    setDetailOpen(true);
  }, [c]);

  if (c.loading) return <GroupsSkeleton />;

  return (
    <View style={s.fill}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.actions}>
          <Press haptic="none" onPress={() => { H.tap(); c.setCreateOpen(true); }} style={[s.actBtn, { backgroundColor: C.accent }]}>
            <Icon name="plus" size={16} color={C.textOnFill} sw={1.5} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.textOnFill }]}>Yeni grup</Text>
          </Press>
          <Press haptic="none" onPress={() => { H.tap(); c.setJoinOpen(true); }} style={[s.actBtn, s.joinBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}>
            <Icon name="users" size={15} color={C.text} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Kod gir</Text>
          </Press>
        </View>

        {c.groups.length === 0 ? (
          <EmptyState icon="users" title="Çalışma grubunu kur" message="Sınıf arkadaşlarınla grup oluştur veya var olan bir gruba katıl. Kurmak 1 dakika sürer!" color="accent" />
        ) : (
          <>
            <Text style={[TYPOGRAPHY.label, s.secLabel, { color: C.text3 }]}>GRUPLARIN ({c.groups.length})</Text>
            <View style={s.groupStack}>
              {c.groups.map((g) => (
                <GroupItemRow key={g.id} group={g} isSelected={c.selected?.id === g.id && detailOpen} onSelect={() => openGroup(g)} onLeave={() => c.doLeave(g)} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <GroupDetailPanel
        visible={detailOpen}
        group={c.selected}
        board={c.board}
        boardError={c.boardError}
        standing={c.standing}
        onClose={() => setDetailOpen(false)}
        onRetry={c.loadBoard}
        onShare={c.shareCode}
      />
      <GroupCodeModal visible={c.createOpen} title="Yeni Grup Oluştur" subtitle="Grubun için bir isim belirle" placeholder="Grup adı (örn. 12-A Sayısal)" value={c.name} onChange={c.setName} onSubmit={c.doCreate} onClose={() => c.setCreateOpen(false)} busy={c.busy} cta="Oluştur" />
      <GroupCodeModal visible={c.joinOpen} title="Gruba Katıl" subtitle="Arkadaşından aldığın 6 haneli kodu gir" placeholder="XXXXXX" autoCap maxLen={6} value={c.code} onChange={c.setCode} onSubmit={c.doJoin} onClose={() => c.setJoinOpen(false)} busy={c.busy} cta="Katıl" />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  actions: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.lg },
  actBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs, minHeight: CONTROL.tapMin, borderRadius: RADIUS.md },
  joinBtn: { flex: 0.74 },
  secLabel: { letterSpacing: 1.2, marginTop: SPACING.xs, marginBottom: SPACING.sm },
  groupStack: { gap: SPACING.md, marginBottom: SPACING.sm },
});
