import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

// Günün tek belirgin AI önerisi + tek aksiyon.
export function DailyActionCard({ suggestion, loading, onAdd, onUnderstood, onLater }) {
  const C = useC();
  if (loading) {
    return (
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border, alignItems: "center" }]}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }
  if (!suggestion) return null;
  const color = suggestion.color || C.accent;

  return (
    <View style={[s.card, { backgroundColor: color + "0F", borderColor: color + "30" }]}>
      <View style={s.head}>
        <Icon name="zap" size={13} color={color} sw={2.5} />
        <Text style={[s.tag, { color }]}>BUGÜN İÇİN</Text>
      </View>

      <Text style={[s.title, { color: C.text }]}>{suggestion.title}</Text>
      <Text style={[s.body, { color: C.sec }]}>{suggestion.body}</Text>

      <View style={s.actions}>
        <Pressable onPress={onAdd} style={[s.primary, { backgroundColor: color }]}>
          <Icon name="plus" size={15} color="#FFFFFF" sw={2.5} />
          <Text style={s.primaryText}>Plana Ekle</Text>
        </Pressable>
        <Pressable onPress={onUnderstood} style={s.ghost}>
          <Text style={[s.ghostText, { color: C.muted }]}>Anladım</Text>
        </Pressable>
        <Pressable onPress={onLater} style={s.ghost}>
          <Text style={[s.ghostText, { color: C.muted }]}>Daha sonra</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.lg,
    overflow: "hidden",
  },
  head: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: SPACING.sm },
  tag: { ...TYPOGRAPHY.label },
  title: { ...TYPOGRAPHY.subheading },
  body: { ...TYPOGRAPHY.body, marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.lg },
  primary: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  primaryText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
  ghost: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  ghostText: { ...TYPOGRAPHY.captionMedium },
});
