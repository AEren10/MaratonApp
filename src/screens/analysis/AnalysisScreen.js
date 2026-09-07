import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, RefreshControl } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TYPOGRAPHY, SPACING, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon, GlowBackground, WARM_GLOW } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SectionLabel } from "../../components/design";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { SwipeToHome } from "../../components/common/SwipeToHome";
import { AnimatedCard } from "../../components/design/AnimatedCard";

import { NudgePopup } from "../../components/common/NudgePopup";
import { SubjectBars } from "./components/SubjectBars";
import { HistoryList } from "./components/HistoryList";
import { TrialFilter } from "./components/TrialFilter";
import { MoodTrend } from "./components/MoodTrend";
import { AnalysisOverviewSection } from "./components/AnalysisOverviewSection";
import { AnalysisPracticeSection } from "./components/AnalysisPracticeSection";
import { AnalysisShortcutRow } from "./components/AnalysisShortcutRow";
import { AnalysisTrendSection } from "./components/AnalysisTrendSection";
import { useAnalysisController } from "./useAnalysisController";

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

export default function AnalysisScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const {
    analysis,
    changeFilter,
    dismissNudgePopup,
    filter,
    go,
    handleNudgeAction,
    loading,
    nudgePopup,
    onRefresh,
    openSimulator,
    refreshing,
    screens,
  } = useAnalysisController(C);

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />}
      >
        <Text style={s.title}>Analiz</Text>

        <TrialFilter value={filter} onChange={changeFilter} />

        <View style={s.content}>
          {analysis.empty ? (
            <EmptyState
              icon="chart"
              title="İlk deneme sonucunu gir"
              message={filter === "ALL" ? "Net trendin, ders bazlı analizin ve gelişim grafiklerin burada olacak" : `${filter} denemeni gir, karşılaştırmaya başlayalım`}
              actionLabel="Deneme Gir"
              onAction={() => go(screens.TRIAL_ENTRY, undefined, "analysis_empty_trial_entry")}
              color="accent"
            />
          ) : (
            <>
              <AnalysisTrendSection
                C={C}
                analysis={analysis}
                filter={filter}
                go={go}
                screens={screens}
              />

              <AnalysisShortcutRow C={C} go={go} screens={screens} />

              <AnalysisOverviewSection C={C} analysis={analysis} filter={filter} />

              <SectionLabel>DERSLER</SectionLabel>
              <AnimatedCard delay={160}>
                <SubjectBars
                  bars={analysis.bars}
                  onBarPress={(b) =>
                    go(screens.SUBJECT_LIST, { filter, subjectKey: b?.key }, "analysis_subject_list")
                  }
                />
              </AnimatedCard>

              <SectionLabel>GEÇMİŞ</SectionLabel>
              <AnimatedCard delay={300}>
                <HistoryList
                  history={analysis.history}
                  onPress={(trial) => go(screens.TRIAL_DETAIL, { trial }, "analysis_history_trial")}
                  onCompare={() => go(screens.TRIAL_COMPARE, undefined, "analysis_trial_compare")}
                />
              </AnimatedCard>

              <AnimatedCard delay={360}>
                <MoodTrend trials={analysis.filteredTrials} />
              </AnimatedCard>

              <AnalysisPracticeSection
                C={C}
                go={go}
                onSimulator={openSimulator}
                screens={screens}
              />
            </>
          )}
        </View>
      </ScrollView>

      <NudgePopup
        nudge={nudgePopup}
        visible={!!nudgePopup}
        onDismiss={dismissNudgePopup}
        onAction={handleNudgeAction}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Deneme Gir"
        accessibilityHint="Yeni deneme sonucu giriş ekranına gider"
        onPress={() => go(screens.TRIAL_ENTRY, undefined, "analysis_fab_trial_entry")}
        style={({ pressed }) => [s.fab, pressed && s.fabPressed]}
      >
        <Icon name="plus" size={22} color={C.textOnFill} sw={2.5} />
        <Text style={s.fabText}>Deneme Gir</Text>
      </Pressable>
    </SafeAreaView>
    </SwipeToHome>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 176 },
    title: { ...TYPOGRAPHY.heading, color: C.text, marginTop: SPACING.lg, marginBottom: SPACING.xl },
    content: { gap: SPACING.xl },
    fab: {
      position: "absolute",
      bottom: 90,
      right: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: C.accent,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: 999,
      ...SHADOWS.fab,
    },
    fabPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
    fabText: { ...TYPOGRAPHY.button, color: C.textOnFill },
  });
}
