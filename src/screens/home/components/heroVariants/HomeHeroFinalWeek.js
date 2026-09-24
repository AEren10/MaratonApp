import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { HomeHeroEyebrow } from "./HomeHeroEyebrow";
import { HomeHeroWeekStrip } from "./HomeHeroWeekStrip";
import { HomeHeroTrialSummaryCard } from "./HomeHeroTrialSummaryCard";
import { HomeHeroClosedCard } from "./HomeHeroClosedCard";
import { HomeHeroCTA } from "../HomeHeroCTA";
import { HomeHeroFinalWeekTips } from "./HomeHeroFinalWeekTips";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../../../constants/screens";

const CLOSED_ITEMS = ["Yeni konu", "Lig", "Konu borcu", "Tahmini net", "Sıralama"];

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

// Tasarim AKIS 14 · "Son Hafta": yeni konu onerilmez, tekrar ve deneme
// ritmine gecilir. Borc YOKKEN gosterilir; borc varsa HomeHeroFinalWeekDebt
// devreye girer.
export function HomeHeroFinalWeek({
  daysLeft,
  examDate,
  dailyCounts,
  dailyGoal,
  tasks = [],
  trialStats,
  onStartTask,
}) {
  const C = useC();
  const navigation = useNavigation();

  return (
    <View>
      <Animated.View>
        <HomeHeroEyebrow label="SON HAFTA" trailing={formatExamDate(examDate)} />
        <View style={s.heroRow}>
          <Text style={[s.heroNumber, { color: C.text }]} allowFontScaling={false}>{daysLeft}</Text>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, paddingBottom: 11 }]}>gün kaldı</Text>
        </View>
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s2 }]}>
          Yeni konu yok. Bu hafta tek işimiz bildiklerini sağlamlaştırmak ve sınav ritmine geçmek.
        </Text>
      </Animated.View>

      <Animated.View style={s.block}>
        <HomeHeroWeekStrip dailyCounts={dailyCounts} dailyGoal={dailyGoal} />
      </Animated.View>

      {tasks.length > 0 ? (
        <Animated.View style={s.block}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, letterSpacing: 1.8 }]}>
            BUGÜNÜN ÜÇ İŞİ
          </Text>
          {tasks.slice(0, 3).map((task, i) => (
            <View key={task.id || i} style={[s.taskRow, { borderTopColor: C.line }]}>
              <View style={s.taskInfo}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
                  {task.topicLabel || task.label}
                </Text>
                <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]} numberOfLines={1}>
                  {task.subjectLabel}
                </Text>
              </View>
              {task.estimatedMinutes ? (
                <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{task.estimatedMinutes} dk</Text>
              ) : null}
            </View>
          ))}
        </Animated.View>
      ) : null}

      {trialStats ? (
        <Animated.View style={s.block}>
          <HomeHeroTrialSummaryCard
            lead="Geride kaldığın haftalarda rota yeni konuyla değil, defterinde bekleyen tekrarlarla ilerler."
            best={trialStats.best}
            average={trialStats.average}
            note="Sınav günü işin: bu aralığın üst ucunu yakalamak."
          />
        </Animated.View>
      ) : null}

      <Animated.View style={s.block}>
        <HomeHeroClosedCard
          items={CLOSED_ITEMS}
          note="Son 6 günde tahmin, hedef ve sıralama gizlenir. Değiştiremediğin bir sayıyı göstermenin faydası yok. Sınavdan önceki 48 saatte performans bildirimi de gelmez."
        />
      </Animated.View>

      <Animated.View style={s.block}>
        <HomeHeroFinalWeekTips examDate={examDate} />
      </Animated.View>

      <HomeHeroCTA
        label="Tekrara başla"
        onPress={() => onStartTask?.(tasks?.[0] || null)}
        secondaryLabel="Deneme provası kur"
        onSecondary={() => navigation.navigate(SCREENS.EXAM_SIMULATOR)}
        delay={360}
      />
    </View>
  );
}

const s = StyleSheet.create({
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 12, marginTop: 16 },
  heroNumber: {
    fontFamily: "Bricolage_400",
    fontSize: 80,
    lineHeight: 80,
    letterSpacing: -3,
    fontVariant: ["tabular-nums"],
  },
  block: { marginTop: STEP.s3 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s2,
    borderTopWidth: 1,
    marginTop: 2,
  },
  taskInfo: { flex: 1, minWidth: 0 },
});
