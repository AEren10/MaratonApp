import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { Button } from "../../../../components/design/Button";
import { useC } from "../../../../contexts/ThemeContext";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";
import { FirstDayRouteLine } from "./FirstDayRouteLine";
import { FirstDayStop } from "./FirstDayStop";

// Gun sayisi zaten baslikta; cumle onu tekrarlamaz (eskiden "YKS'ye N gun"
// iki satir ust uste yaziyordu).
function routeSentence(totalStops) {
  const tail = "Bugün ilk durakla başlıyoruz; her durak geçtiğinde bu çizgi biraz daha uzuyor.";
  return totalStops ? `Rotanda ${totalStops} durak var. ${tail}` : tail;
}

// İlk Gün: kayit ve deneme yokken Ana Sayfa. Hayalet "0", kesikli rota,
// tek durak, "İlk durağa başla".
export function HomeFirstDay({ dailyGoal, hero, onStartTask, onViewRoute, onShowHome }) {
  const C = useC();
  const { daysUntilExam, stopCounts, nextTask, targetNet, examType } = hero;
  const exam = examType === "lgs" ? "LGS'ye" : "YKS'ye";
  const daysLine = daysUntilExam == null
    ? "İlk durağın hazır."
    : `${exam} ${Math.max(0, daysUntilExam)} gün. İlk durağın hazır.`;

  return (
    <View>
      {/* Ilk ekranin ilk gordugu sey dev, soluk bir "0 / hedef" idi. Sifir
          kahraman olmaz (kullanici karari, 28 Eylul): yerine yolun kendisi. */}
      <Animated.View style={s.top}>
        <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>{daysLine}</Text>
      </Animated.View>

      <FirstDayRouteLine targetNet={targetNet} />

      <Animated.View>
        <Text style={[TYPOGRAPHY.body, s.summary, { color: C.text2 }]}>
          {routeSentence(stopCounts?.total)}
        </Text>
        <FirstDayStop task={nextTask} />
      </Animated.View>

      {/* Tek baskin cikis: ilk durak. Aktivasyon ani rota hazir ekrani degil,
          ilk calismanin bitip rotanin ilerledigini gormek. Digerleri yazi
          baglantisi; deneme aciklamasi ilk calismadan sonra (Analiz bos hali). */}
      <Animated.View style={s.actions}>
        <Button variant="primary" size="lg" fullWidth onPress={() => onStartTask?.(nextTask)}>
          İlk durağa başla
        </Button>
        <View style={s.links}>
          <Press haptic="tap" onPress={onViewRoute} accessibilityRole="button" style={s.link}>
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Rotanı gör</Text>
          </Press>
          {onShowHome ? (
            <Press haptic="tap" onPress={onShowHome} accessibilityRole="button" style={s.link}>
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>Ana sayfaya geç</Text>
            </Press>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingTop: STEP.s4 },
  summary: { marginTop: STEP.s2 + 2 },
  actions: { marginTop: STEP.s4 - 4, marginBottom: STEP.s4, gap: STEP.s1 },
  links: { flexDirection: "row", justifyContent: "center", gap: STEP.s4 },
  link: { minHeight: CONTROL.tapMin, justifyContent: "center", paddingHorizontal: STEP.s1 },
});
