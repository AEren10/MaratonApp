import { Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../../components/design/Icon";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../../themes/tokens";
import * as H from "../../../../lib/haptics";

// Geri donus modunun ikincil aksiyon satiri: "Bugunku plana don" /
// "Rotayi yeniden duzenle" gibi tek satirlik navigasyon secenekleri.
export function HomeHeroComebackAction({ label, onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={() => { H.tap(); onPress?.(); }}
      style={[s.row, { backgroundColor: C.surface, borderColor: C.elev }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>{label}</Text>
      <Icon name="chevR" size={14} color={C.text5} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: CONTROL.tapMin,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: STEP.s1,
  },
});
