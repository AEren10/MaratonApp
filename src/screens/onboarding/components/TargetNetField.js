import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated from "react-native-reanimated";

import { TYPOGRAPHY, SPACING, STEP, GUTTER } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { StatBlock } from "../../../components/design/StatBlock";
import { SectionLabel } from "../../../components/design/SectionLabel";
import { GoalSlider } from "./GoalSlider";

// Tasarim: "Hedef Sec" artboard'indaki hedef net sorusu — buyuk sayi +
// surgu. Hem tek sinavlar (TYT, LGS) hem de bilesik sinavlar (TYT ve AYT/YDT)
// tarafindan tekrar kullanilabilir.
export function TargetNetField({
  title = "Hedef net",
  value,
  onChange,
  netLabel,
  min,
  max,
  size = "large",
  style,
}) {
  const C = useC();
  const { width } = useWindowDimensions();
  const trackWidth = width - GUTTER * 2 - SPACING.sm * 2;

  return (
    <Animated.View style={[styles.wrap, style]}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <View accessible accessibilityLabel={`${title}, ${value}`}>
        <StatBlock value={value} unit={`net · ${netLabel}`} size={size} />
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
          accessibilityLabel={`${title} sürgüsü`}
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
  wrap:       { marginTop: STEP.s3 },
  sliderWrap: { paddingHorizontal: SPACING.sm, marginTop: STEP.s2 },
  rangeRow:   { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 },
});
