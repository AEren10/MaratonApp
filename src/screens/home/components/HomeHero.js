import { View, StyleSheet } from "react-native";
import { STEP } from "../../../themes/tokens";
import { useHomeHeroData } from "../../../hooks/useHomeHeroData";
import { HomeHeroStat } from "./HomeHeroStat";
import { HomeHeroChart } from "./HomeHeroChart";
import { HomeRouteSummaryBar } from "./HomeRouteSummaryBar";
import { HomeHeroCTA } from "./HomeHeroCTA";

// Yeni tasarim hero'su: dev "bugün çözülen" sayısı + rota grafiği + özet
// şeridi + birincil CTA. Eski ProgressRing/StatCell iskeleti kaldırıldı.
// Zamana bağlı hero varyantları (son hafta / sınav günü / geri dönüş) bu
// turda EKLENMEDİ — bkz. rapor.
export function HomeHero({
  solvedToday = 0,
  dailyGoal = 100,
  generatedTasks = [],
  onStartTask,
  onViewRoute,
}) {
  const {
    remainingToGoal,
    daysUntilExam,
    examType,
    targetNet,
    hasRouteAccess,
    chartData,
    stopCounts,
    debtHours,
    nextTask,
    ctaSubtitle,
  } = useHomeHeroData({ solvedToday, dailyGoal, generatedTasks });

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
