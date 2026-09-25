import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { ExamSwitch } from "./ExamSwitch";
import { Press } from "../../../components/design/Press";

// "Bir gün önce hatırlat" — alt satir hatirlatma anini gosterir. Sinav
// tarihi yoksa ya da an gectiyse alt satir cizilmez.
export function ExamReminderRow({ on, caption, onToggle }) {
  const C = useC();
  return (
    <Press haptic="none"
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel="Bir gün önce hatırlat"
      style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}
    >
      <View style={s.text}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>Bir gün önce hatırlat</Text>
        {caption ? (
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>{caption}</Text>
        ) : null}
      </View>
      <ExamSwitch on={on} />
    </Press>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2,
    paddingVertical: 17, paddingHorizontal: 18, borderRadius: SHAPE.panel, borderWidth: 1,
  },
  text: { flex: 1, minWidth: 0 },
});
