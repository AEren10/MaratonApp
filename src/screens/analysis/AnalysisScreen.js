import React, { useMemo } from "react";
import { View, Text, StyleSheet, RefreshControl } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TYPOGRAPHY, STEP } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SectionLabel, Button, EmptyState, Skeleton } from "../../components/design";
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
    <View style={{ paddingHorizontal: STEP.s3, paddingTop: STEP.s5, gap: STEP.s4 }}>
      <Skeleton height={28} width={80} radius={8} />
      <Skeleton height={48} />
      <Skeleton height={120} />
      <Skeleton height={160} />
      <Skeleton height={200} />
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
              preset="analysisThin"
              onPrimary={() => go(screens.TRIAL_ENTRY, undefined, "analysis_empty_trial_entry")}
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

      <Button
        variant="primary"
        size="lg"
        icon="plus"
        onPress={() => go(screens.TRIAL_ENTRY, undefined, "analysis_fab_trial_entry")}
        accessibilityLabel="Deneme Gir"
        accessibilityHint="Yeni deneme sonucu giriş ekranına gider"
        style={s.fab}
      >
        Deneme Gir
      </Button>
    </SafeAreaView>
    </SwipeToHome>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { paddingHorizontal: STEP.s3, paddingBottom: 176 },
    title: { ...TYPOGRAPHY.heading, color: C.text, marginTop: STEP.s3, marginBottom: STEP.s4 },
    content: { gap: STEP.s4 },
    fab: {
      position: "absolute",
      bottom: 90,
      right: STEP.s2,
    },
  });
}
