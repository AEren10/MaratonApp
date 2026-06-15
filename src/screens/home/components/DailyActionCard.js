import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { Icon } from "../../../components/design";

// H) Günün tek belirgin AI önerisi + tek aksiyon.
export function DailyActionCard({ suggestion, loading, onAdd, onUnderstood, onLater }) {
  if (loading) {
    return (
      <View style={[s.card, { alignItems: "center" }]}>
        <ActivityIndicator color={C.amber} />
      </View>
    );
  }
  if (!suggestion) return null;
  const color = suggestion.color || C.amber;

  return (
    <View style={[s.card, { borderColor: color + "55" }]}>
      <View style={s.head}>
        <Icon name="zap" size={13} color={color} sw={2.5} />
        <Text style={[s.tag, { color }]}>BUGÜN İÇİN</Text>
      </View>

      <Text style={s.title}>{suggestion.title}</Text>
      <Text style={s.body}>{suggestion.body}</Text>

      <View style={s.actions}>
        <Pressable onPress={onAdd} style={[s.primary, { backgroundColor: color }]}>
          <Icon name="plus" size={15} color={C.bg} sw={2.5} />
          <Text style={[s.primaryText, { color: C.bg }]}>Plana Ekle</Text>
        </Pressable>
        <Pressable onPress={onUnderstood} style={s.ghost}>
          <Text style={s.ghostText}>Anladım</Text>
        </Pressable>
        <Pressable onPress={onLater} style={s.ghost}>
          <Text style={s.ghostText}>Daha sonra</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.lg,
    overflow: "hidden",
  },
  accent: { position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: C.amber, opacity: 0.5 },
  head: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: SPACING.sm },
  tag: { ...TYPOGRAPHY.label },
  title: { ...TYPOGRAPHY.subheading, color: C.text },
  body: { ...TYPOGRAPHY.body, color: C.sec, marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.lg },
  primary: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  primaryText: { ...TYPOGRAPHY.button },
  ghost: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  ghostText: { ...TYPOGRAPHY.captionMedium, color: C.muted },
});
