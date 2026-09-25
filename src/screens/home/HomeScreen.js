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
import { HomeFreeBody } from "./components/HomeFreeBody";
import { HomeLoading } from "./components/HomeLoading";
import { HomeOffline } from "./components/HomeOffline";
import { HomeOverlays } from "./components/HomeOverlays";
import { useHomeController } from "./useHomeController";
import { useDueReviews } from "../../hooks/useDueReviews";
import { syncReviewWidget } from "../../lib/widgetSync";
import { useAuth } from "../../contexts/AuthContext";

// Ana Sayfa (tasarim: Ana Sayfa · Ücretsiz Ana Sayfa · İlk Gün · Yükleniyor ·
// Bağlantı Yok). Kaldirilan eski kartlarin hedefleri:
//   ExamCountdown -> ust bant gun cipi (Takvim) + hero sinav sayaci
//   TodayPlanCard -> BUGÜNÜN DURAKLARI + "Programın tamamı"; Görev Ekle -> + sheet
//   SubjectMomentum / WeeklyActivityCard -> DİKKAT ÇEKEN İKİ DERS + Analiz
//   Haftalik rapor kartlari -> "Bu haftanın raporu"; tekrar karti -> Defter
//   Hizli eylemler -> + sheet (kayit/deneme/yanlis/gorev) ve ilgili sekmeler
export default function HomeScreen() {
  const h = useHomeController();
  const { C, dashboard, actions, gamification, goalReward, nudge } = h;
  // Tekrari gelen yanlislar: veri katmani vardi ama hicbir ekran okumuyordu.
  const { user } = useAuth();
  const { dueCount } = useDueReviews(user?.id);
  useEffect(() => { syncReviewWidget({ due: dueCount }); }, [dueCount]);

  const renderBelow = useCallback(({ debtHours, hasRouteAccess }) => (hasRouteAccess
    ? <HomeProBody stops={h.stops} momentum={dashboard.subjectMomentum} dueCount={dueCount} go={actions} />
    : <HomeFreeBody recent={h.recent} onSeeRoute={actions.proPreview} onFirstWeek={h.isInGrace ? actions.firstWeek : undefined} />
  ), [h.stops, h.recent, h.isInGrace, dashboard.subjectMomentum, dueCount, actions]);

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
