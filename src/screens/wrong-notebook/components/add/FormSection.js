import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Form bolumu: harf aralikli etiket + yaninda meta ipucu ("isteğe bağlı").
export function FormSection({ label, hint, children, wrap = true }) {
  const C = useC();
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{label}</Text>
        {hint ? (
          <Text style={[TYPOGRAPHY.micro, styles.hint, { color: C.text3 }]} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
      <View style={wrap ? styles.chips : styles.block}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 4 },
  head: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  hint: { flexShrink: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: STEP.s2 },
  block: { marginTop: STEP.s2 },
});
