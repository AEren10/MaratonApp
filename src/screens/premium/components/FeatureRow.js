import { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";

function FeatureRow({ title, index }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={[s.row, index > 0 && s.borderTop]}>
      <View style={s.iconWrap}>
        <Icon name="check" size={14} color={C.green} sw={2.5} />
      </View>
      <Text style={s.text} numberOfLines={1}>{title}</Text>
    </View>
  );
}

export default memo(FeatureRow);

function makeStyles(C) {
  return StyleSheet.create({
    row: {
      flexDirection: "row", alignItems: "center",
      paddingVertical: SPACING.md, gap: SPACING.md,
    },
    borderTop: { borderTopWidth: 1, borderTopColor: C.border },
    iconWrap: {
      width: 24, height: 24, borderRadius: 12,
      backgroundColor: C.green + "1A",
      alignItems: "center", justifyContent: "center",
    },
    text: { ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 },
  });
}
