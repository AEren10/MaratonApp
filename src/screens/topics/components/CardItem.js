import React, { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Icon, IconBox, Chip } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";

export const CardItem = React.memo(function CardItem({ item, onPress, styles, C }) {
  const pct = item.count > 0 ? Math.round((item.mastered / item.count) * 100) : 0;
  const pctColor = pct >= 70 ? C.green : pct >= 40 ? C.amber : C.red;
  const handlePress = useCallback(() => onPress(item), [onPress, item]);
  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <IconBox icon={item.icon} color={item.color} size={44} rounded={14} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{item.title}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 2 }]}>
          {item.mastered}/{item.count} öğrenildi
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <Chip color={pctColor}>%{pct}</Chip>
        <View style={styles.miniBar}>
          <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: item.color }]} />
        </View>
      </View>
      <Icon name="chevR" size={16} color={C.muted} />
    </Pressable>
  );
});
