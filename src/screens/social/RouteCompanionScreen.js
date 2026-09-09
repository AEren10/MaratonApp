import React, { memo, useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { useC } from "../../contexts/ThemeContext";
import { useRouteCompanion } from "../../hooks/useRouteCompanion";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../themes/tokens";
import { CompanionEffortCard } from "./components/CompanionEffortCard";

const PendingRow = memo(function PendingRow({ item, onRespond }) {
  const C = useC();
  return (
    <View style={[styles.pending, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.pendingCopy}>
        <Text style={[styles.pendingName, { color: C.text }]}>{item.companion?.name}</Text>
        <Text style={[styles.pendingNote, { color: C.sec }]}>Birlikte emek çizginizi görmek istiyor.</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Yol arkadaşlığını kabul et"
        onPress={() => onRespond(item.id, true)} style={[styles.accept, { backgroundColor: C.accent }]}>
        <Text style={[styles.acceptText, { color: C.textOnAccent }]}>Kabul et</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Yol arkadaşlığını reddet"
        onPress={() => onRespond(item.id, false)} style={styles.reject}>
        <Text style={[styles.rejectText, { color: C.sec }]}>Reddet</Text>
      </Pressable>
    </View>
  );
});

const FriendRow = memo(function FriendRow({ item, onRequest }) {
  const C = useC();
  return (
    <View style={[styles.pending, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.pendingCopy}>
        <Text style={[styles.pendingName, { color: C.text }]}>{item.name}</Text>
        <Text style={[styles.pendingNote, { color: C.sec }]}>Yalnızca haftalık emek toplamlarınız paylaşılır.</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`${item.name} kişisine yol arkadaşlığı isteği gönder`}
        onPress={() => onRequest(item.id)} style={[styles.accept, { backgroundColor: C.accent }]}>
        <Text style={[styles.acceptText, { color: C.textOnAccent }]}>Davet et</Text>
      </Pressable>
    </View>
  );
});

export default function RouteCompanionScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { dashboard, end, error, friends, items, loading, refresh, request, respond } = useRouteCompanion();
  const pending = useMemo(() => items.filter((item) => item.isIncoming), [items]);
  const rows = useMemo(() => [
    ...pending.map((item) => ({ kind: "pending", item })),
    ...(!dashboard ? friends.map((item) => ({ kind: "friend", item })) : []),
  ], [dashboard, friends, pending]);
  const renderItem = useCallback(({ item: row }) => row.kind === "pending"
    ? <PendingRow item={row.item} onRespond={respond} />
    : <FriendRow item={row.item} onRequest={request} />, [request, respond]);
  const active = useMemo(() => items.find((item) => item.status === "active"), [items]);
  const header = useMemo(() => dashboard ? (
    <View>
      <CompanionEffortCard dashboard={dashboard} />
      <Pressable accessibilityRole="button" accessibilityLabel="Yol arkadaşlığını bitir"
        onPress={() => active && end(active.id)} style={styles.endButton}>
        <Text style={[styles.endText, { color: C.sec }]}>Yol arkadaşlığını bitir</Text>
      </Pressable>
    </View>
  ) : null, [C.sec, active, dashboard, end]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button"
          accessibilityLabel="Geri" style={styles.back}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.title, { color: C.text }]}>Yol Arkadaşın</Text>
        <View style={styles.back} />
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={C.accent} /></View>
      ) : error ? (
        <EmptyState icon="users" title="Şimdilik gösteremiyoruz"
          message="Yol arkadaşlığı verisi alınamadı." actionLabel="Tekrar dene" onAction={refresh} />
      ) : !dashboard && rows.length === 0 ? (
        <EmptyState icon="users" title="Yan yana ilerlemek için"
          message="Kabul edilmiş bir arkadaşınla yol arkadaşlığı kurduğunda haftalık emeğiniz burada görünür." />
      ) : (
        <FlatList data={rows} renderItem={renderItem} keyExtractor={(row) => `${row.kind}-${row.item.id}`}
          ListHeaderComponent={header} contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={dashboard ? <Text style={[styles.quiet, { color: C.muted }]}>Netler değil, yalnızca emek görünür.</Text> : null} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg },
  back: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { ...TYPOGRAPHY.subheading },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: SPACING.lg, paddingBottom: SPACING.huge },
  separator: { height: SPACING.md },
  pending: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: SPACING.md, borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.md },
  pendingCopy: { flex: 1 },
  pendingName: { ...TYPOGRAPHY.bodySemiBold },
  pendingNote: { ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
  accept: { minHeight: 48, justifyContent: "center", borderRadius: RADIUS.md, paddingHorizontal: SPACING.md },
  acceptText: { ...TYPOGRAPHY.button },
  reject: { minHeight: 48, justifyContent: "center", paddingHorizontal: SPACING.sm },
  rejectText: { ...TYPOGRAPHY.captionMedium },
  endButton: { minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: SPACING.sm },
  endText: { ...TYPOGRAPHY.captionMedium },
  quiet: { ...TYPOGRAPHY.caption, textAlign: "center", marginTop: SPACING.xl },
});
