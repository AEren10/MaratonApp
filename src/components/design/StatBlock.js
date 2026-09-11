import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../themes/tokens";

// Tasarimin kahraman sayisi: Bricolage 400, negatif harf araligi, tabular.
// size: hero 96 | page 68 (ekran basi) | large 48 | count 30 | value 26
const SIZES = {
  hero:  { fontSize: 96, lineHeight: 96, letterSpacing: -3.8 },
  page:  { fontSize: 68, lineHeight: 58, letterSpacing: -2.0 },
  large: { fontSize: 48, lineHeight: 52, letterSpacing: -1.6 },
  count: { fontSize: 30, lineHeight: 36, letterSpacing: -0.9 },
  value: { fontSize: 26, lineHeight: 30, letterSpacing: -0.7 },
};

export function StatBlock({
  value,
  label,
  unit,
  size = "value",
  color,
  align = "left",
  style,
  children,
}) {
  const C = useC();
  const s = SIZES[size] || SIZES.value;

  return (
    <View style={[align === "center" && styles.center, style]}>
      {label ? (
        <Text style={[TYPOGRAPHY.label, { color: C.text3, marginBottom: STEP.s1 }]}>
          {label}
        </Text>
      ) : null}

      <View style={styles.row}>
        <Text
          style={[
            styles.value,
            s,
            { color: color || C.text },
          ]}
          allowFontScaling={false}
        >
          {value}
        </Text>
        {unit ? (
          <Text style={[TYPOGRAPHY.meta, styles.unit, { color: C.text3 }]}>{unit}</Text>
        ) : null}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center" },
  row: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  value: {
    fontFamily: "Bricolage_400",
    fontVariant: ["tabular-nums"],
  },
  unit: { paddingBottom: 4 },
});
