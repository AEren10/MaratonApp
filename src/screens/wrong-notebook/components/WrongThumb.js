import { View, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP } from "../../../themes/tokens";

// Soru kagidi kucuk resmi: uc satir cizgi + sekil kutusu, solda ders seridi.
// Fotograf degil, tasarimin soyut kucuk resmi.
export function WrongThumb({ color }) {
  const C = useC();
  return (
    <View style={[styles.box, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={styles.inner}>
        <View style={[styles.line, { width: "76%", backgroundColor: C.elev }]} />
        <View style={[styles.line, { width: "92%", backgroundColor: C.elev }]} />
        <View style={[styles.line, { width: "64%", backgroundColor: C.elev }]} />
        <View style={[styles.figure, { backgroundColor: C.track }]} />
      </View>
      <View style={[styles.stripe, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 62,
    height: 62,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    overflow: "hidden",
  },
  inner: { ...StyleSheet.absoluteFillObject, margin: STEP.s1 + 1, gap: 5 },
  line: { height: 4, borderRadius: 1 },
  figure: { flex: 1, borderRadius: SHAPE.chip },
  stripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, opacity: 0.85 },
});
