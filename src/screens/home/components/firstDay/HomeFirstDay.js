import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../../components/design/Button";
import { StatBlock } from "../../../../components/design/StatBlock";
import { useC } from "../../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { FirstDayRouteLine } from "./FirstDayRouteLine";
import { FirstDayStop } from "./FirstDayStop";

function routeSentence(daysUntilExam, totalStops) {
  const tail = "Bugün ilk durakla başlıyoruz; her durak geçtiğinde bu çizgi biraz daha uzuyor.";
  if (daysUntilExam == null || !totalStops) return tail;
  return `Rotan ${Math.max(0, daysUntilExam)} gün, ${totalStops} durak. ${tail}`;
}

// İlk Gün: kayit ve deneme yokken Ana Sayfa. Hayalet "0", kesikli rota,
// tek durak, "İlk durağa başla".
export function HomeFirstDay({ dailyGoal, hero, onStartTask, onViewRoute }) {
  const C = useC();
  const { daysUntilExam, stopCounts, nextTask, targetNet } = hero;
  const enter = (i) => FadeInDown.delay(i * 80).duration(500);

  return (
    <View>
      <Animated.View entering={enter(0)} style={s.top}>
        <StatBlock label="Bugün çözülen" value={0} unit={`/${dailyGoal}`} size="hero" color={C.text5}>
          <Text style={[TYPOGRAPHY.body, s.line, { color: C.text3 }]}>soru · rotanın ilk günü</Text>
        </StatBlock>
      </Animated.View>

      <FirstDayRouteLine targetNet={targetNet} />

      <Animated.View entering={enter(1)}>
        <Text style={[TYPOGRAPHY.body, s.summary, { color: C.text2 }]}>
          {routeSentence(daysUntilExam, stopCounts?.total)}
        </Text>
        <FirstDayStop task={nextTask} />
      </Animated.View>

      <Animated.View entering={enter(2)} style={s.actions}>
        <Button variant="primary" size="lg" fullWidth onPress={() => onStartTask?.(nextTask)}>
          İlk durağa başla
        </Button>
        <Button variant="outline" size="md" fullWidth onPress={onViewRoute}>
          Rotayı gözden geçir
        </Button>
      </Animated.View>

      <Animated.View entering={enter(3)} style={[s.hint, { borderColor: C.elev }]}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>Deneme girdikçe burada ne görünür?</Text>
        <Text style={[TYPOGRAPHY.caption, s.hintBody, { color: C.text3 }]}>
          Net ortalaman, tahmini sınav netin ve öncelikli konuların. Üç denemeden sonra rota geleceği de çizer.
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingTop: STEP.s4 },
  line: { marginTop: STEP.s2 + 2 },
  summary: { marginTop: STEP.s2 + 2 },
  actions: { marginTop: STEP.s4 - 4, gap: STEP.s2 },
  hint: {
    marginTop: STEP.s4 + 2, marginBottom: STEP.s4, paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.sheet - 2, borderWidth: 1, borderStyle: "dashed",
  },
  hintBody: { marginTop: STEP.s1 },
});
