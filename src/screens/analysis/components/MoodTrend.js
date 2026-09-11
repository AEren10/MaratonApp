import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Card } from "../../../components/design";

// Madde 4: Son denemelerin moral (mood) trendi — emoji şerit.
const EMOJI = { good: "😄", okay: "😐", bad: "😞" };

const makeStyles = (C) =>
  StyleSheet.create({
    title: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginBottom: STEP.s2 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    item: { alignItems: "center", gap: 4, flex: 1 },
    date: { ...TYPOGRAPHY.micro, color: C.text3 },
  });

export function MoodTrend({ trials }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const withMood = trials.filter((t) => t.mood).slice(0, 7).reverse();
  if (withMood.length < 2) return null;

  return (
    <Card tone="surface" radius="panel" style={{ padding: STEP.s3 }}>
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
    </Card>
  );
}
