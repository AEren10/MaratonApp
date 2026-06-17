import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, RefreshControl } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { getTrialTypes, getAllSubjects } from "../trial/trialTypes";
import { useSync } from "../../contexts/DataSyncContext";
import { TYPOGRAPHY, SPACING, SHADOWS, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { SCREENS } from "../../constants/screens";
import { Icon, GlowBackground, WARM_GLOW, GlassCard, Stat, Trend, Chip } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionLabel } from "../../components/design";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { SwipeToHome } from "../../components/common/SwipeToHome";
import { AnimatedCard } from "../../components/design/AnimatedCard";
import * as H from "../../lib/haptics";

import { NudgePopup } from "../../components/common/NudgePopup";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useNudgePopup } from "../../hooks/useNudgePopup";
import { LatestScore } from "./components/LatestScore";
import { SubjectBars } from "./components/SubjectBars";
import { TrendChart } from "./components/TrendChart";
import { HistoryList } from "./components/HistoryList";
import { TrialFilter } from "./components/TrialFilter";
import { MoodTrend } from "./components/MoodTrend";

function AnalysisSkeleton() {
  return (
    <View style={{ paddingHorizontal: SPACING.lg, paddingTop: 60, gap: SPACING.xl }}>
      <SkeletonCard height={28} width={80} rounded={8} />
      <SkeletonCard height={48} />
      <SkeletonCard height={120} />
      <SkeletonCard height={160} />
      <SkeletonCard height={200} />
    </View>
  );
}

function filterTrials(trials, filter) {
  if (filter === "ALL") return trials.filter((t) => t.trialType !== "BRANCH");
  if (filter === "TYT") return trials.filter((t) => t.trialType === "TYT");
  if (filter === "LGS") return trials.filter((t) => t.trialType === "LGS");
  if (filter === "BRANCH") return trials.filter((t) => t.trialType === "BRANCH");
  if (filter === "AYT") {
    return trials.filter((t) => t.trialType && t.trialType.startsWith("AYT"));
  }
  return trials;
}

function subjectsForFilter(C, filter, latestTrial, examType) {
  const TRIAL_TYPES = getTrialTypes(C);
  const ALL_SUBJECTS = getAllSubjects(C);
  if (filter === "TYT") return TRIAL_TYPES.TYT.subjects;
  if (filter === "LGS") return TRIAL_TYPES.LGS.subjects;
  if (filter === "AYT" && latestTrial?.trialType) {
    const type = TRIAL_TYPES[latestTrial.trialType];
    if (type) return type.subjects;
  }
  if (filter === "BRANCH" && latestTrial?.branchSubject) {
    return ALL_SUBJECTS.filter((s) => s.key === latestTrial.branchSubject);
  }
  if (filter === "ALL" && latestTrial?.trialType) {
    const type = TRIAL_TYPES[latestTrial.trialType];
    if (type) return type.subjects;
  }
  if (examType === "lgs") return TRIAL_TYPES.LGS.subjects;
  return TRIAL_TYPES.TYT.subjects;
}

