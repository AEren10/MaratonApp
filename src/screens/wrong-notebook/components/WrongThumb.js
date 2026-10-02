import { View, StyleSheet } from "react-native";

import SignedImage from "../../../components/common/SignedImage";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP } from "../../../themes/tokens";
import { alpha } from "../../../themes/colorMix";

// Soru kagidi kucuk resmi. Fotograf varsa gercek soruyu gosterir; yoksa
// tasarimin soyut kagit placeholder'i kalir.
export function WrongThumb({ color, imagePath }) {
  const C = useC();
  return (
    <View style={[styles.box, { backgroundColor: alpha(color, 10), borderColor: alpha(color, 55) }]}>
      {imagePath ? (
        <SignedImage
          bucket="wrong-questions"
          path={imagePath}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={160}
        />
      ) : (
        <View style={styles.inner}>
          <View style={[styles.line, { width: "76%", backgroundColor: C.elev }]} />
          <View style={[styles.line, { width: "92%", backgroundColor: C.elev }]} />
          <View style={[styles.line, { width: "64%", backgroundColor: C.elev }]} />
          <View style={[styles.figure, { backgroundColor: C.track }]} />
        </View>
      )}
      <View style={[styles.stripe, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    // Soru fotografi genelde yatay: biraz genis, satir yuksekligi ayni.
    width: 104,
    height: 82,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    overflow: "hidden",
  },
  inner: { ...StyleSheet.absoluteFillObject, margin: STEP.s1 + 1, gap: 5 },
  line: { height: 4, borderRadius: 1 },
  figure: { flex: 1, borderRadius: SHAPE.chip },
  stripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, opacity: 0.85 },
});
