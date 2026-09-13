import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Yanlis Ekle'nin ilk adimi: soru fotografi kadraji + cek / galeri.
// Fotograf yokken kadraj tasarimin soyut soru kagidini gosterir.
export function PhotoCapture({ image, onCamera, onGallery }) {
  const C = useC();
  return (
    <View style={styles.wrap}>
      <View style={[styles.frame, { backgroundColor: C.surface, borderColor: C.elev }]}>
        {image ? (
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <View style={styles.paper}>
            {["72%", "90%", "58%"].map((w) => (
              <View key={w} style={[styles.line, { width: w, backgroundColor: C.elev }]} />
            ))}
            <View style={[styles.figure, { backgroundColor: C.track }]} />
          </View>
        )}
        <View style={[styles.corner, styles.tl, { borderColor: C.accent }]} />
        <View style={[styles.corner, styles.br, { borderColor: C.accent }]} />
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onCamera}
          accessibilityRole="button"
          style={[styles.btn, { backgroundColor: C.brandTint, borderColor: C.accent }]}
        >
          <Icon name="camera" size={17} color={C.accent} />
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accentBright }]}>
            {image ? "Yeniden çek" : "Fotoğraf çek"}
          </Text>
        </Pressable>
        <Pressable
          onPress={onGallery}
          accessibilityRole="button"
          style={[styles.btn, { borderColor: C.border }]}
        >
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>Galeriden seç</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  frame: { height: 200, borderRadius: SHAPE.sheet, borderWidth: 1, overflow: "hidden" },
  paper: { ...StyleSheet.absoluteFillObject, margin: STEP.s3, gap: STEP.s1 },
  line: { height: 6, borderRadius: 1 },
  figure: { flex: 1, borderRadius: SHAPE.chip + 4 },
  corner: { position: "absolute", width: 22, height: 22 },
  tl: { left: 14, top: 14, borderLeftWidth: 2, borderTopWidth: 2, borderTopLeftRadius: SHAPE.chip },
  br: { right: 14, bottom: 14, borderRightWidth: 2, borderBottomWidth: 2, borderBottomRightRadius: SHAPE.chip },
  actions: { flexDirection: "row", gap: STEP.s2 - 2, marginTop: STEP.s2 },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
  },
});
