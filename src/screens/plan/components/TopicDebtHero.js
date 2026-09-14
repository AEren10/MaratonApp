import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { StatBlock } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

// Konu Borcu ust bolumu: GEÇİLMEYEN DURAKLAR saat, kapasite notu, aciklama.
export function TopicDebtHero({ totalHours, hasHours, capped }) {
  const C = useC();
  return (
    <Animated.View entering={FadeInDown.duration(560)}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>GEÇİLMEYEN DURAKLAR</Text>
      <View style={styles.heroRow}>
        <StatBlock value={hasHours ? totalHours : "—"} size="page" color={C.text} />
        {hasHours && (
          <Text style={[styles.unit, { color: C.text2 }]} allowFontScaling={false}>sa</Text>
        )}
      </View>

      {capped && (
        <View style={[styles.note, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <View style={[styles.noteDot, { backgroundColor: C.up }]} />
          <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
            Borç bir haftalık kapasitende tutuldu
          </Text>
        </View>
      )}

      <Text style={[TYPOGRAPHY.caption, styles.lede, { color: C.text2 }]}>
        Borç bir haftalık kapasiteni geçmez — üstü otomatik "Sırada"ya düşer.
        21 günü geçen durak borç olmaktan çıkar.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 11, marginTop: 14 },
  unit: { fontFamily: "Archivo_500", fontSize: 17, lineHeight: 24, paddingBottom: STEP.s1 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 9,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  noteDot: { width: 6, height: 6, borderRadius: 1 },
  lede: { marginTop: 14, maxWidth: 300, lineHeight: 22 },
});
