import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY } from "../../../../themes/tokens";

// Tum zamana bagli hero varyantlarinin ortak ust satiri:
// EYEBROW solda, tarih/ikincil bilgi sagda.
export function HomeHeroEyebrow({ label, trailing }) {
  const C = useC();
  return (
    <View style={s.row}>
      <Text style={[TYPOGRAPHY.captionMedium, { color: C.accentBright, letterSpacing: 2.5 }]}>
        {label}
      </Text>
      {trailing ? (
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{trailing}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
});
