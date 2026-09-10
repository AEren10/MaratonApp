import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Button } from "../../components/design";
import { TargetNetField } from "./components/TargetNetField";
import { DailyPaceField } from "./components/DailyPaceField";
import {
  useGoalSetupForm,
  TARGET_NET_MIN,
  TARGET_NET_MAX,
  DAILY_Q_MIN,
  DAILY_Q_MAX,
  DAILY_Q_STEP,
} from "./useGoalSetupForm";

// Tasarim: "Hedef Sec" artboard'i — 4 adimlik kurulumun 2. adimi.
// Ana soru HEDEF NET (40-120, varsayilan 72); gunluk soru sayisi rota
// motorunun kapasite girdisi oldugu icin ikincil alan olarak korunuyor.
export default function GoalSetupScreen() {
  const C = useC();
  const {
    targetNetValue,
    setTargetNetValue,
    dailyQuestions,
    setDailyQuestions,
    hours,
    netLabel,
    finish,
  } = useGoalSetupForm();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Tasarim dort adim gosteriyor ("2 / 4"); bu ikinci adim. */}
      <View style={styles.progressRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.segment, { backgroundColor: i <= 1 ? C.accent : C.track }]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeIn.delay(100)}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>KURULUM</Text>
          <Text style={[TYPOGRAPHY.heading, { color: C.text, marginTop: STEP.s1 }]}>
            Hedef netin ne?
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s1 }]}>
            Sonra istediğin zaman değiştirebilirsin.
          </Text>
        </Animated.View>

        <TargetNetField
          value={targetNetValue}
          onChange={setTargetNetValue}
          netLabel={netLabel}
          min={TARGET_NET_MIN}
          max={TARGET_NET_MAX}
        />

        <DailyPaceField
          value={dailyQuestions}
          onChange={setDailyQuestions}
          hours={hours}
          min={DAILY_Q_MIN}
          max={DAILY_Q_MAX}
          step={DAILY_Q_STEP}
        />
      </View>

      <View style={[styles.cta, { borderTopColor: C.line }]}>
        <Button onPress={finish} size="lg" fullWidth>
          Devam
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: "row", gap: STEP.s1, paddingHorizontal: GUTTER, paddingTop: STEP.s1 },
  segment:     { flex: 1, height: 3, borderRadius: 1.5 },
  content:     { flex: 1, paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  cta:         { paddingTop: STEP.s2, paddingHorizontal: GUTTER, paddingBottom: STEP.s2, borderTopWidth: 1 },
});
