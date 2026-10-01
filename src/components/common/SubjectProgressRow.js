import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../design";
import { Press } from "../design/Press";
import { useC } from "../../contexts/ThemeContext";
import { SubjectIcon } from "./SubjectIcon";
import { SHAPE, STEP } from "../../themes/tokens";
import * as H from "../../lib/haptics";

function SubjectProgressRow({
  name,
  subjectKey,
  badge,
  value,
  pct = 0,
  color,
  onPress,
  showChevron = false,
  variant = "card",
  last = false,
  accessibilityLabel,
  style,
}) {
  const C = useC();
  const numericPct = typeof pct === "number" ? Math.max(0, Math.min(100, Math.round(pct))) : 0;
  const fillWidth = numericPct > 0 ? `${Math.max(3, numericPct)}%` : "0%";

  const handlePress = () => {
    if (!onPress) return;
    H.tap();
    onPress();
  };

  const content = (
    <>
      <SubjectIcon subject={name} subjectKey={subjectKey} color={color} />
      <View style={s.body}>
        <View style={s.topRow}>
          <Text style={[s.name, { color: C.text }]} numberOfLines={1}>
            {name}
          </Text>
          {value !== undefined && value !== null && (
            <Text style={[s.value, { color: C.text2 }]}>
              {value}
            </Text>
          )}
        </View>
        <View style={[s.track, { backgroundColor: C.line }]}>
          <View style={[s.fill, { width: fillWidth, backgroundColor: color }]} />
        </View>
      </View>
      {showChevron && <Icon name="chevR" size={13} color={C.text3} />}
    </>
  );

  const containerStyle = [
    variant === "card"
      ? [s.card, { backgroundColor: C.surface, borderColor: C.line }]
      : [s.row, { borderBottomColor: C.line, borderBottomWidth: last ? 0 : 1 }],
    style,
  ];

  if (onPress) {
    return (
      <Press
        haptic="none"
        scaleTo={0.985}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `${name}, ${value || `${numericPct}%`}`}
        style={containerStyle}
      >
        {content}
      </Press>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

export default memo(SubjectProgressRow);
export { SubjectProgressRow };

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingHorizontal: STEP.s2 + 2,
    paddingVertical: STEP.s2 + 1,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    marginBottom: STEP.s1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2 + 2,
  },
body: {
    flex: 1,
    minWidth: 0,
    gap: STEP.s1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontFamily: "Archivo_600",
    fontSize: 14,
    lineHeight: 18,
  },
  value: {
    fontFamily: "Archivo_500",
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  track: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 1.5,
  },
});
