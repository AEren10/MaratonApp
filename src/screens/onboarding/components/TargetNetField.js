import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { TYPOGRAPHY, SPACING, STEP, GUTTER } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { StatBlock } from "../../../components/design/StatBlock";
import { SectionLabel } from "../../../components/design/SectionLabel";
import { GoalSlider } from "./GoalSlider";

// Tasarim: "Hedef Sec" artboard'indaki hedef net sorusu — buyuk sayi +
// surgu (40-120, varsayilan 72). Onboarding'in ANA sorusu bu, gunluk soru
// hedefi ikincil alana indi.
export function TargetNetField({ value, onChange, netLabel, min, max }) {
  const C = useC();
  const { width } = useWindowDimensions();
  const trackWidth = width - GUTTER * 2 - SPACING.sm * 2;

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.wrap}>
      <SectionLabel>Hedef net</SectionLabel>
      <View accessible accessibilityLabel={`Hedef net, ${value}`}>
        <StatBlock value={value} unit={`net · ${netLabel}`} size="large" />
      </View>

      <View style={styles.sliderWrap}>
        <GoalSlider
          value={value}
          onChange={onChange}
          C={C}
          trackWidth={trackWidth}
          min={min}
          max={max}
          step={1}
          accessibilityLabel="Hedef net sürgüsü"
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
  wrap:       { marginTop: STEP.s4 },
  sliderWrap: { paddingHorizontal: SPACING.sm, marginTop: STEP.s3 },
  rangeRow:   { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 },
});
