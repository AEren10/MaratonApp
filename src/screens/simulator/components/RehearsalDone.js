import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";
import { formatDuration } from "../../../lib/format";

// Prova bitti. Sure dolduysa netler elle girilir (Deneme Girisi). Erken
// bitirildiyse tasarimin kurali: "Yarım bırakırsan kayıt açılmaz."
export function RehearsalDone({ full, elapsed, onEnterResults, onClose }) {
  const C = useC();
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={s.wrap}>
      <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]} allowFontScaling={false}>
        {formatDuration(elapsed)}
      </Text>
      <Text style={[TYPOGRAPHY.heading, s.title, { color: C.text }]}>
        {full ? "Süre doldu" : "Erken bitirdin"}
      </Text>
      <Text style={[TYPOGRAPHY.body, s.body, { color: C.text2 }]}>
        {full ? "Süre dolunca netleri elle girersin" : "Yarım bırakırsan kayıt açılmaz."}
      </Text>
      <View style={s.cta}>
        {full ? (
          <Button size="lg" fullWidth onPress={onEnterResults}>Sonuçlarını Gir</Button>
        ) : null}
        <Button variant={full ? "outline" : "primary"} size="lg" fullWidth onPress={onClose} style={full && s.gap}>
          Kapat
        </Button>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: GUTTER, paddingTop: STEP.s5 },
  title: { marginTop: STEP.s3 },
  body: { marginTop: STEP.s1 },
  cta: { marginTop: "auto", paddingBottom: STEP.s4 },
  gap: { marginTop: STEP.s2 },
});
