import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatBlock } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export function TopicDebtHero({ totalHours, hasHours, capped }) {
  const C = useC();
  // Image 3 tasarımı:
  return (
    <Animated.View entering={FadeInDown.duration(560)}>
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, letterSpacing: 1.5, marginBottom: STEP.s4 }]}>KONU BORCU</Text>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>GEÇİLMEYEN DURAKLAR</Text>
      <View style={styles.heroRow}>
        <Text style={[TYPOGRAPHY.hero, { color: C.text, fontSize: 56, letterSpacing: -2, lineHeight: 64 }]}>{hasHours ? totalHours : "-"}</Text>
        {hasHours && (
          <Text style={[styles.unit, { color: C.text3 }]} allowFontScaling={false}>sa</Text>
        )}
      </View>

      <View style={[styles.note, { backgroundColor: C.surface, borderColor: C.line }]}>
        <View style={[styles.noteDot, { backgroundColor: C.up }]} />
        <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
          Bu, iki haftalık normal bir sapma
        </Text>
      </View>

      <Text style={[TYPOGRAPHY.bodyMedium, styles.lede, { color: C.text3 }]}>
        Borç bir haftalık kapasiteni geçmez — üstü otomatik "Sırada"ya düşer. 21 günü geçen durak borç olmaktan çıkar.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 11, marginTop: STEP.s1 },
  unit: { fontFamily: "Archivo_500", fontSize: 24, paddingBottom: STEP.s2 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 9,
    marginTop: STEP.s3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  noteDot: { width: 8, height: 8, borderRadius: 2 },
  lede: { marginTop: STEP.s3, lineHeight: 22 },
});
