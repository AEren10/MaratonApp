import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export const SearchResultRow = React.memo(function SearchResultRow({
  C, title, meta, dotColor, trailing, trailingAccent, onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${title}, ${meta}` : title}
      style={({ pressed }) => [styles.row, { borderTopColor: C.line, opacity: pressed ? 0.7 : 1 }]}
    >
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>{title}</Text>
        {meta ? (
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <Text style={[TYPOGRAPHY.micro, { color: trailingAccent ? C.accentBright : C.text3 }]}>
          {trailing}
        </Text>
      ) : (
        <Icon name="chevR" size={12} color={C.text5} />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  dot: { width: 8, height: 8, borderRadius: 1 },
  body: { flex: 1, minWidth: 0 },
});
