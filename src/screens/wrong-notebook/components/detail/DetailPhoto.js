import { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";

import SignedImage from "../../../../components/common/SignedImage";
import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Soru fotografi: 230px kadraj, solda ders seridi, "Tam ekran" etiketi.
// Dokununca karartilmis zeminde tam ekran acilir.
export function DetailPhoto({ path, subjectColor }) {
  const C = useC();
  const [zoom, setZoom] = useState(false);
  if (!path) return null;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setZoom(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel="Soru fotoğrafı, tam ekran aç"
        style={[styles.frame, { backgroundColor: C.surface, borderColor: C.elev }]}
      >
        <SignedImage bucket="wrong-questions" path={path} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" transition={200} />
        <View style={[styles.tag, { backgroundColor: C.scrim }]}>
          <Text style={[TYPOGRAPHY.tableHead, styles.tagText, { color: C.text2 }]}>Tam ekran</Text>
        </View>
        <View style={[styles.stripe, { backgroundColor: subjectColor }]} />
      </Pressable>

      <Modal visible={zoom} transparent animationType="fade" onRequestClose={() => setZoom(false)}>
        <View style={[styles.overlay, { backgroundColor: C.scrim }]}>
          <Pressable
            onPress={() => setZoom(false)}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            style={[styles.close, { backgroundColor: C.surface, borderColor: C.border }]}
          >
            <Icon name="x" size={18} color={C.text} />
          </Pressable>
          <SignedImage bucket="wrong-questions" path={path} style={styles.zoomImage} contentFit="contain" cachePolicy="memory-disk" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  frame: { height: 230, borderRadius: SHAPE.sheet, borderWidth: 1, overflow: "hidden" },
  tag: {
    position: "absolute",
    right: STEP.s2,
    top: STEP.s2,
    height: 30,
    paddingHorizontal: STEP.s2,
    borderRadius: 2,
    justifyContent: "center",
  },
  tagText: { letterSpacing: 0 },
  stripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, opacity: 0.85 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  close: {
    position: "absolute",
    top: STEP.s5 + STEP.s1,
    right: GUTTER,
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  zoomImage: { width: "92%", height: "70%" },
});