export default function AnalysisScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { examType } = useExam();
  const s = useMemo(() => makeStyles(C), [C]);
  const trials = useSelector(selectTrials);
  const nudges = useRecommendations();
  const { popup: nudgePopup, showNext: showNudgePopup, dismiss: dismissNudgePopup } = useNudgePopup(nudges);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const deneme = useMemo(() => {
    const filtered = filterTrials(trials, filter);
    if (!filtered.length) {
      return {
        latest: { net: 0, trend: 0, date: "Henüz deneme yok" },
        bars: [],
        line: [],
        lineLabels: [],
        history: [],
        empty: true,
      };
    }
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sorted[0];
    const prev = sorted[1];
    const net = latest.totalNet || 0;
    const trend = prev ? net - (prev.totalNet || 0) : 0;
    const heroType = latest.trialType;
    const heroSlice = filter === "ALL"
      ? sorted.filter((t) => t.trialType === heroType).slice(0, 12)
      : sorted.slice(0, 12);
    const history = sorted.slice(0, 6).map((t, i) => {
      const prevT = sorted[i + 1];
      return {
        id: t.id,
        date: new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        net: t.totalNet || 0,
        trend: prevT ? (t.totalNet || 0) - (prevT.totalNet || 0) : 0,
        trialType: t.trialType,
        name: t.name,
      };
    });
    const subjects = subjectsForFilter(C, filter, latest, examType);
    const bars = subjects.map((sub) => ({
      key: sub.key,
      name: sub.name,
      color: sub.color,
      net: latest?.subjects?.[sub.key]?.net || 0,
      max: sub.max,
    }));
    const line = history.map((h) => h.net).reverse();
    const lineLabels = history.map((h) => h.date).reverse();
    const heroLine = heroSlice.slice().reverse().map((t) => t.totalNet || 0);
    const heroLabels = heroSlice.slice().reverse().map((t) =>
      new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
    );
    let typeBreakdown = null;
    if (filter === "ALL") {
      const byType = {};
      sorted.forEach((t) => {
        if (!byType[t.trialType]) byType[t.trialType] = [];
        byType[t.trialType].push(t);
      });
      const types = getTrialTypes(C);
      typeBreakdown = Object.entries(byType)
        .filter(([, arr]) => arr.length > 0)
        .map(([type, arr]) => {
          const lat = arr[0];
          const prev = arr[1];
          const color = types[type]?.color || C.amber;
          return {
            type,
            label: types[type]?.label || type,
            color,
            net: lat.totalNet || 0,
            trend: prev ? (lat.totalNet || 0) - (prev.totalNet || 0) : 0,
            date: new Date(lat.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
            count: arr.length,
          };
        });
    }

    return {
      latest: {
        net,
        trend,
        date: new Date(latest.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
        typeLabel: getTrialTypes(C)[latest.trialType]?.label || latest.name || "Deneme",
      },
      bars,
      line,
      lineLabels,
      heroLine,
      heroLabels,
      history,
      typeBreakdown,
      empty: false,
    };
  }, [trials, filter, C, examType]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      showNudgePopup(3000);
    }, 600);
    return () => clearTimeout(t);
  }, [showNudgePopup]);

  const { refresh } = useSync();
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

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
    <SwipeToHome>
    <SafeAreaView edges={["top"]} style={s.safe}>
      <GlowBackground blobs={WARM_GLOW} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} colors={[C.amber]} />}
      >
        <Text style={s.title}>Analiz</Text>

        <TrialFilter value={filter} onChange={(v) => { H.select(); setFilter(v); }} />

        <View style={s.content}>
          {deneme.empty ? (
            <EmptyState
              icon="edit"
              title="Henüz deneme yok"
              message={filter === "ALL" ? "İlk denemeni gir, analizleri burada gör" : `${filter} denemesi henüz girmedin`}
              color="amber"
            />
          ) : (
            <>
              {deneme.heroLine && deneme.heroLine.length > 1 && (
                <View>
                <SectionLabel>TREND</SectionLabel>
                <AnimatedCard delay={0}>
                  <TrendChart
                    data={deneme.heroLine}
                    labels={deneme.heroLabels}
                    title="Net Trendin"
                    color={C.accent}
                  />
                  <Pressable
                    onPress={() => navigation.navigate(SCREENS.TRIAL_INSIGHTS)}
                    style={{
                      flexDirection: "row", alignItems: "center", justifyContent: "center",
                      gap: 8, marginTop: SPACING.lg, paddingVertical: 12, paddingHorizontal: SPACING.lg,
                      backgroundColor: C.amber + "18", borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.amber + "30",
                    }}
                  >
                    <Icon name="trendUp" size={16} color={C.amber} />
                    <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.amber }}>Detaylı Analiz</Text>
                    <Icon name="chevR" size={14} color={C.amber} />
                  </Pressable>
                </AnimatedCard>
                </View>
              )}

              <SectionLabel>GENEL</SectionLabel>
              {filter === "ALL" && deneme.typeBreakdown?.length > 1 ? (
                <View style={{ flexDirection: "row", gap: SPACING.sm }}>
                  {deneme.typeBreakdown.map((tb) => (
                    <AnimatedCard key={tb.type} delay={80} style={{ flex: 1 }}>
                      <GlassCard style={{ padding: SPACING.lg, alignItems: "center", gap: SPACING.sm }}>
                        <Chip color={tb.color}>{tb.label}</Chip>
                        <Stat size={36} color={C.text}>{tb.net}</Stat>
                        <Text style={{ ...TYPOGRAPHY.micro, color: C.sec }}>toplam net</Text>
                        <Trend v={tb.trend} size={12} />
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <Icon name="calendar" size={11} color={C.muted} />
                          <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>{tb.date}</Text>
                        </View>
                      </GlassCard>
                    </AnimatedCard>
                  ))}
                </View>
              ) : (
                <AnimatedCard delay={80}>
                  <LatestScore
                    net={deneme.latest.net}
                    trend={deneme.latest.trend}
                    date={deneme.latest.date}
                    typeLabel={deneme.latest.typeLabel}
                  />
                </AnimatedCard>
              )}

              <SectionLabel>DERSLER</SectionLabel>
              <AnimatedCard delay={160}>
                <SubjectBars
                  bars={deneme.bars}
                  onBarPress={(b) =>
                    navigation.navigate(SCREENS.SUBJECT_DETAIL, {
                      subjectKey: b.key,
                      subjectName: b.name,
                    })
                  }
                />
              </AnimatedCard>

              <SectionLabel>GEÇMİŞ</SectionLabel>
              <AnimatedCard delay={300}>
                <HistoryList
                  history={deneme.history}
                  onPress={handleHistoryPress}
                  onCompare={() => navigation.navigate(SCREENS.TRIAL_COMPARE)}
                />
              </AnimatedCard>

              <AnimatedCard delay={360}>
                <MoodTrend trials={filterTrials(trials, filter)} />
              </AnimatedCard>

              <SectionLabel>PRATİK</SectionLabel>
              <AnimatedCard delay={420}>
                <View style={{ flexDirection: "row", gap: SPACING.sm }}>
                  <Pressable
                    onPress={() => navigation.navigate(SCREENS.QUICK_PRACTICE)}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: SPACING.md, borderRadius: 16, backgroundColor: C.green + "10", borderWidth: 1, borderColor: C.green + "20" }}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.green + "20", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="target" size={15} color={C.green} />
                    </View>
                    <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.green }}>5dk Quiz</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => navigation.navigate(SCREENS.EXAM_SIMULATOR)}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: SPACING.md, borderRadius: 16, backgroundColor: C.red + "10", borderWidth: 1, borderColor: C.red + "20" }}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.red + "20", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="clock" size={15} color={C.red} />
                    </View>
                    <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.red }}>Simülasyon</Text>
                  </Pressable>
                </View>
              </AnimatedCard>
            </>
          )}
        </View>
      </ScrollView>

      <NudgePopup
        nudge={nudgePopup}
        visible={!!nudgePopup}
        onDismiss={dismissNudgePopup}
        onAction={(n) => {
          dismissNudgePopup();
          if (n.subject) navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: n.subject });
        }}
      />

      <Pressable
        onPress={handleTrialEntry}
        style={({ pressed }) => [s.fab, pressed && s.fabPressed]}
      >
        <Icon name="plus" size={22} color="#FFFFFF" sw={2.5} />
        <Text style={s.fabText}>Deneme Gir</Text>
      </Pressable>
    </SafeAreaView>
    </SwipeToHome>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
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
      shadowColor: C.amber,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 14,
      elevation: 6,
    },
    fabPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
    fabText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
  });
}
