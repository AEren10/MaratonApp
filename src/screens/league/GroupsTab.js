import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { TYPOGRAPHY, STEP, SHAPE, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../../components/design";
import { GroupsSkeleton } from "./components/GroupsSkeleton";
import { GroupDetailPanel } from "./components/GroupDetailPanel";
import { GroupItemRow } from "./components/GroupItemRow";
import { GroupCodeModal } from "./components/GroupCodeModal";
import { GroupsEmpty } from "./components/GroupsEmpty";
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

  const openCreate = () => { H.tap(); c.setCreateOpen(true); };
  const openJoin = () => { H.tap(); c.setJoinOpen(true); };

  return (
    <View style={s.fill}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {c.groups.length === 0 ? (
          <GroupsEmpty onCreate={openCreate} onJoin={openJoin} />
        ) : (
          <>
            <View style={s.list}>
              {c.groups.map((g) => (
                <GroupItemRow key={g.id} group={g} onSelect={() => openGroup(g)} onLeave={() => c.doLeave(g)} />
              ))}
            </View>
            <View style={s.actions}>
              <Press haptic="none" onPress={openCreate} style={[s.actBtn, { borderColor: C.line }]}>
                <Icon name="plus" size={15} color={C.text2} sw={1.5} />
                <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>Yeni grup</Text>
              </Press>
              <Press haptic="none" onPress={openJoin} style={[s.actBtn, { borderColor: C.line }]}>
                <Icon name="hash" size={15} color={C.text2} />
                <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>Kodla katıl</Text>
              </Press>
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
        onLeave={() => { setDetailOpen(false); c.doLeave(c.selected); }}
      />
      <GroupCodeModal
        visible={c.createOpen}
        title="Grup kur"
        subtitle="Sınıfın, dershane grubun ya da arkadaşların. Adı herkes görür."
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
        title="Kodla katıl"
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
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
  list: { gap: STEP.s2 },
  actions: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s3 },
  actBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
    minHeight: 46,
    borderStyle: "dashed",
    borderRadius: SHAPE.button,
    borderWidth: 1,
  },
});
