import { Fragment } from "react";
import { View, StyleSheet } from "react-native";
import { STEP } from "../../../themes/tokens";
import { useExam } from "../../../contexts/ExamContext";
import { useHomeHeroData } from "../../../hooks/useHomeHeroData";
import { useHomeHeroMode, HOME_HERO_MODE } from "../../../hooks/useHomeHeroMode";
import { useTrialSummaryStats } from "../../../hooks/useTrialSummaryStats";
import { HomeHeroNormal } from "./HomeHeroNormal";
import { HomeHeroFree } from "./HomeHeroFree";
import { HomeFirstDay } from "./firstDay/HomeFirstDay";
import { HomeHeroFinalWeek } from "./heroVariants/HomeHeroFinalWeek";
import { HomeHeroFinalWeekDebt } from "./heroVariants/HomeHeroFinalWeekDebt";
import { HomeHeroComeback } from "./heroVariants/HomeHeroComeback";
import { HomeHeroExamDay } from "./heroVariants/HomeHeroExamDay";
import { HomeHeroFrozen } from "./heroVariants/HomeHeroFrozen";
import { getExamPhase } from "../../../domain/exam/examPhase";

// Yeni tasarim hero'su. Zamana bagli varyantlari (AKIŞ 14) useHomeHeroMode
// secer. Normal modda erisime ve ilk gune gore uc hal: Pro (HomeHeroNormal),
// Ücretsiz (HomeHeroFree), İlk Gün (HomeFirstDay — govdenin tamami, altina
// bolum cizilmez). renderBelow hero verisini (borc saati, erisim) govdeye tasir.
export function HomeHero({
  solvedToday = 0,
  dailyGoal = 100,
  generatedTasks = [],
  weeklyDailyCounts,
  comeback = null,
  onBeginComeback,
  onDismissComeback,
  onStartTask,
  onViewRoute, onViewFullRoute, onRedrawRoute,
  firstDay = false,
  minutesToday = 0,
  onRecord,
  renderBelow,
}) {
  const { examDate } = useExam();
  const hero = useHomeHeroData({ solvedToday, dailyGoal, generatedTasks });
  const {
    daysUntilExam,
    hasRouteAccess,
    debtHours,
    hasDebt,
    nextTask,
    comebackRecommendation,
    isPaused,
    frozenAtStop,
    frozenDays,
  } = hero;
  const mode = useHomeHeroMode({ examDate, hasDebt, comeback, isPaused });
  const trialStats = useTrialSummaryStats();

  let content;
  if (mode === HOME_HERO_MODE.FROZEN) {
    content = <HomeHeroFrozen daysUntilExam={daysUntilExam} frozenAtStop={frozenAtStop} frozenDays={frozenDays} />;
  } else if (mode === HOME_HERO_MODE.EXAM_DAY) {
    content = <HomeHeroExamDay examDate={examDate} />;
  } else if (mode === HOME_HERO_MODE.FINAL_WEEK) {
    const { daysLeft } = getExamPhase(examDate);
    content = (
      <HomeHeroFinalWeek
        daysLeft={Math.max(0, daysLeft ?? 0)}
        examDate={examDate}
        dailyCounts={weeklyDailyCounts}
        dailyGoal={dailyGoal}
        tasks={generatedTasks}
        trialStats={trialStats}
        onStartTask={onStartTask}
      />
    );
  } else if (mode === HOME_HERO_MODE.FINAL_WEEK_DEBT) {
    content = <HomeHeroFinalWeekDebt examDate={examDate} nextTask={nextTask} trialStats={trialStats} onStartTask={onStartTask} />;
  } else if (mode === HOME_HERO_MODE.COMEBACK) {
    content = (
      <HomeHeroComeback
        nextTask={nextTask}
        recommendation={comebackRecommendation}
        onStartTask={(task) => {
          onBeginComeback?.();
          onStartTask?.(task);
        }}
        onDismiss={onDismissComeback}
        onViewRoute={onRedrawRoute || onViewRoute}
      />
    );
  } else if (firstDay) {
    content = <HomeFirstDay dailyGoal={dailyGoal} hero={hero} onStartTask={onStartTask} onViewRoute={onViewRoute} />;
  } else if (!hasRouteAccess) {
    content = (
      <HomeHeroFree
        solvedToday={solvedToday}
        dailyGoal={dailyGoal}
        minutesToday={minutesToday}
        remainingToGoal={hero.remainingToGoal}
        onRecord={onRecord}
      />
    );
  } else {
    content = (
      <HomeHeroNormal
        solvedToday={solvedToday}
        dailyGoal={dailyGoal}
        hero={hero}
        onStartTask={onStartTask}
        onViewRoute={onViewRoute}
        onViewFullRoute={onViewFullRoute}
      />
    );
  }

  const showBelow = !(mode === HOME_HERO_MODE.NORMAL && firstDay);
  return (
    <Fragment>
      <View style={s.wrap}>{content}</View>
      {showBelow ? renderBelow?.({ debtHours, hasRouteAccess }) : null}
    </Fragment>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: STEP.s1 },
});
