import { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

function PremiumBadge({ style }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={[s.badge, style]}>
      <Text style={s.text}>PRO</Text>
    </View>
  );
}

export default memo(PremiumBadge);

function makeStyles(C) {
  return StyleSheet.create({
    badge: {
      backgroundColor: C.accent,
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
    },
    text: {
      ...TYPOGRAPHY.micro,
      color: "#0C0D11",
      fontFamily: "SpaceGrotesk_700Bold",
      fontSize: 9,
      letterSpacing: 0.8,
    },
  });
}
