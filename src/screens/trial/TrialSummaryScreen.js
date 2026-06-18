import { useEffect, useMemo, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { getTrialTypes, getAllSubjects } from "./trialTypes";
import { TrialShareCard } from "./components/TrialShareCard";
import { SCREENS } from "../../constants/screens";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

function StatPill({ icon, value, label, color, C }) {
  return (
    <View style={[st.stat, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={[st.statIcon, { backgroundColor: color + "18" }]}>
        <Icon name={icon} size={16} color={color} />
      </View>
      <Text style={[st.statVal, { color: C.text }]}>{value}</Text>
      <Text style={{ ...TYPOGRAPHY.caption, color: C.muted, fontSize: 10 }}>{label}</Text>
    </View>
  );
}

export default function TrialSummaryScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const trials = useSelector(selectTrials);
  const cardRef = useRef(null);
  const showAlert = useAlert();

  const trial = route.params?.trial;

  useEffect(() => { if (trial) H.success(); }, []);
  useEffect(() => { if (!trial) navigation.goBack(); }, [trial, navigation]);

  if (!trial) return null;

  const typeMeta = useMemo(() => getTrialTypes(C)[trial.trialType], [C, trial.trialType]);
  const typeColor = typeMeta?.color || C.amber;
  const allSubjects = useMemo(() => getAllSubjects(C), [C]);

  const subjects = useMemo(() => {
    if (trial.trialType === "BRANCH" && trial.branchSubject) {
      return allSubjects.filter((s) => s.key === trial.branchSubject);
    }
    return typeMeta?.subjects || [];
  }, [trial, typeMeta, allSubjects]);

  const bars = useMemo(() => subjects.map((s) => ({
    key: s.key, name: s.name, c: s.color,
    net: trial.subjects?.[s.key]?.net || 0,
    correct: trial.subjects?.[s.key]?.correct || 0,
    wrong: trial.subjects?.[s.key]?.wrong || 0,
    max: s.max,
  })), [subjects, trial.subjects]);

  const totalCorrect = useMemo(() => bars.reduce((s, b) => s + b.correct, 0), [bars]);
  const totalWrong = useMemo(() => bars.reduce((s, b) => s + b.wrong, 0), [bars]);

  const sameType = useMemo(
    () => [...trials].filter((t) => t.trialType === trial.trialType && t.id !== trial.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [trials, trial],
  );
  const prev = sameType[0];
  const trend = prev ? (trial.totalNet || 0) - (prev.totalNet || 0) : 0;

  const dateStr = trial.date
    ? new Date(trial.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Öğrenci";

  const handleShare = useCallback(async () => {
    H.medium();
    let captureRef, Sharing;
    try {
      ({ captureRef } = require("react-native-view-shot"));
      Sharing = require("expo-sharing");
    } catch {
      showAlert("Paylaşım kullanılamıyor", "Bu özellik için güncel uygulama derlemesi gerekiyor.");
      return;
    }
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (!(await Sharing.isAvailableAsync())) { showAlert("Paylaşım yok"); return; }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Deneme karneni paylaş" });
    } catch {
      showAlert("Hata", "Karne oluşturulamadı.");
    }
  }, []);

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: C.bg }]}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm }}>
        <Pressable
          onPress={() => navigation.replace(SCREENS.TRIAL_DETAIL, { trial, fromEntry: false })}
          hitSlop={12}
          accessibilityLabel="Kapat"
          accessibilityRole="button"
          style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.5 : 0.7 })}
        >
          <Icon name="x" size={22} color={C.muted} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={ZoomIn.delay(100).springify()} style={[st.heroCircle, { backgroundColor: typeColor + "20" }]}>
          <LinearGradient colors={[typeColor, typeColor + "CC"]} style={st.heroInner}>
            <Icon name="check" size={38} color="#FFFFFF" sw={3} />
          </LinearGradient>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(200)} style={[st.title, { color: C.text }]}>
          Deneme Kaydedildi!
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(280)} style={[st.nameBadge, { backgroundColor: typeColor + "14" }]}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: typeColor }}>
            {trial.name || typeMeta?.label || "Deneme"}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380)} style={st.netBox}>
          <Text style={[st.netNum, { color: C.text }]}>{(trial.totalNet || 0).toFixed(1)}</Text>
          <Text style={[st.netLabel, { color: typeColor }]}>TOPLAM NET</Text>
          {trend !== 0 && (
            <View style={[st.trendPill, { backgroundColor: (trend > 0 ? C.green : C.red) + "16" }]}>
              <Icon name={trend > 0 ? "trendUp" : "trendDown"} size={14} color={trend > 0 ? C.green : C.red} />
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: trend > 0 ? C.green : C.red }}>
                {trend > 0 ? "+" : ""}{trend.toFixed(1)} net
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(460)} style={st.statsRow}>
          <StatPill icon="check" value={String(totalCorrect)} label="Doğru" color={C.green} C={C} />
          <StatPill icon="x" value={String(totalWrong)} label="Yanlış" color={C.red} C={C} />
          <StatPill icon="hash" value={`#${sameType.length + 1}`} label="Deneme" color={C.purple} C={C} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(540)} style={[st.barsCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          {bars.map((b) => {
            const pct = b.max > 0 ? Math.max(0, b.net / b.max) : 0;
            return (
              <View key={b.key} style={st.barRow}>
                <View style={[st.barDot, { backgroundColor: b.c }]} />
                <Text style={[st.barName, { color: C.text }]} numberOfLines={1}>{b.name}</Text>
                <View style={[st.barTrack, { backgroundColor: C.surface2 }]}>
                  <View style={{ width: `${Math.min(100, pct * 100)}%`, height: 6, borderRadius: 3, backgroundColor: b.c }} />
                </View>
                <Text style={[st.barNet, { color: b.c }]}>{b.net.toFixed(1)}</Text>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(620)} style={st.actions}>
          <Pressable onPress={handleShare} accessibilityLabel="Paylaş" accessibilityRole="button" style={({ pressed }) => [st.shareBtn, { backgroundColor: C.surface, borderColor: C.border, opacity: pressed ? 0.85 : 1 }]}>
            <Icon name="share" size={18} color={C.amber} />
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.text }}>Paylaş</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.replace(SCREENS.TRIAL_DETAIL, { trial, fromEntry: false })}
            style={({ pressed }) => [st.detailBtn, { backgroundColor: typeColor, opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF" }}>Detayları Gör</Text>
            <Icon name="arrowR" size={16} color="#FFFFFF" sw={2.5} />
          </Pressable>
        </Animated.View>
      </ScrollView>

      <View style={st.offscreen} pointerEvents="none">
        <TrialShareCard
          ref={cardRef}
          typeName={typeMeta?.label || trial.trialType}
          trialTitle={trial.name}
          net={trial.totalNet || 0}
          dateStr={dateStr}
          bars={bars}
          trend={trend}
          userName={displayName}
        />
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { alignItems: "center", paddingHorizontal: SPACING.xl, paddingTop: 44, paddingBottom: 40 },
  heroCircle: { width: 104, height: 104, borderRadius: 52, alignItems: "center", justifyContent: "center" },
  heroInner: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", ...SHADOWS.card },
  title: { ...TYPOGRAPHY.heading, fontSize: 26, marginTop: SPACING.lg },
  nameBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, marginTop: SPACING.sm },
  netBox: { alignItems: "center", marginVertical: SPACING.xl },
  netNum: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 64, letterSpacing: -2.5, lineHeight: 68 },
  netLabel: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 2, marginTop: -2 },
  trendPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 10 },
  statsRow: { flexDirection: "row", gap: SPACING.sm, width: "100%" },
  stat: { flex: 1, alignItems: "center", gap: 5, padding: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1 },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  statVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 20 },
  barsCard: { width: "100%", borderRadius: RADIUS.xl, padding: SPACING.lg, marginTop: SPACING.lg, borderWidth: 1, gap: 12 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barDot: { width: 8, height: 8, borderRadius: 4 },
  barName: { ...TYPOGRAPHY.bodyMedium, fontSize: 13, width: 64 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  barNet: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, width: 42, textAlign: "right" },
  actions: { flexDirection: "row", gap: 12, width: "100%", marginTop: SPACING.xxl },
  shareBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: RADIUS.xl, borderWidth: 1 },
  detailBtn: { flex: 1.4, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: RADIUS.xl, ...SHADOWS.card },
  offscreen: { position: "absolute", top: -9999, left: -9999 },
});
