import { View, StyleSheet } from "react-native";
import { STEP } from "../../../themes/tokens";
import { useExam } from "../../../contexts/ExamContext";
import { useHomeHeroData } from "../../../hooks/useHomeHeroData";
import { useHomeHeroMode, HOME_HERO_MODE } from "../../../hooks/useHomeHeroMode";
import { useTrialSummaryStats } from "../../../hooks/useTrialSummaryStats";
import { HomeHeroStat } from "./HomeHeroStat";
import { HomeHeroChart } from "./HomeHeroChart";
import { HomeRouteSummaryBar } from "./HomeRouteSummaryBar";
import { HomeHeroCTA } from "./HomeHeroCTA";
import { HomeHeroFinalWeek } from "./heroVariants/HomeHeroFinalWeek";
import { HomeHeroFinalWeekDebt } from "./heroVariants/HomeHeroFinalWeekDebt";
import { HomeHeroComeback } from "./heroVariants/HomeHeroComeback";
import { HomeHeroExamDay } from "./heroVariants/HomeHeroExamDay";
import { HomeHeroFrozen } from "./heroVariants/HomeHeroFrozen";
import { getExamPhase } from "../../../domain/exam/examPhase";

// Yeni tasarim hero'su: dev "bugün çözülen" sayısı + rota grafiği + özet
// şeridi + birincil CTA. Eski ProgressRing/StatCell iskeleti kaldırıldı.
// Zamana bağlı hero varyantları (AKIŞ 14): sınav fazına göre modu
// useHomeHeroMode seçer, normal mod bu dosyanın aynı render yolunu kullanmaya
// devam eder.
export function HomeHero({
  solvedToday = 0,
  dailyGoal = 100,
  generatedTasks = [],
  weeklyDailyCounts,
  comeback = null,
  onDismissComeback,
  onStartTask,
  onViewRoute,
}) {
  const { examDate } = useExam();
  const {
    remainingToGoal,
    daysUntilExam,
    examType,
    targetNet,
    hasRouteAccess,
    chartData,
    stopCounts,
    debtHours,
    hasDebt,
    nextTask,
    ctaSubtitle,
    isPaused,
    frozenAtStop,
    frozenDays,
  } = useHomeHeroData({ solvedToday, dailyGoal, generatedTasks });
  const mode = useHomeHeroMode({ examDate, hasDebt, comeback, isPaused });
  const trialStats = useTrialSummaryStats();

  if (mode === HOME_HERO_MODE.FROZEN) {
    return (
      <View style={s.wrap}>
        <HomeHeroFrozen daysUntilExam={daysUntilExam} frozenAtStop={frozenAtStop} frozenDays={frozenDays} />
      </View>
    );
  }

  if (mode === HOME_HERO_MODE.EXAM_DAY) {
    return (
      <View style={s.wrap}>
        <HomeHeroExamDay examDate={examDate} />
      </View>
    );
  }

  if (mode === HOME_HERO_MODE.FINAL_WEEK) {
    const { daysLeft } = getExamPhase(examDate);
    return (
      <View style={s.wrap}>
        <HomeHeroFinalWeek
          daysLeft={Math.max(0, daysLeft ?? 0)}
          examDate={examDate}
          dailyCounts={weeklyDailyCounts}
          dailyGoal={dailyGoal}
          tasks={generatedTasks}
          trialStats={trialStats}
          onStartTask={onStartTask}
        />
      </View>
    );
  }

  if (mode === HOME_HERO_MODE.FINAL_WEEK_DEBT) {
    return (
      <View style={s.wrap}>
        <HomeHeroFinalWeekDebt
          examDate={examDate}
          nextTask={nextTask}
          trialStats={trialStats}
          onStartTask={onStartTask}
        />
      </View>
    );
  }

  if (mode === HOME_HERO_MODE.COMEBACK) {
    return (
      <View style={s.wrap}>
        <HomeHeroComeback
          nextTask={nextTask}
          onStartTask={onStartTask}
          onDismiss={onDismissComeback}
          onViewRoute={onViewRoute}
        />
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <HomeHeroStat
        solved={solvedToday}
        goal={dailyGoal}
        remainingToGoal={remainingToGoal}
        daysUntilExam={daysUntilExam}
        examType={examType}
      />

      <View style={s.chart}>
        <HomeHeroChart hasAccess={hasRouteAccess} data={chartData} target={targetNet} />
      </View>

      <HomeRouteSummaryBar
        hasAccess={hasRouteAccess}
        total={stopCounts.total}
        done={stopCounts.done}
        debtHours={debtHours}
        onPress={onViewRoute}
      />

      <HomeHeroCTA
        label={nextTask ? "Çalışmaya Başla" : "İlk durağını ekle"}
        subtitle={ctaSubtitle}
        onPress={() => onStartTask?.(nextTask)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: STEP.s1 },
  chart: { marginTop: STEP.s3, marginBottom: STEP.s2 },
});
