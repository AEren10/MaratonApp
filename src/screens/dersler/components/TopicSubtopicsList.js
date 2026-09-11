import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SectionLabel, Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const SubtopicRow = React.memo(function SubtopicRow({ item, color }) {
  const C = useC();
  return (
    <View
      style={[
        s.row,
        { backgroundColor: item.done ? color + "14" : C.surface, borderColor: item.done ? color + "20" : C.border },
      ]}
    >
      <Icon
        name={item.done ? "checkCircle" : "circle"}
        size={20}
        color={item.done ? color : C.muted}
        sw={item.done ? 2.5 : 1.8}
      />
      <Text
        style={[
          TYPOGRAPHY.body,
          { color: item.done ? C.text2 : C.text, flex: 1 },
          item.done && { textDecorationLine: "line-through" },
        ]}
      >
        {item.name}
      </Text>
    </View>
  );
});

// Tasarimda yer almiyor ama mevcut, gercek veriye dayali alt konu listesi —
// kaldirmak yerine korunuyor.
export function TopicSubtopicsList({ items, color }) {
  if (!items.length) return null;
  return (
    <View style={{ marginTop: STEP.s4 }}>
      <SectionLabel>ALT KONULAR</SectionLabel>
      {items.map((item) => (
        <SubtopicRow key={item.name} item={item} color={color} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: STEP.s2 + 2,
    marginBottom: STEP.s1,
    gap: STEP.s2,
    borderWidth: 1,
  },
});
