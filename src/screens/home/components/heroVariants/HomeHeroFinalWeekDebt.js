import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { HomeHeroEyebrow } from "./HomeHeroEyebrow";
import { HomeHeroTrialSummaryCard } from "./HomeHeroTrialSummaryCard";
import { HomeHeroClosedCard } from "./HomeHeroClosedCard";
import { HomeHeroCTA } from "../HomeHeroCTA";

const CLOSED_ITEMS = ["Hedef net", "Tahmini net", "Sıralama", "Konu borcu", "Projeksiyon çizgisi"];

function formatExamDate(examDate) {
  if (!examDate) return null;
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" })
      .format(examDate)
      .replace(/, /, " · ");
  } catch {
    return null;
  }
}

// Tasarim AKIS 14 · "Son Hafta Geride": borc VARKEN gosterilir. Hedef ve
// tahmin bu hafta kapali; is tekrar setine odaklanir.
export function HomeHeroFinalWeekDebt({ examDate, nextTask, trialStats, onStartTask }) {
  const C = useC();
  const proofNote = trialStats
    ? `Sınav günü işin: bu aralığın üst ucunu yakalamak. ${trialStats.best}'i bir kez yaptın — o gün yapılabilir olduğunu biliyoruz.`
    : null;

  return (
    <View>
      <Animated.View entering={FadeInDown.duration(480).springify().damping(18)}>
        <HomeHeroEyebrow label="SON HAFTA" trailing={formatExamDate(examDate)} />
        <Text style={[s.title, { color: C.text }]}>Rotanı değiştirdim.</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s2 }]}>
          Geride kaldığın haftalarda rota yeni konuyla değil, defterinde bekleyen tekrarlarla
          ilerler. Bu yüzden hedef ve tahmin bu hafta kapalı.
        </Text>
      </Animated.View>

      {trialStats ? (
        <Animated.View entering={FadeInDown.delay(80).duration(480).springify().damping(18)} style={s.block}>
          <HomeHeroTrialSummaryCard best={trialStats.best} average={trialStats.average} note={proofNote} />
        </Animated.View>
      ) : null}

      {nextTask ? (
        <Animated.View entering={FadeInDown.delay(140).duration(480).springify().damping(18)} style={s.block}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, letterSpacing: 1.8 }]}>
            BUGÜNÜN İŞİ
          </Text>
          <View style={[s.taskCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <View style={[s.dot, { backgroundColor: C.accent }]} />
            <View style={s.taskInfo}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
                {nextTask.topicLabel || nextTask.label}
              </Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]} numberOfLines={1}>
                {nextTask.subjectLabel}
              </Text>
            </View>
            {nextTask.estimatedMinutes ? (
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{nextTask.estimatedMinutes} dk</Text>
            ) : null}
          </View>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(200).duration(480).springify().damping(18)} style={s.block}>
        <HomeHeroClosedCard items={CLOSED_ITEMS} />
      </Animated.View>

      <HomeHeroCTA label="Tekrara başla" onPress={() => onStartTask?.(nextTask)} delay={260} />
    </View>
  );
}

const s = StyleSheet.create({
  title: {
    fontFamily: "Bricolage_400",
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.5,
    marginTop: STEP.s3,
  },
  block: { marginTop: STEP.s3 },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    padding: STEP.s3 - 2,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: STEP.s2,
  },
  dot: { width: 8, height: 8, borderRadius: 1 },
  taskInfo: { flex: 1, minWidth: 0 },
});
