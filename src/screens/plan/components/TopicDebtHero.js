import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Skeleton } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export function TopicDebtHero({ totalHours, hasHours, capped, loading }) {
  const C = useC();

  if (loading) {
    return (
      <View style={styles.heroWrap}>
        <Skeleton width={140} height={14} radius={4} style={{ marginBottom: STEP.s2 }} />
        <View style={styles.heroRow}>
          <Skeleton width={90} height={60} radius={8} />
          <Skeleton width={28} height={24} radius={4} style={{ marginBottom: STEP.s1 }} />
        </View>
        <Skeleton width={210} height={34} radius={SHAPE.chip} style={{ marginTop: STEP.s2 }} />
        <Skeleton width="92%" height={16} radius={4} style={{ marginTop: STEP.s2 }} />
      </View>
    );
  }

  return (
    <Animated.View style={styles.heroWrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>GEÇİLMEYEN DURAKLAR</Text>
      <View style={styles.heroRow}>
        <Text style={[styles.heroStat, { color: C.text }]}>{hasHours ? totalHours : "0"}</Text>
        <Text style={[styles.unit, { color: C.text2 }]} allowFontScaling={false}>sa</Text>
      </View>

      <View style={[styles.note, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={[styles.noteDot, { backgroundColor: C.up }]} />
        <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
          Bu, iki haftalık normal bir sapma
        </Text>
      </View>

      <Text style={[TYPOGRAPHY.body, styles.lede, { color: C.text2 }]}>
        Borç bir haftalık kapasiteni geçmez — üstü otomatik "Sırada"ya düşer. 21 günü geçen durak borç olmaktan çıkar.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    paddingTop: STEP.s3,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: STEP.s2,
    marginTop: STEP.s2,
  },
  heroStat: {
    fontFamily: "Bricolage_400",
    fontSize: 68,
    lineHeight: 68,
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontFamily: "Archivo_500",
    fontSize: 17,
    paddingBottom: STEP.s1,
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: STEP.s1,
    marginTop: STEP.s2,
    paddingVertical: STEP.s1,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  noteDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  lede: {
    marginTop: STEP.s2,
    maxWidth: 300,
    lineHeight: 22,
  },
});
