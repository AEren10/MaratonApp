import { ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useC } from "../../../../contexts/ThemeContext";
import { BottomSheet } from "../../../../components/design/BottomSheet";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// Alt sayfa kabugu: bg yuzey + ust kenarlik, tutamak, bolum etiketi.
// BottomSheet (kenara yapisik): karartma artik panelle birlikte kaymiyor,
// tutamaktan asagi cekince kapanir; liste kendi basina kaydirilir.
export function RecordSheet({ visible, label, onClose, children }) {
  const C = useC();
  const header = (
    <View style={styles.header}>
      <View style={[styles.handle, { backgroundColor: C.elev }]} />
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{label}</Text>
    </View>
  );
  return (
    <BottomSheet visible={visible} onClose={onClose} edge header={header}
      style={[styles.sheet, { backgroundColor: C.bg, borderColor: C.elev }]}>
      <SafeAreaView edges={["bottom"]}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </SafeAreaView>
    </BottomSheet>
  );
}

export function SheetOption({ title, meta, color, selected, onPress }) {
  const C = useC();
  return (
    <Press haptic="none"
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, { borderTopColor: C.line }]}
    >
      {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text numberOfLines={1} style={[TYPOGRAPHY.bodyMedium, styles.flex, { color: selected ? C.text : C.text2 }]}>{title}</Text>
      {meta ? <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{meta}</Text> : null}
      <View style={[styles.radio, { borderColor: selected ? C.accent : C.border, backgroundColor: selected ? C.accent : "transparent" }]} />
    </Press>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: "78%", borderWidth: 0, borderTopWidth: 1, paddingHorizontal: GUTTER,
    borderTopLeftRadius: SHAPE.sheet + STEP.s1, borderTopRightRadius: SHAPE.sheet + STEP.s1,
  },
  header: { paddingTop: STEP.s2, minHeight: 44 },
  handle: { width: 38, height: 4, borderRadius: SHAPE.chip / 3, alignSelf: "center", marginBottom: STEP.s3 },
  scroll: { marginTop: STEP.s1, marginBottom: STEP.s3 },
  option: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: 52, borderTopWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: SHAPE.chip / 6 },
  flex: { flex: 1 },
  radio: { width: 14, height: 14, borderRadius: SHAPE.chip / 2, borderWidth: 1.5 },
});
