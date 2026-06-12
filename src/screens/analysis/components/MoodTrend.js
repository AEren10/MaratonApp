import { View, Text, StyleSheet } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

// Madde 4: Son denemelerin moral (mood) trendi — emoji şerit.
const EMOJI = { good: "😄", okay: "😐", bad: "😞" };

export function MoodTrend({ trials }) {
  const withMood = trials.filter((t) => t.mood).slice(0, 7).reverse();
  if (withMood.length < 2) return null;

  return (
    <View style={s.card}>
      <Text style={s.title}>Moral Trendi</Text>
      <View style={s.row}>
        {withMood.map((t, i) => (
          <View key={t.id || i} style={s.item}>
            <Text style={{ fontSize: 22 }}>{EMOJI[t.mood] || "·"}</Text>
            <Text style={s.date} numberOfLines={1}>
              {new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.lg,
  },
  title: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginBottom: SPACING.md },
  row: { flexDirection: "row", justifyContent: "space-between" },
  item: { alignItems: "center", gap: 4, flex: 1 },
  date: { ...TYPOGRAPHY.micro, color: C.muted },
});
