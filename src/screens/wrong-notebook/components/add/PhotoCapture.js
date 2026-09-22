import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

export function PhotoCapture({ image, onCamera, onGallery, onRemove }) {
  const C = useC();
  return (
    <View style={styles.wrap}>
      <View style={[styles.frame, { backgroundColor: C.surface, borderColor: C.elev }]}>
        {image ? (
          <>
            <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
            {onRemove ? (
              <Pressable
                onPress={onRemove}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Fotoğrafı kaldır"
                style={[styles.removeBtn, { backgroundColor: C.surface, borderColor: C.border }]}
              >
                <Icon name="x" size={14} color={C.text} />
              </Pressable>
            ) : null}
          </>
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
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  frame: {
    height: 190, borderRadius: SHAPE.card, borderWidth: 1, overflow: "hidden",
    justifyContent: "center", paddingHorizontal: STEP.s4,
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  paper: { gap: STEP.s1 + 2 },
  line: { height: 6, borderRadius: 3 },
  figure: { width: "100%", height: 80, borderRadius: SHAPE.button, marginTop: STEP.s1 + 2 },
  corner: { position: "absolute", width: 14, height: 14 },
  tl: { top: 12, left: 12, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderTopLeftRadius: 4 },
  br: { bottom: 12, right: 12, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderBottomRightRadius: 4 },
  actions: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s2 },
  btn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: STEP.s1, height: 46, borderRadius: SHAPE.button, borderWidth: 1,
  },
});
