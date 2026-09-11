import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { Icon } from "../../../components/design";

// Deneme turu bir DERS degil. Ders renkleri yalniz ders baglaminda kullanilir
// (AGENTS.md). Tasarim bu rozeti notr text2 buyuk harf olarak gosteriyor.
export const TrialRecordRow = React.memo(function TrialRecordRow({ item, C, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(item.trial)}
      style={({ pressed }) => [styles.row, { borderTopColor: C.line, opacity: pressed ? 0.7 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.dateLabel}, net ${item.netLabel}`}
    >
      <View style={[styles.badge, { borderColor: C.line }]}>
        <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>
          {item.badge.toLocaleUpperCase("tr-TR")}
        </Text>
      </View>
      <View style={styles.mid}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>{item.dateLabel}</Text>
      </View>
      <View style={styles.end}>
        <Text style={[TYPOGRAPHY.statMedium, { color: C.text, fontSize: 19 }]} allowFontScaling={false}>
          {item.netLabel}
        </Text>
        <Text
          style={[
            TYPOGRAPHY.micro,
            { color: item.deltaLabel === "ilk" ? C.text3 : item.deltaUp ? C.up : C.down, marginTop: 3 },
          ]}
          allowFontScaling={false}
        >
          {item.deltaLabel}
        </Text>
      </View>
      <Icon name="chevR" size={13} color={C.text3} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  badge: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mid: { flex: 1, minWidth: 0 },
  end: { alignItems: "flex-end" },
});
