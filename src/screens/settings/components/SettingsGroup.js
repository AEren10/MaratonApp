import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, GUTTER, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: bolum etiketi + surface zeminli, elev kenarlikli kart.
// Satirlar kartin icinde `line` ayiricilarla bolunuyor (GlassCard YOK,
// derinlik golgeyle degil yuzey tonu + 1px kenarlikla kuruluyor).
export function SettingsGroup({ title, children }) {
  const C = useC();
  return (
    <View style={styles.container}>
      {title ? (
        <Text style={[TYPOGRAPHY.label, styles.title, { color: C.text3 }]}>{title}</Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: STEP.s3 + 4, paddingHorizontal: GUTTER },
  title: { marginBottom: STEP.s1, marginLeft: 2, letterSpacing: 1.4 },
  card: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: "hidden" },
});
