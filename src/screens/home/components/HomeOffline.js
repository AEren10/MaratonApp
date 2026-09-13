import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

import { Button } from "../../../components/design/Button";
import { useC } from "../../../contexts/ThemeContext";
import { ERROR_COPY } from "../../../constants/stateCopy";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const COPY = ERROR_COPY.offline;

// "Bağlantı Yok" artboardi: cihazda gosterilecek veri yokken ve baglanti
// kopukken Ana Sayfa'nin tam ekran hali.
export function HomeOffline({ onRetry, onContinue, retrying }) {
  const C = useC();
  return (
    <View style={s.wrap}>
      <View style={s.center}>
        <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
          <Path d="M14 30c12-10 32-10 44 0" stroke={C.text4} strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M23 40c8-6 18-6 26 0" stroke={C.text4} strokeWidth={2.4} strokeLinecap="round" />
          <Circle cx={36} cy={52} r={3.4} fill={C.text4} />
          <Path d="M12 12l48 48" stroke={C.warn} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
        <Text accessibilityRole="header" style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>{COPY.title}</Text>
        <Text style={[TYPOGRAPHY.body, s.body, { color: C.text3 }]}>{COPY.body}</Text>
      </View>
      <View style={s.actions}>
        <Button variant="primary" size="lg" fullWidth loading={retrying} onPress={onRetry}>{COPY.primary}</Button>
        <Button variant="outline" size="md" fullWidth onPress={onContinue}>{COPY.secondary}</Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER },
  center: { alignItems: "center", paddingTop: STEP.s5 + STEP.s3 - 2, paddingHorizontal: STEP.s3 - 2 },
  title: { marginTop: STEP.s3 + 6, textAlign: "center" },
  body: { marginTop: STEP.s2, textAlign: "center", maxWidth: 258 },
  actions: { marginTop: STEP.s4, gap: STEP.s2 },
});
