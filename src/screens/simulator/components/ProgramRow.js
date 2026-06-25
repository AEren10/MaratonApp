import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { PROGRAM_CATEGORIES } from "../../../data/programs";

const fmt = (n) => n.toLocaleString("tr-TR");

const ProgramRow = React.memo(function ProgramRow({ item, onSelect, C }) {
  const cat = PROGRAM_CATEGORIES.find((x) => x.id === item.category);
  const color = cat ? (C[cat.color] || C.purple) : C.purple;
  const handlePress = useCallback(() => onSelect(item), [onSelect, item]);
  return (
    <Pressable onPress={handlePress} style={[styles.row, { borderBottomColor: C.border }]}>
      <View style={[styles.icon, { backgroundColor: color + "1A" }]}>
        <Icon name={cat?.icon || "target"} size={15} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: C.text }]}>{item.name}</Text>
        <Text style={[styles.uni, { color: C.muted }]}>{item.uni}</Text>
      </View>
      <Text style={[styles.rank, { color }]}>~{fmt(item.rank)}</Text>
    </Pressable>
  );
});

export default ProgramRow;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1 },
  icon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  name: { ...TYPOGRAPHY.bodyMedium },
  uni: { ...TYPOGRAPHY.micro, marginTop: 2 },
  rank: { ...TYPOGRAPHY.bodySemiBold, fontSize: 13 },
});
