import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { TYPOGRAPHY, STEP, SHAPE, GUTTER } from "../../themes/tokens";
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
          <Press
            haptic="none"
            onPress={() => { H.tap(); c.setCreateOpen(true); }}
            style={[s.actBtn, { backgroundColor: C.surface, borderColor: C.line }]}
          >
            <Icon name="plus" size={15} color={C.text} sw={1.5} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Yeni grup</Text>
          </Press>
          <Press
            haptic="none"
            onPress={() => { H.tap(); c.setJoinOpen(true); }}
            style={[s.actBtn, { backgroundColor: C.surface, borderColor: C.line }]}
          >
            <Icon name="users" size={15} color={C.text} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Kod gir</Text>
          </Press>
        </View>

        {c.groups.length === 0 ? (
          <EmptyState
            icon="users"
            title="Çalışma grubunu kur"
            message="Sınıf arkadaşlarınla grup oluştur veya var olan bir gruba katıl. Kurmak 1 dakika sürer!"
            color="accent"
          />
        ) : (
          <>
            <Text style={[TYPOGRAPHY.label, s.secLabel, { color: C.text3 }]}>
              GRUPLARIN ({c.groups.length})
            </Text>
            <View style={[s.groupPanel, { backgroundColor: C.surface, borderColor: C.line }]}>
              {c.groups.map((g, idx) => (
                <GroupItemRow
                  key={g.id}
                  group={g}
                  isLast={idx === c.groups.length - 1}
                  isSelected={c.selected?.id === g.id && detailOpen}
                  onSelect={() => openGroup(g)}
                  onLeave={() => c.doLeave(g)}
                />
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
      <GroupCodeModal
        visible={c.createOpen}
        title="Yeni Grup Oluştur"
        subtitle="Grubun için bir isim belirle"
        placeholder="Grup adı (örn. 12-A Sayısal)"
        value={c.name}
        onChange={c.setName}
        onSubmit={c.doCreate}
        onClose={() => c.setCreateOpen(false)}
        busy={c.busy}
        cta="Oluştur"
      />
      <GroupCodeModal
        visible={c.joinOpen}
        title="Gruba Katıl"
        subtitle="Arkadaşından aldığın 6 haneli kodu gir"
        placeholder="XXXXXX"
        autoCap
        maxLen={6}
        value={c.code}
        onChange={c.setCode}
        onSubmit={c.doJoin}
        onClose={c.closeJoin}
        busy={c.busy}
        cta="Katıl"
        error={c.codeError}
      />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 100 },
  actions: { flexDirection: "row", gap: STEP.s2, marginBottom: STEP.s3 },
  actBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
    minHeight: 46,
    borderRadius: SHAPE.button,
    borderWidth: 1,
  },
  secLabel: { letterSpacing: 1.2, marginTop: STEP.s1, marginBottom: STEP.s2 },
  groupPanel: {
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: STEP.s2,
  },
});
