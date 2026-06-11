import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, RefreshControl } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { SUBJECTS } from "../trial/trialSubjects";
import { C, TYPOGRAPHY, SPACING, SHADOWS } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { Icon } from "../../components/design";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { AnimatedCard } from "../../components/design/AnimatedCard";

import { LatestScore } from "./components/LatestScore";
import { SubjectBars } from "./components/SubjectBars";
import { TrendChart } from "./components/TrendChart";
import { HistoryList } from "./components/HistoryList";

function AnalysisSkeleton() {
  return (
    <View style={{ paddingHorizontal: SPACING.lg, paddingTop: 60, gap: SPACING.xl }}>
      <SkeletonCard height={28} width={80} rounded={8} />
      <SkeletonCard height={120} />
      <SkeletonCard height={160} />
      <SkeletonCard height={200} />
      <SkeletonCard height={80} />
    </View>
  );
}

export default function AnalysisScreen() {
  const navigation = useNavigation();
  const trials = useSelector(selectTrials);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const deneme = useMemo(() => {
    if (!trials.length) {
      return {
        latest: { net: 0, trend: 0, date: "Henüz deneme yok" },
        bars: [],
        line: [],
        lineLabels: [],
        history: [],
      };
    }
    const sorted = [...trials].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sorted[0];
    const prev = sorted[1];
    const net = latest.totalNet || 0;
    const trend = prev ? net - (prev.totalNet || 0) : 0;
    const history = sorted.slice(0, 6).map((t, i) => {
      const prevT = sorted[i + 1];
      return {
        date: new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        net: t.totalNet || 0,
        trend: prevT ? (t.totalNet || 0) - (prevT.totalNet || 0) : 0,
      };
    });
    const bars = SUBJECTS.map((s) => ({
      key: s.key,
      name: s.name,
      color: s.color,
      net: latest?.subjects?.[s.key]?.net || 0,
      max: s.max,
    }));
    const line = history.map((h) => h.net).reverse();
    const lineLabels = history.map((h) => h.date).reverse();
    return {
      latest: { net, trend, date: new Date(latest.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) },
      bars,
      line,
      lineLabels,
      history,
    };
  }, [trials]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleTrialEntry = () => navigation.navigate(SCREENS.TRIAL_ENTRY);
  const handleHistoryPress = (h) => navigation.navigate(SCREENS.TRIAL_DETAIL, { trial: h });

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <AnalysisSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} colors={[C.amber]} />}
      >
        <Text style={s.title}>Analiz</Text>

        <View style={s.content}>
          <AnimatedCard delay={0}>
            <LatestScore
              net={deneme.latest.net}
              trend={deneme.latest.trend}
              date={deneme.latest.date}
            />
          </AnimatedCard>

          <AnimatedCard delay={100}>
            <SubjectBars bars={deneme.bars} onBarPress={(b) => navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: b.key, subjectName: b.name })} />
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <TrendChart data={deneme.line} labels={deneme.lineLabels} />
          </AnimatedCard>

          <AnimatedCard delay={300}>
            <HistoryList history={deneme.history} onPress={handleHistoryPress} />
          </AnimatedCard>
        </View>
      </ScrollView>

      <Pressable
        onPress={handleTrialEntry}
        style={({ pressed }) => [s.fab, pressed && s.fabPressed]}
      >
        <Icon name="plus" size={22} color={C.bg} sw={2.5} />
        <Text style={s.fabText}>Deneme Gir</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 120 },
  title: { ...TYPOGRAPHY.heading, color: C.text, marginTop: SPACING.lg, marginBottom: SPACING.xl },
  content: { gap: SPACING.xl },
  fab: {
    position: "absolute",
    bottom: 100,
    right: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: C.amber,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 999,
    ...SHADOWS.fab,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  fabText: { ...TYPOGRAPHY.button, color: C.bg },
});
