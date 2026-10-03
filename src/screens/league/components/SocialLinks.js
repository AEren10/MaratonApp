import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design/Icon";
import { Press, PRESS_ROW } from "../../../components/design/Press";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Liste sonundaki iliski aksiyonlari: davet ve yol arkadasi.
export function SocialLinks({ onInvite, onCompanion }) {
  const C = useC();
  const rows = [
    { key: "invite", icon: "users", title: "Arkadaşını davet et", sub: "Kodunla katılan herkes burada görünür", onPress: onInvite },
    { key: "companion", icon: "activity", title: "Yol arkadaşın", sub: "İki rota yan yana", onPress: onCompanion },
  ];
  return (
    <View style={[s.panel, { backgroundColor: C.surface, borderColor: C.line }]}>
      {rows.map((r, i) => (
        <Press key={r.key} onPress={r.onPress} scaleTo={PRESS_ROW} accessibilityLabel={r.title}
          style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
          <View style={[s.icon, { backgroundColor: C.void, borderColor: C.line }]}>
            <Icon name={r.icon} size={15} color={C.text2} />
          </View>
          <View style={s.flex}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{r.title}</Text>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{r.sub}</Text>
          </View>
          <Icon name="chevR" size={14} color={C.text3} />
        </Press>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  panel: { borderRadius: SHAPE.card, borderWidth: 1, overflow: "hidden", marginTop: STEP.s3 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, padding: STEP.s2, minHeight: 60 },
  icon: { width: 34, height: 34, borderRadius: SHAPE.iconBox - 2, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
});
