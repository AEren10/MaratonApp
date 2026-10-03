import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { Press } from "../../../components/design/Press";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Tasarimin segment kontrolu: h36 r6, secili yuzey bir kademe yukarida.
// Eskiden secili sekme dolu kirmiziydi -- kirmizi aksiyonun rengi, durumun degil.
export const LeagueSegment = memo(function LeagueSegment({ tabs, value, onChange }) {
  const C = useC();
  return (
    <View style={[s.wrap, { backgroundColor: C.void, borderColor: C.line }]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.key === value;
        return (
          <Press
            key={t.key}
            haptic="select"
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[s.item, on && { backgroundColor: C.elev, borderColor: C.border }]}
          >
            <Text style={[TYPOGRAPHY.captionMedium, { color: on ? C.text : C.text3 }]}>{t.label}</Text>
          </Press>
        );
      })}
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    marginHorizontal: GUTTER,
    marginBottom: STEP.s3,
    padding: 3,
    borderRadius: SHAPE.segment + 3,
    borderWidth: 1,
  },
  item: {
    flex: 1,
    minHeight: CONTROL.segment,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SHAPE.segment,
    borderWidth: 1,
    borderColor: "transparent",
  },
});
