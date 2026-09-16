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
        <View style={s.header}>
          <Text style={s.title}>Analiz</Text>
          <Button
            variant="primary"
            size="sm"
            icon="plus"
            onPress={() => go(screens.TRIAL_ENTRY, undefined, "analysis_header_trial_entry")}
            accessibilityLabel="Deneme gir"
            accessibilityHint="Yeni deneme sonucu giriş ekranına gider"
          >
            Deneme gir
          </Button>
        </View>

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

              <SectionLabel>DERS BAZLI TREND</SectionLabel>
              <AnimatedCard delay={160}>
                <SubjectBars
                  bars={analysis.bars}
                  onBarPress={(b) =>
                    go(screens.SUBJECT_LIST, { filter, subjectKey: b?.key }, "analysis_subject_list")
                  }
                />
              </AnimatedCard>

              <SectionLabel>DENEME KAYITLARI</SectionLabel>
              <AnimatedCard delay={300}>
                <HistoryList
                  history={analysis.history}
                  onPress={(trial) => go(screens.TRIAL_DETAIL, { trial }, "analysis_history_trial")}
                  onCompare={() => go(screens.TRIAL_COMPARE, undefined, "analysis_trial_compare")}
                  totalCount={analysis.filteredTrials?.length ?? 0}
                  onSeeAll={() => go(screens.TRIAL_RECORDS, undefined, "analysis_trial_records")}
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
    </SafeAreaView>
    </SwipeToHome>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { paddingHorizontal: STEP.s3, paddingBottom: 176 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: STEP.s2,
      marginTop: STEP.s3,
      marginBottom: STEP.s4,
    },
    title: { ...TYPOGRAPHY.heading, color: C.text },
    content: { gap: STEP.s4 },
  });
}
