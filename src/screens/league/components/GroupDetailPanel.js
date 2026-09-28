import React, { useCallback } from "react";
import { FlatList, Modal, View, Text, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, SPACING, RADIUS, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { GroupCodeCard } from "./GroupCodeCard";
import { GroupCompetitionBanner } from "./GroupCompetitionBanner";
import { GroupMemberRow } from "./GroupMemberRow";

export function GroupDetailPanel({
  visible,
  group,
  board,
  boardError,
  standing,
  onClose,
  onRetry,
  onShare,
}) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const members = board?.list || [];
  const renderMember = useCallback(({ item }) => (
    <GroupMemberRow item={item} />
  ), []);
  const keyExtractor = useCallback((item) => String(item.user_id), []);

  if (!group) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView edges={["bottom"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <View style={[s.topBar, { paddingTop: Math.max(insets.top, SPACING.xl) + SPACING.sm }]}>
          <Press haptic="none" onPress={onClose} accessibilityRole="button" accessibilityLabel="Grup listesini aç" style={s.backHit}>
            <Icon name="chevL" size={20} color={C.text2} />
          </Press>
          <View style={s.titleCol}>
            <Text style={[s.title, { color: C.text }]} numberOfLines={1}>{group.name}</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]} numberOfLines={1}>
              {Number(group.member_count ?? group.memberCount ?? members.length) || members.length} üye · haftalık oda
            </Text>
          </View>
        </View>

        <FlatList
          data={boardError ? [] : members}
          renderItem={renderMember}
          keyExtractor={keyExtractor}
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={MemberGap}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={(
            <View>
              <GroupCodeCard group={group} onShare={onShare} />
              <GroupCompetitionBanner standing={standing} />
              <View style={s.memberHead}>
                <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ÜYELER</Text>
                <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Bu hafta</Text>
              </View>
              {boardError ? (
                <View style={[s.boardError, { borderColor: C.border, backgroundColor: C.surface }]}>
                  <Text style={[TYPOGRAPHY.caption, s.errorText, { color: C.text3 }]}>
                    Sıralama yüklenemedi. Bağlantını kontrol edip tekrar dene.
                  </Text>
                  <Press haptic="none" onPress={onRetry} style={[s.retryBtn, { borderColor: C.border }]}>
                    <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Tekrar dene</Text>
                  </Press>
                </View>
              ) : null}
            </View>
          )}
          ListEmptyComponent={!boardError ? (
            <Text style={[TYPOGRAPHY.caption, s.emptySub, { color: C.text3 }]}>
              Bu hafta kimse aktif değil.
            </Text>
          ) : null}
        />
      </SafeAreaView>
    </Modal>
  );
}

function MemberGap() {
  return <View style={s.gap} />;
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backHit: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  titleCol: { flex: 1 },
  title: { ...TYPOGRAPHY.heading },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  memberHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  gap: { height: SPACING.xs },
  boardError: {
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  errorText: { textAlign: "center" },
  retryBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1 },
  emptySub: { textAlign: "center", paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
});
