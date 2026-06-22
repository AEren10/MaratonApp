import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useC } from "../../contexts/ThemeContext";
import { usePremium } from "../../contexts/PremiumContext";
import { Icon } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

export default function PremiumGate({ feature, children, fallback }) {
  const { checkFeature, showPaywall } = usePremium();
  const hasAccess = checkFeature(feature);

  if (hasAccess) return children;
  if (fallback) return fallback;

  return <PaywallPrompt onPress={showPaywall} />;
}

function PaywallPrompt({ onPress }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.wrap}>
      <View style={s.iconWrap}>
        <Icon name="lock" size={24} color={C.accent} />
      </View>
      <Text style={s.title}>Bu özellik Premium ile sınırsız</Text>
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={[C.accent, C.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.btn}
        >
          <Text style={s.btnText}>Yükselt</Text>
          <Icon name="arrowR" size={16} color="#FFFFFF" sw={2.5} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    wrap: {
      alignItems: "center", padding: SPACING.xxl,
      margin: SPACING.lg, borderRadius: RADIUS.xxl,
      backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    },
    iconWrap: {
      width: 52, height: 52, borderRadius: 26,
      backgroundColor: C.accent + "1A",
      alignItems: "center", justifyContent: "center",
      marginBottom: SPACING.md,
    },
    title: {
      ...TYPOGRAPHY.bodySemiBold, color: C.text,
      textAlign: "center", marginBottom: SPACING.lg,
    },
    btn: {
      flexDirection: "row", alignItems: "center", gap: SPACING.sm,
      paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
    },
    btnText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
  });
}
