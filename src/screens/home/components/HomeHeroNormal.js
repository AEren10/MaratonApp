import { Pressable, View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { HomeHeroStat } from "./HomeHeroStat";
import { HomeHeroChart } from "./HomeHeroChart";
import { HomeRouteSummaryBar } from "./HomeRouteSummaryBar";
import { HomeCTAButton } from "./HomeCTAButton";

// Ana Sayfa hero'sunun normal (Pro) hali: dev sayi + rota grafigi + ozet
// seridi + "Çalışmaya Başla". HomeHero'nun eski normal dali buraya tasindi.
export function HomeHeroNormal({ solvedToday, dailyGoal, hero, onStartTask, onViewRoute, onViewFullRoute }) {
  const C = useC();
  const { remainingToGoal, daysUntilExam, examType, examDate, targetNet, hasRouteAccess, chartData, declared, declaredAxis, stopCounts, debtHours, nextTask, ctaSubtitle } = hero;
  return (
    <View style={s.top}>
      <HomeHeroStat
        solved={solvedToday}
        goal={dailyGoal}
        remainingToGoal={remainingToGoal}
        daysUntilExam={daysUntilExam}
        examType={examType}
        examDate={examDate}
      />

      <Pressable style={s.chart} onPress={onViewRoute} disabled={!hasRouteAccess}
        accessibilityRole="button" accessibilityLabel="Rota detayını gör">
        <HomeHeroChart hasAccess={hasRouteAccess} data={chartData} declared={declared} declaredAxis={declaredAxis} target={targetNet} />
      </Pressable>

      {/* Grafigin sozle karsiligi. Olculmus tahmin varsa onu, yoksa
          kullanicinin kendi beyan ettigi rotanin ozetini yazar. Ikisi de
          yoksa satir hic cizilmez — bos yer tutucu koymuyoruz. */}
      {chartData?.sentence || declared?.summary ? (
        <Text style={[TYPOGRAPHY.body, s.sentence, { color: C.text2 }]}>
          {chartData?.sentence || declared.summary}
        </Text>
      ) : null}

      <HomeRouteSummaryBar
        hasAccess={hasRouteAccess}
        total={stopCounts.total}
        done={stopCounts.done}
        debtHours={debtHours}
        onPress={stopCounts.total > 0 && onViewFullRoute ? onViewFullRoute : onViewRoute}
      />

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.cta}>
        <HomeCTAButton
          title={nextTask ? "Çalışmaya Başla" : "İlk durağını ekle"}
          subtitle={ctaSubtitle}
          onPress={() => onStartTask?.(nextTask)}
        />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingTop: STEP.s3 + 2 },
  // Tasarimda grafigin ucu "hedefe X kaldı" satirinin USTUNE tasiyor:
  // hat ile kahraman sayi ayni dusey alani paylasiyor. Hattin sol ust
  // kosesi bos oldugu icin metinle cakismiyor.
  chart: { marginTop: -STEP.s4, marginBottom: STEP.s2 },
  sentence: { marginBottom: STEP.s2 },
  cta: { marginTop: STEP.s4 },
});
