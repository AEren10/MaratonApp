import React, { useCallback } from "react";
import { FlatList, Modal, View, Text, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { CONTROL, GUTTER, NAV_ICON, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { GroupCodeCard } from "./GroupCodeCard";
import { GroupCompetitionBanner } from "./GroupCompetitionBanner";
import { GroupMemberRow } from "./GroupMemberRow";
import { GroupStreakRow } from "./GroupStreakRow";
import { GroupWeekHero } from "./GroupWeekHero";

// Grup odasi. Sira: haftanin durumu -> seri -> siralama -> davet -> ayril.
// Davet kodu eskiden en ustteydi; odaya her giriste ilk gorulen sey
// "paylas" butonu oluyordu. Ayrilma yalniz listede basili tutunca vardi.
export function GroupDetailPanel({ visible, group, board, boardError, standing, onClose, onRetry, onShare, onLeave }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const members = board?.list || [];
  const renderMember = useCallback(({ item }) => <GroupMemberRow item={item} />, []);
  const keyExtractor = useCallback((item) => String(item.user_id), []);

  if (!group) return null;
  const memberCount = Number(group.member_count ?? group.memberCount ?? members.length) || members.length;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView edges={["bottom"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <View style={[s.topBar, { paddingTop: Math.max(insets.top, STEP.s3) }]}>
          <Press haptic="none" onPress={onClose} accessibilityLabel="Gruplara dön" style={s.iconBtn}>
            <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
          </Press>
          <Press haptic="none" onPress={() => onShare?.(group)} accessibilityLabel="Davet et" style={s.iconBtn}>
            <Icon name="share" size={NAV_ICON.action} color={C.text2} />
          </Press>
        </View>

        <FlatList
          data={boardError ? [] : members}
          renderItem={renderMember}
          keyExtractor={keyExtractor}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={(
            <View>
              <Text style={[TYPOGRAPHY.display, { color: C.text }]} numberOfLines={2}>{group.name}</Text>
              <Text style={[TYPOGRAPHY.caption, s.sub, { color: C.text3 }]}>{memberCount} üye · haftalık soru yarışı</Text>
              <GroupWeekHero group={group} members={members} />
              <GroupCompetitionBanner standing={standing} />
              <GroupStreakRow groupId={group.id} />
              <View style={s.memberHead}>
                <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>HAFTALIK SIRALAMA</Text>
                <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>soru · süre</Text>
              </View>
              {boardError ? (
                <View style={[s.error, { borderColor: C.line, backgroundColor: C.surface }]}>
                  <Text style={[TYPOGRAPHY.caption, s.center, { color: C.text3 }]}>
                    Sıralama yüklenemedi. Bağlantını kontrol edip tekrar dene.
                  </Text>
                  <Press haptic="none" onPress={onRetry} style={[s.retry, { borderColor: C.border }]}>
                    <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Tekrar dene</Text>
                  </Press>
                </View>
              ) : null}
            </View>
          )}
          ListEmptyComponent={!boardError ? (
            <Text style={[TYPOGRAPHY.caption, s.empty, { color: C.text3 }]}>Bu hafta henüz kimse soru çözmedi. İlk soru seninki olsun.</Text>
          ) : null}
          ListFooterComponent={(
            <View style={s.footer}>
              <GroupCodeCard group={group} onShare={onShare} />
              <Press haptic="none" onPress={onLeave} accessibilityLabel="Gruptan ayrıl" style={s.leave}>
                <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Gruptan ayrıl</Text>
              </Press>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: GUTTER - 10, paddingBottom: STEP.s1 },
  iconBtn: { minWidth: CONTROL.tapMin, minHeight: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 },
  sub: { marginTop: 4, marginBottom: STEP.s3 },
  memberHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: STEP.s3, marginBottom: STEP.s1 },
  error: { alignItems: "center", gap: STEP.s1, padding: STEP.s3, borderRadius: SHAPE.card, borderWidth: 1 },
  center: { textAlign: "center" },
  retry: { minHeight: CONTROL.tapMin, justifyContent: "center", paddingHorizontal: STEP.s3, borderRadius: SHAPE.button, borderWidth: 1 },
  empty: { textAlign: "center", paddingVertical: STEP.s3 },
  footer: { marginTop: STEP.s4, gap: STEP.s2 },
  leave: { minHeight: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
});
