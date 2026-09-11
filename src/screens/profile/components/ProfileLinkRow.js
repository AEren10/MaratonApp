import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, CONTROL } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// Genel amacli tek satirlik baglanti — ust ayrac cizgisi, sag tarafta
// meta metni + ok. Su an sadece Premium satirinda kullaniliyor.
export function ProfileLinkRow({ label, meta, onPress, first }) {
  const C = useC();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => { H.tap(); onPress?.(); }}
      style={({ pressed }) => ({
        flexDirection: "row", alignItems: "center", gap: STEP.s2,
        minHeight: CONTROL.tapMin + 8,
        borderTopWidth: first ? 0 : 1, borderTopColor: C.line,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ flex: 1, fontFamily: "Archivo_500", fontSize: 14, color: C.text }}>{label}</Text>
      {meta ? (
        <Text style={{ fontFamily: "Archivo_500", fontSize: 12, color: C.text3 }}>{meta}</Text>
      ) : null}
      <Icon name="chevR" size={16} color={C.text3} />
    </Pressable>
  );
}
