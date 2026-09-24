import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../../../constants/screens";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { HomeHeroEyebrow } from "./HomeHeroEyebrow";
import { HomeHeroTrialSummaryCard } from "./HomeHeroTrialSummaryCard";
import { HomeHeroClosedCard } from "./HomeHeroClosedCard";
import { HomeHeroCTA } from "../HomeHeroCTA";

const CLOSED_ITEMS = ["Hedef net", "Tahmini net", "Sıralama", "Konu borcu", "Projeksiyon çizgisi", "Lig"];
const CLOSED_NOTE = "Değiştiremediğin bir sayıyı göstermek yardım etmez. Son 48 saatte performans bildirimi de gelmez, \"hedefe ulaşamadın\" ekranı hiç yok.";

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
  const navigation = useNavigation();
  const openPlan = () => navigation.navigate(SCREENS.EXAM_DAY_PLAN);
  const proofNote = trialStats
    ? `Sınav günü işin: bu aralığın üst ucunu yakalamak. ${trialStats.best}'i bir kez yaptın — o gün yapılabilir olduğunu biliyoruz.`
    : null;

  return (
    <View>
      <Animated.View entering={FadeInDown.duration(380)}>
        <HomeHeroEyebrow label="SON HAFTA" trailing={formatExamDate(examDate)} />
        <Text style={[s.title, { color: C.text }]}>Rotanı değiştirdim.</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s2 }]}>
          Geride kaldığın haftalarda rota yeni konuyla değil, defterinde bekleyen tekrarlarla
          ilerler. Bu yüzden hedef ve tahmin bu hafta kapalı.
        </Text>
      </Animated.View>

      {trialStats ? (
        <Animated.View entering={FadeInDown.delay(80).duration(380)} style={s.block}>
          <HomeHeroTrialSummaryCard best={trialStats.best} average={trialStats.average} note={proofNote} />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(140).duration(380)} style={s.block}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, letterSpacing: 1.8 }]}>
          BUGÜNÜN İŞİ
        </Text>
        {nextTask ? (
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
        ) : null}
        <Pressable
          onPress={openPlan}
          accessibilityRole="button"
          accessibilityLabel="Sınav günü planı"
          style={[s.taskCard, { backgroundColor: C.surface, borderColor: C.elev }]}
        >
          <View style={[s.dot, { backgroundColor: C.subjects.turkce }]} />
          <View style={s.taskInfo}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>Sınav günü planı</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>Saat, çanta, yol · şimdi hazırla</Text>
          </View>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>10 dk</Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(380)} style={s.block}>
        <HomeHeroClosedCard items={CLOSED_ITEMS} note={CLOSED_NOTE} />
      </Animated.View>

      <HomeHeroCTA
        label={nextTask?.estimatedMinutes
          ? `${nextTask.topicLabel || nextTask.label} · ${nextTask.estimatedMinutes} dk`
          : "Tekrara başla"}
        onPress={() => onStartTask?.(nextTask)}
        secondaryLabel="Sınav günü planı"
        onSecondary={openPlan}
        delay={260}
      />
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
