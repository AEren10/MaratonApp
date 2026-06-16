import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { listMyChallenges, createChallenge, cancelChallenge } from "../../supabase/challenges";
import { listFriends } from "../../supabase/friends";
import { SCREENS } from "../../constants/screens";

const METRICS = [
  { key: "questions", label: "Soru Sayısı", icon: "hash", targets: [100, 250, 500] },
  { key: "minutes", label: "Çalışma Süresi (dk)", icon: "clock", targets: [120, 300, 600] },
  { key: "streak", label: "Streak (gün)", icon: "flame", targets: [3, 7, 14] },
];

export default function ChallengeScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const [tab, setTab] = useState("active");
  const [challenges, setChallenges] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState({ friend: null, metric: null, target: null });

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [ch, fr] = await Promise.all([listMyChallenges(user.id), listFriends(user.id)]);
      setChallenges(ch || []);
      setFriends(fr || []);
    } catch {} finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = useCallback(async () => {
    if (!pick.friend || !pick.metric || !pick.target) return;
    try {
      await createChallenge({ opponentId: pick.friend.id, metric: pick.metric, target: pick.target });
      setCreating(false); setStep(0); setPick({ friend: null, metric: null, target: null });
      load();
    } catch { Alert.alert("Hata", "Challenge oluşturulamadı"); }
  }, [pick, load]);

  const handleCancel = useCallback(async (id) => {
    try { await cancelChallenge(id); load(); } catch {}
  }, [load]);

  const active = challenges.filter((c) => c.status === "active" || c.status === "pending");
  const past = challenges.filter((c) => c.status !== "active" && c.status !== "pending");

  const shown = tab === "active" ? active : past;

  if (loading) return <SafeAreaView style={s.safe}><View style={s.center}><ActivityIndicator color={C.amber} size="large" /></View></SafeAreaView>;

  if (creating) {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <View style={s.header}>
          <Pressable onPress={() => { setCreating(false); setStep(0); }} hitSlop={12}><Icon name="arrowL" size={20} color={C.text} /></Pressable>
          <Text style={s.title}>Yeni Challenge</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={{ padding: SPACING.lg, gap: SPACING.lg }}>
          {step === 0 && (
            <Animated.View entering={FadeInDown} style={{ gap: SPACING.md }}>
              <Text style={s.stepLabel}>Arkadaş Seç</Text>
              {friends.length === 0 ? <Text style={s.empty}>Henüz arkadaşın yok</Text> : friends.map((f) => (
                <Pressable key={f.id} onPress={() => { setPick((p) => ({ ...p, friend: f })); setStep(1); }}
                  style={[s.optionRow, pick.friend?.id === f.id && { borderColor: C.amber }]}>
                  <Icon name="user" size={16} color={C.sec} />
                  <Text style={s.optionText}>{f.name || "Kullanıcı"}</Text>
                </Pressable>
              ))}
            </Animated.View>
          )}
          {step === 1 && (
            <Animated.View entering={FadeInDown} style={{ gap: SPACING.md }}>
              <Text style={s.stepLabel}>Metrik Seç</Text>
              {METRICS.map((m) => (
                <Pressable key={m.key} onPress={() => { setPick((p) => ({ ...p, metric: m.key })); setStep(2); }}
                  style={s.optionRow}>
                  <Icon name={m.icon} size={16} color={C.amber} />
                  <Text style={s.optionText}>{m.label}</Text>
                </Pressable>
              ))}
            </Animated.View>
          )}
          {step === 2 && (
            <Animated.View entering={FadeInDown} style={{ gap: SPACING.md }}>
              <Text style={s.stepLabel}>Hedef Seç</Text>
              {(METRICS.find((m) => m.key === pick.metric)?.targets || []).map((t) => (
                <Pressable key={t} onPress={() => { setPick((p) => ({ ...p, target: t })); }}
                  style={[s.optionRow, pick.target === t && { borderColor: C.amber }]}>
                  <Text style={s.optionText}>{t}</Text>
                </Pressable>
              ))}
              {pick.target && (
                <Pressable onPress={handleCreate} style={s.cta}>
                  <Text style={s.ctaText}>Gönder</Text>
                </Pressable>
              )}
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Icon name="arrowL" size={20} color={C.text} /></Pressable>
        <Text style={s.title}>Challenges</Text>
        <Pressable onPress={() => setCreating(true)} hitSlop={12}><Icon name="plus" size={20} color={C.amber} /></Pressable>
      </View>

      <View style={s.tabs}>
        {["active", "past"].map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && { backgroundColor: C.amber + "18" }]}>
            <Text style={[s.tabText, tab === t && { color: C.amber }]}>{t === "active" ? "Aktif" : "Geçmiş"}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md }}
        ListEmptyComponent={<Text style={s.empty}>Henüz challenge yok</Text>}
        renderItem={({ item }) => {
          const isCreator = item.creator_id === user.id;
          const opponent = isCreator ? item.opponent : item.creator;
          const myProgress = isCreator ? item.creator_progress : item.opponent_progress;
          const theirProgress = isCreator ? item.opponent_progress : item.creator_progress;
          const pct = item.target > 0 ? Math.min(1, (myProgress || 0) / item.target) : 0;
          const metric = METRICS.find((m) => m.key === item.metric);
          return (
            <Animated.View entering={FadeInDown} style={s.card}>
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>{opponent?.name || "Rakip"}</Text>
                  <Text style={s.cardMeta}>{metric?.label || item.metric} · Hedef: {item.target}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: (item.status === "active" ? C.green : C.muted) + "18" }]}>
                  <Text style={{ ...TYPOGRAPHY.micro, color: item.status === "active" ? C.green : C.muted }}>{item.status === "active" ? "Aktif" : item.status}</Text>
                </View>
              </View>
              <View style={s.progressRow}>
                <Text style={s.progressLabel}>Sen: {myProgress || 0}</Text>
                <View style={s.bar}><View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: C.amber }]} /></View>
                <Text style={s.progressLabel}>{opponent?.name?.split(" ")[0]}: {theirProgress || 0}</Text>
              </View>
              {item.status === "active" && (
                <Pressable onPress={() => handleCancel(item.id)} style={s.cancelBtn}>
                  <Text style={{ ...TYPOGRAPHY.micro, color: C.red }}>İptal Et</Text>
                </Pressable>
              )}
            </Animated.View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { ...TYPOGRAPHY.subheading, color: C.text },
    tabs: { flexDirection: "row", gap: SPACING.sm, paddingHorizontal: SPACING.lg },
    tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill },
    tabText: { ...TYPOGRAPHY.captionMedium, color: C.muted },
    card: { backgroundColor: C.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: C.border },
    cardTop: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
    cardName: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    cardMeta: { ...TYPOGRAPHY.micro, color: C.muted, marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    progressRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.md },
    progressLabel: { ...TYPOGRAPHY.micro, color: C.sec, width: 70 },
    bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.surface2 },
    barFill: { height: 4, borderRadius: 2 },
    cancelBtn: { alignSelf: "flex-end", marginTop: SPACING.sm },
    stepLabel: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    optionRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, padding: SPACING.lg, backgroundColor: C.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: C.border },
    optionText: { ...TYPOGRAPHY.bodyMedium, color: C.text },
    empty: { ...TYPOGRAPHY.body, color: C.muted, textAlign: "center", marginTop: SPACING.xxl },
    cta: { backgroundColor: C.amber, borderRadius: RADIUS.xl, paddingVertical: SPACING.md, alignItems: "center" },
    ctaText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
  });
}
