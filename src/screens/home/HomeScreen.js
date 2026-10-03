import { useCallback, useEffect } from "react";
import { ScrollView, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SyncProblemBanner } from "../../components/common/SyncProblemBanner";
import { ErrorState } from "../../components/design/ErrorState";
import { GUTTER, STEP } from "../../themes/tokens";
import { HomeTopBar } from "./components/HomeTopBar";
import { HomeHero } from "./components/HomeHero";
import { HomeExamAftermathRow } from "./components/HomeExamAftermathRow";
import { HomeProBody } from "./components/HomeProBody";
import { HomeLoading } from "./components/HomeLoading";
import { HomeOffline } from "./components/HomeOffline";
import { HomeOverlays } from "./components/HomeOverlays";
import { useHomeController } from "./useHomeController";
import { useDueReviews } from "../../hooks/useDueReviews";
import { syncReviewWidget, syncStreakWidget, syncTrialWidget } from "../../lib/widgetSync";
import { updateReminderContent } from "../../lib/notifications";
import { useAuth } from "../../contexts/AuthContext";
import { discoverTipEligible } from "../../domain/home/discoverTiming";
import { useHomeDepthTone } from "../../hooks/useHomeDepthTone";
import { useTabScrollTop } from "../../hooks/useTabScrollTop";

// Ana Sayfa (Ana Sayfa · İlk Gün · Yükleniyor · Bağlantı Yok). Sira: ust bant
// (seri satiri) -> bugunun sayisi + grafik -> Calismaya Basla -> duraklar.
export default function HomeScreen() {
  const scrollRef = useTabScrollTop();
  const h = useHomeController();
  const { C, dashboard, actions, gamification, goalReward, nudge } = h;
  const { user } = useAuth();
  const { dueCount } = useDueReviews(user?.id);
  useEffect(() => { syncReviewWidget({ due: dueCount }); updateReminderContent({ reviewDue: dueCount }, user?.id); }, [dueCount, user?.id]);
  // Seri izgarasi 28 gun geriye bakar: recentLogs 45 gunluk kayit tasir.
  useEffect(() => { syncStreakWidget({ logs: dashboard.recentLogs, streak: h.streak, longest: h.longestStreak }); }, [dashboard.recentLogs, h.streak, h.longestStreak]);
  useEffect(() => { syncTrialWidget({ trials: h.trials }); }, [h.trials]);
  useHomeDepthTone(dashboard.solvedToday, h.dailyGoal);

  // Widget/hikaye ipucu: 7. gunden ve 3 calisilmis gunden once dikkat dagitir.
  const discoverEligible = discoverTipEligible({ streak: h.streak, longestStreak: h.longestStreak, createdAt: user?.created_at });
  // v1: Premium kapali; ucretsiz govde uretimden cikti, her zaman tam govde.
  const renderBelow = useCallback(() => (
    <HomeProBody stops={h.stops} dueCount={dueCount} go={actions} discoverEligible={discoverEligible} />
  ), [h.stops, discoverEligible, dueCount, actions]);

  let body;
  if (h.loading) {
    body = <HomeLoading />;
  } else if (h.syncError) {
    body = (
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={h.refreshing} onRefresh={h.onRefresh} tintColor={C.accent} colors={[C.accent]} />}
      >
        <HomeTopBar name={dashboard.displayName} streak={h.streak}
          onProfile={actions.profile} onCalendar={actions.calendar} onSocial={actions.social} />
        <ErrorState
          preset="server"
          onPrimary={h.onRefresh}
          code={h.syncError.code || "sync_read_failed"}
        />
      </ScrollView>
    );
  } else if (h.offline) {
    body = <HomeOffline onRetry={h.onRefresh} retrying={h.refreshing} onContinue={h.continueOffline} />;
  } else {
    body = (
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={h.refreshing} onRefresh={h.onRefresh} tintColor={C.accent} colors={[C.accent]} />}
      >
        <HomeTopBar name={dashboard.displayName} streak={h.streak}
          onProfile={actions.profile} onCalendar={actions.calendar} onSocial={actions.social} />
        <SyncProblemBanner />
        <HomeExamAftermathRow />
        <HomeHero
          solvedToday={dashboard.solvedToday}
          dailyGoal={h.dailyGoal}
          generatedTasks={dashboard.generatedTasks}
          stops={h.stops?.items}
          weeklyDailyCounts={dashboard.weeklyActivity.counts}
          weekLogs={dashboard.weekLogs}
          previousQuestions={dashboard.weeklyActivity.previous}
          streak={h.streak}
          comeback={h.comebackFlow.stage === "prompt" ? h.comeback : null}
          onBeginComeback={h.comebackFlow.start}
          onDismissComeback={h.dismissComeback}
          onStartTask={actions.startTask}
          onViewRoute={actions.route}
          onViewFullRoute={actions.fullRoute}
          onViewWeek={actions.studyHistory}
          onRedrawRoute={actions.redrawRoute}
          firstDay={h.firstDay}
          onDismissFirstDay={h.dismissFirstDay}
          minutesToday={dashboard.minutesToday}
          onRecord={actions.record}
          renderBelow={renderBelow}
        />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[s.fill, { backgroundColor: C.bg }]}>
      {body}
      <HomeOverlays
        comeback={h.comeback}
        comebackStage={h.comebackFlow.stage}
        completion={h.completion}
        dailyGoal={h.dailyGoal}
        daysLeft={dashboard.daysLeft}
        dismissComeback={h.dismissComeback}
        dismissGoalComplete={goalReward.dismissGoalComplete}
        dismissLevelUp={gamification.dismissLevelUp}
        dismissMilestone={gamification.dismissMilestone}
        dismissNudgePopup={nudge.dismiss}
        dismissXP={gamification.dismissXP}
        freezeCount={h.freezeCount}
        freezeResetAt={h.freezeResetAt}
        goalCompleteVisible={goalReward.goalCompleteVisible}
        lastStudyDate={h.lastStudyDate}
        levelUpModal={gamification.levelUpModal}
        longestStreak={h.longestStreak}
        milestoneModal={gamification.milestoneModal}
        minutesToday={dashboard.minutesToday}
        navigation={h.navigation}
        nudgePopup={nudge.popup}
        nudgeVisible={false}
        nudges={h.nudges}
        onCloseNudgeModal={noop}
        onCloseStreakSheet={noop}
        routeCurrentWeek={dashboard.routeCurrentWeek}
        routeTotals={dashboard.routeTotals}
        solvedToday={dashboard.solvedToday}
        streak={h.streak}
        streakSheetVisible={false}
        xpToast={gamification.xpToast}
      />
    </SafeAreaView>
  );
}

function noop() {}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 + STEP.s4 + 4 },
});
