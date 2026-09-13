import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const FIELD = {
  correct: { name: "Doğru", object: "Doğruyu" },
  wrong: { name: "Yanlış", object: "Yanlışı" },
  empty: { name: "Boş", object: "Boşu" },
};
const HIT = { top: 3, bottom: 3 };

// Form Hatasi: hata hesabin kendisinde, tek dokunusluk duzeltme onerisiyle.
export function TrialScoreOverflow({ overflow, onFix }) {
  const C = useC();
  const field = FIELD[overflow.field] || FIELD.wrong;
  return (
    <Animated.View entering={FadeIn.duration(500)} accessibilityLiveRegion="polite">
      <View style={[styles.card, { backgroundColor: C.void, borderColor: C.warn }]}
        accessible accessibilityRole="alert"
        accessibilityLabel={`Toplam ${overflow.total}, soru sayısı ${overflow.max}. ${field.name} sayısı ${overflow.excess} fazla.`}>
        <Icon name="alert" size={18} color={C.warn} sw={1.7} />
        <View style={styles.copy}>
          <Text style={[TYPOGRAPHY.captionMedium, { fontFamily: "Archivo_600", color: C.text }]}>
            {`Toplam ${overflow.total}, soru sayısı ${overflow.max}`}
          </Text>
          <Text style={[TYPOGRAPHY.meta, styles.body, { color: C.text2 }]}>
            {`Doğru, yanlış ve boş toplamı soru sayısını geçemez. ${field.name} sayısı ${overflow.excess} fazla görünüyor.`}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => onFix(overflow)} hitSlop={HIT} accessibilityRole="button"
          style={[styles.chip, { backgroundColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>
            {`${field.object} ${overflow.excess} düzelt`}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", gap: STEP.s2 - 1, marginTop: STEP.s2 + 4,
    paddingVertical: 15, paddingHorizontal: 17, borderRadius: SHAPE.card, borderWidth: 1,
  },
  copy: { flex: 1, minWidth: 0 },
  body: { fontFamily: "Archivo_400", marginTop: 5 },
  actions: { flexDirection: "row", gap: STEP.s1 + 2, marginTop: STEP.s2 + 2 },
  chip: {
    height: CONTROL.chip, paddingHorizontal: STEP.s2 + 2, borderRadius: SHAPE.chip,
    alignItems: "center", justifyContent: "center",
  },
});
