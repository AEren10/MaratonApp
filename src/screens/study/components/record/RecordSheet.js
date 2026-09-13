import { Modal, Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useC } from "../../../../contexts/ThemeContext";
import { alpha } from "../../../../themes/colorMix";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Alt sayfa kabugu: soluk arka plan, bg yuzey + ust kenarlik, tutamak, bolum etiketi.
export function RecordSheet({ visible, label, onClose, children }) {
  const C = useC();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: alpha(C.canvas, 72) }]} onPress={onClose} accessibilityLabel="Kapat">
        <Pressable onPress={(e) => e.stopPropagation()} style={[styles.sheet, { backgroundColor: C.bg, borderTopColor: C.elev }]}>
          <SafeAreaView edges={["bottom"]}>
            <View style={[styles.handle, { backgroundColor: C.elev }]} />
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{label}</Text>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>{children}</ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function SheetOption({ title, meta, color, selected, onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, { borderTopColor: C.line }]}
    >
      {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text numberOfLines={1} style={[TYPOGRAPHY.bodyMedium, styles.flex, { color: selected ? C.text : C.text2 }]}>{title}</Text>
      {meta ? <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{meta}</Text> : null}
      <View style={[styles.radio, { borderColor: selected ? C.accent : C.border, backgroundColor: selected ? C.accent : "transparent" }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    maxHeight: "78%", borderTopWidth: 1, paddingHorizontal: GUTTER, paddingTop: STEP.s2,
    borderTopLeftRadius: SHAPE.sheet + STEP.s1, borderTopRightRadius: SHAPE.sheet + STEP.s1,
  },
  handle: { width: 38, height: 4, borderRadius: SHAPE.chip / 3, alignSelf: "center", marginBottom: STEP.s3 },
  scroll: { marginTop: STEP.s1, marginBottom: STEP.s3 },
  option: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: 52, borderTopWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: SHAPE.chip / 6 },
  flex: { flex: 1 },
  radio: { width: 14, height: 14, borderRadius: SHAPE.chip / 2, borderWidth: 1.5 },
});
