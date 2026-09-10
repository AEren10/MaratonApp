import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { TYPOGRAPHY, SPACING, STEP, GUTTER } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SectionLabel } from "../../../components/design/SectionLabel";
import { GoalSlider } from "./GoalSlider";

// Ikincil alan — gunluk soru sayisi. Tasarimda ayri bir soru olarak YOK
// (rota motoru buildRoute -> dailyQuestionGoal icin kapasite girdisi
// olarak kullaniyor), bu yuzden ana hedef netin altina kucuk bir alan
// olarak eklendi.
export function DailyPaceField({ value, onChange, hours, min, max, step }) {
  const C = useC();
  const { width } = useWindowDimensions();
  const trackWidth = width - GUTTER * 2 - SPACING.sm * 2;

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.wrap}>
      <SectionLabel>Günlük soru sayısı</SectionLabel>
      <View style={styles.row}>
        <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{value}</Text>
        <Text style={[TYPOGRAPHY.caption, styles.unit, { color: C.text2 }]}>soru</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{`· günde ~${hours} saat`}</Text>
      </View>

      <View style={styles.sliderWrap}>
        <GoalSlider
          value={value}
          onChange={onChange}
          C={C}
          trackWidth={trackWidth}
          min={min}
          max={max}
          step={step}
          accessibilityLabel="Günlük soru sayısı sürgüsü"
        />
        <View style={styles.rangeRow}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{min}</Text>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{max}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap:       { marginTop: STEP.s5 },
  row:        { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  unit:       { marginRight: STEP.s1 },
  sliderWrap: { paddingHorizontal: SPACING.sm, marginTop: STEP.s2 },
  rangeRow:   { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 },
});
