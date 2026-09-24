import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import { Button } from "../../../../components/design";
import { EMPTY_COPY } from "../../../../constants/stateCopy";
import { useC } from "../../../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// "Çalışma Geçmişi Boş" artboardi.
export function HistoryEmpty({ onStart, onManual }) {
  const C = useC();
  const copy = EMPTY_COPY.studyHistory;
  return (
    <Animated.View>
      <View style={styles.center}>
        <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
          <Circle cx={36} cy={36} r={23} stroke={C.text4} strokeWidth={2} />
          <Path d="M36 22v14l10 6" stroke={C.text5} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <Text accessibilityRole="header" style={[TYPOGRAPHY.subheading, styles.title, { color: C.text }]}>{copy.title}</Text>
        <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text3 }]}>{copy.body}</Text>
      </View>
      <View style={styles.actions}>
        <Button size="lg" fullWidth onPress={onStart}>{copy.primary}</Button>
        <Button variant="outline" size="lg" fullWidth onPress={onManual}>{copy.secondary}</Button>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", paddingHorizontal: STEP.s4 + 6, paddingTop: STEP.s5 + 4 },
  title: { marginTop: STEP.s3 + 6, textAlign: "center" },
  body: { marginTop: STEP.s2, maxWidth: 256, textAlign: "center" },
  actions: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 - 2, gap: STEP.s2 },
});
