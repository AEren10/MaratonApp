import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

const StopRow = memo(function StopRow({ item, onPress, C }) {
  return (
    <Pressable
      onPress={() => onPress(item.key)}
      accessibilityRole="button"
      accessibilityLabel={[item.name, item.note, item.date].filter(Boolean).join(", ")}
      style={({ pressed }) => [s.row, { borderTopColor: C.line, opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[s.diamond, { borderColor: C.stop }]} />
      <View style={s.copy}>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text }]} numberOfLines={2}>{item.name}</Text>
        {item.note ? (
          <Text style={[TYPOGRAPHY.meta, s.note, { color: C.text3 }]}>{item.note}</Text>
        ) : null}
      </View>
      {item.date ? (
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text2 }]}>{item.date}</Text>
      ) : null}
    </Pressable>
  );
});

// "GELECEK DURAKLAR": siradaki acik duraklar; dokununca Durak Detayi.
export function RouteUpcomingStops({ items, onStop }) {
  const C = useC();
  if (!items.length) return null;
  return (
    <View>
      <Text style={[TYPOGRAPHY.label, s.label, { color: C.text2 }]}>GELECEK DURAKLAR</Text>
      {items.map((item) => <StopRow key={item.key} item={item} onPress={onStop} C={C} />)}
    </View>
  );
}

const s = StyleSheet.create({
  label: { paddingBottom: STEP.s1 / 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2 + STEP.s1 / 2,
    paddingVertical: STEP.s2 + STEP.s1 / 2,
    minHeight: 44,
    borderTopWidth: 1,
  },
  diamond: { width: 9, height: 9, borderWidth: 2, transform: [{ rotate: "45deg" }] },
  copy: { flex: 1, minWidth: 0 },
  note: { marginTop: STEP.s1 / 2 },
});
