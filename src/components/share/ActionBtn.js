import { View, Text, StyleSheet } from "react-native";
import { Press } from "../../components/design/Press";
import { TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";

export function ActionBtn({ C, busy, label, onPress, icon, highlighted }) {
  return (
    <Press
      haptic="none"
      disabled={busy}
      onPress={() => { H.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[s.item, { opacity: busy ? 0.5 : 1 }]}
    >
      <View style={[s.actionCircle, { backgroundColor: highlighted ? C.brandTint : C.elev, borderColor: highlighted ? C.accent : C.border }]}>
        {icon}
      </View>
      <Text style={[TYPOGRAPHY.micro, s.label, { color: highlighted ? C.accentBright : C.text2 }]}>{label}</Text>
    </Press>
  );
}

const s = StyleSheet.create({
  item: { alignItems: "center", width: 62 },
  actionCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  label: { marginTop: 6, fontFamily: "Archivo_600", fontSize: 11 },
});
