import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { Button } from "../../../../components/design/Button";
import { StatBlock } from "../../../../components/design/StatBlock";
import { useC } from "../../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { FirstDayRouteLine } from "./FirstDayRouteLine";
import { FirstDayStop } from "./FirstDayStop";

function routeSentence(daysUntilExam, totalStops) {
  const tail = "Bugün ilk durakla başlıyoruz; her durak geçtiğinde bu çizgi biraz daha uzuyor.";
  const days = daysUntilExam == null ? null : Math.max(0, daysUntilExam);
  if (days != null && totalStops) return `YKS'ye ${days} gün, rotanda ${totalStops} durak var. ${tail}`;
  if (days != null) return `YKS'ye ${days} gün. ${tail}`;
  if (totalStops) return `Rotanda ${totalStops} durak var. ${tail}`;
  return tail;
}

// İlk Gün: kayit ve deneme yokken Ana Sayfa. Hayalet "0", kesikli rota,
// tek durak, "İlk durağa başla".
export function HomeFirstDay({ dailyGoal, hero, onStartTask, onViewRoute, onShowHome }) {
  const C = useC();
  const { daysUntilExam, stopCounts, nextTask, targetNet } = hero;
  const daysLine = daysUntilExam == null
    ? "ilk durak hazır"
    : `YKS'ye ${Math.max(0, daysUntilExam)} gün · ilk durak hazır`;

  return (
    <View>
      <Animated.View style={s.top}>
        <StatBlock label="Bugün çözülen" value={0} unit={`/${dailyGoal}`} size="hero" color={C.text5}>
          <Text style={[TYPOGRAPHY.body, s.line, { color: C.text3 }]}>{daysLine}</Text>
        </StatBlock>
      </Animated.View>

      <FirstDayRouteLine targetNet={targetNet} />

      <Animated.View>
        <Text style={[TYPOGRAPHY.body, s.summary, { color: C.text2 }]}>
          {routeSentence(daysUntilExam, stopCounts?.total)}
        </Text>
        <FirstDayStop task={nextTask} />
      </Animated.View>

      <Animated.View style={s.actions}>
        <Button variant="primary" size="lg" fullWidth onPress={() => onStartTask?.(nextTask)}>
          İlk durağa başla
        </Button>
        <Button variant="outline" size="md" fullWidth onPress={onViewRoute}>
          Rotayı gözden geçir
        </Button>
        {/* Ilk Gun hero'su Home govdesinin tamamini gizliyor ve eski tek
            cikisi veri girmekti. Bu buton kapiyi aciyor: ilk duragi yapmadan
            da Ana Sayfa'nin geri kalani gorulebilir. */}
        {onShowHome ? (
          <Button variant="ghost" size="md" fullWidth onPress={onShowHome}>
            Ana sayfayı göster
          </Button>
        ) : null}
      </Animated.View>

      <Animated.View style={[s.hint, { borderColor: C.elev }]}>
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
