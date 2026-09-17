import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { Icon } from "../../../components/design";

export const TrialRecordRow = React.memo(function TrialRecordRow({ item, C, onPress }) {
  const isTyt = (item.badge || "").toUpperCase().includes("TYT");
  const isUp = item.deltaUp;
  const isFirst = item.deltaLabel === "ilk";
  const deltaColor = isFirst ? C.text3 : isUp ? C.up : C.down;

  return (
    <Pressable
      onPress={() => onPress(item.trial)}
      style={({ pressed }) => [
        styles.row,
        { borderTopColor: C.line, opacity: pressed ? 0.7 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.dateLabel}, net ${item.netLabel}`}
    >
      <View
        style={[
          styles.badge,
          isTyt
            ? { backgroundColor: C.brandTint, borderColor: C.bandEdge || C.accent + "30" }
            : { borderColor: C.border },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: isTyt ? C.accentBright : C.text3 },
          ]}
        >
          {item.badge.toLocaleUpperCase("tr-TR")}
        </Text>
      </View>

      <View style={styles.mid}>
        <Text style={[styles.title, { color: C.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.date, { color: C.text3 }]}>
          {item.dateLabel}
        </Text>
      </View>

      <View style={styles.end}>
        <Text style={[styles.net, { color: C.text }]} allowFontScaling={false}>
          {item.netLabel}
        </Text>
        <Text
          style={[styles.delta, { color: deltaColor }]}
          allowFontScaling={false}
        >
          {item.deltaLabel}
        </Text>
      </View>

      <Icon name="chevR" size={13} color={C.text5 || C.text4} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  badge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: SHAPE.chip, // 6px
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "Archivo_700",
    fontSize: 11,
    letterSpacing: 1.3,
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: "Archivo_500",
    fontSize: 13.5,
  },
  date: {
    fontFamily: "Archivo_500",
    fontSize: 11.5,
    marginTop: 4,
  },
  end: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  net: {
    fontFamily: "Bricolage_400",
    fontSize: 19,
    fontVariant: ["tabular-nums"],
  },
  delta: {
    fontFamily: "Archivo_600",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    marginTop: 3,
  },
});