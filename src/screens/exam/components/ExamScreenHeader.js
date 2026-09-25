import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Sinav akisi ekranlarinin ust satiri: geri oku + Bricolage baslik.
// Dokunma alani 44px, gorsel ok tasarimdaki 9x15 boyutunda kalir.
export function ExamScreenHeader({ title, onBack, icon = "chevL", label = "Geri" }) {
  const C = useC();
  return (
    <View style={s.row}>
      <Press haptic="none"
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={s.back}
      >
        <Icon name={icon} size={icon === "x" ? 14 : 16} color={C.text2} />
      </Press>
      {title ? <Text style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>{title}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s1,
    paddingLeft: GUTTER - 12, paddingRight: GUTTER, paddingTop: 4,
  },
  back: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
});
