import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: bolum etiketi + surface zeminli, elev kenarlikli kart.
// Satirlar kartin icinde `line` ayiricilarla bolunuyor (GlassCard YOK,
// derinlik golgeyle degil yuzey tonu + 1px kenarlikla kuruluyor).
export function SettingsGroup({ title, children }) {
  const C = useC();
  return (
    <View style={styles.container}>
      {title ? (
        <Text style={[TYPOGRAPHY.label, styles.title, { color: C.text2 }]}>{title}</Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  title: { marginBottom: STEP.s2 },
  card: { borderRadius: SHAPE.sheet, borderWidth: 1, overflow: "hidden" },
});
