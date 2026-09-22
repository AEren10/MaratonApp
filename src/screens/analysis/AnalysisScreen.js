import React, { useMemo } from "react";
import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useC } from "../../contexts/ThemeContext";
import { SwipeToHome } from "../../components/common/SwipeToHome";
import { NudgePopup } from "../../components/common/NudgePopup";

import { AnalysisHeader } from "./components/AnalysisHeader";
import { AnalysisFilterPills } from "./components/AnalysisFilterPills";
import { AnalysisInsightsCard } from "./components/AnalysisInsightsCard";
import { AnalysisHeroScore } from "./components/AnalysisHeroScore";
import { SubjectTrendCards } from "./components/SubjectTrendCards";
import { AnalysisTrialHistory } from "./components/AnalysisTrialHistory";
import { PublisherComparisonCard } from "./components/PublisherComparisonCard";
import { buildPublisherComparison } from "../../domain/analysis/publisherComparison";
import { DeeperAnalysisSection } from "./components/DeeperAnalysisSection";
import { AnalysisSkeleton } from "./components/AnalysisSkeleton";
import { AnalysisStickyFab } from "./components/AnalysisStickyFab";
import { useAnalysisController } from "./useAnalysisController";

export default function AnalysisScreen() {
  const C = useC();
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

  const totalTrials = analysis.filteredTrials?.length ?? 0;
  const publisherComparison = useMemo(
    () => buildPublisherComparison(analysis.filteredTrials || []),
    [analysis.filteredTrials],
  );

  return (
    <SwipeToHome>
      <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.accent}
              colors={[C.accent]}
            />
          }
        >
          <AnalysisHeader
            C={C}
            onAddTrial={() => go(screens.TRIAL_ENTRY, undefined, "analysis_header_trial_entry")}
          />

          {loading ? (
            <AnalysisSkeleton />
          ) : (
            <>
              <AnalysisFilterPills
                C={C}
                value={filter}
                onChange={changeFilter}
              />

              <AnalysisInsightsCard C={C} />

              <AnalysisHeroScore
                C={C}
                latest={analysis.latest}
                heroLine={analysis.heroLine}
                heroLabels={analysis.heroLabels}
              />

              {/* DERS BAZLI TREND */}
              <SubjectTrendCards
                C={C}
                bars={analysis.bars}
                onSelectSubject={(subj) =>
                  go(screens.SUBJECT_DETAIL, { subjectKey: subj.key, subjectName: subj.name }, "analysis_subject_card")
                }
              />

              {/* DENEME KAYITLARI */}
              <AnalysisTrialHistory
                C={C}
                history={analysis.history}
                totalCount={totalTrials}
                onSelectTrial={(trial) =>
                  go(screens.TRIAL_DETAIL, { trial }, "analysis_trial_detail")
                }
                onSeeAll={() =>
                  go(screens.TRIAL_RECORDS, undefined, "analysis_all_trials")
                }
              />

              <PublisherComparisonCard C={C} comparison={publisherComparison} />

              <DeeperAnalysisSection
                C={C}
                onKonuIlerlemesi={() => go(screens.SUBJECT_LIST, undefined, "analysis_subject_list")}
                onOncelikliKonular={() => go(screens.WEAK_AREAS, undefined, "analysis_weak_areas")}
                onNetTahmini={() => go(screens.NET_FORECAST, undefined, "analysis_forecast")}
                onYayinKarsilastirmasi={() => go(screens.COMPARATIVE, undefined, "analysis_comparative")}
                onSimulasyon={openSimulator}
              />
            </>
          )}
        </ScrollView>

        <AnalysisStickyFab
          C={C}
          onPress={() => go(screens.TRIAL_ENTRY, undefined, "analysis_sticky_trial_entry")}
        />

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

const s = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 110,
  },
});