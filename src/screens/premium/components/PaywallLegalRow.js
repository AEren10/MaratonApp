import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { PAYWALL_LEGAL } from "../../../constants/paywallMoment";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";

// Geri yukleme + yasal baglantilar. Her oge 44px dokunma alani.
export const PaywallLegalRow = React.memo(function PaywallLegalRow({ onRestore, disabled }) {
  const C = useC();
  const navigation = useNavigation();
  const text = [TYPOGRAPHY.micro, { color: C.text3 }];

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onRestore} disabled={disabled} style={styles.hit} accessibilityRole="button">
        <Text style={[text, styles.underline]}>{PAYWALL_LEGAL.restore}</Text>
      </Pressable>
      <View style={styles.links}>
        <Pressable onPress={() => navigation.navigate(SCREENS.PRIVACY)} style={styles.hit} accessibilityRole="link">
          <Text style={[text, styles.underline]}>{PAYWALL_LEGAL.privacy}</Text>
        </Pressable>
        <Text style={text}>·</Text>
        <Pressable onPress={() => navigation.navigate(SCREENS.TERMS)} style={styles.hit} accessibilityRole="link">
          <Text style={[text, styles.underline]}>{PAYWALL_LEGAL.terms}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: STEP.s1 },
  links: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  hit: { minHeight: CONTROL.tapMin, justifyContent: "center", paddingHorizontal: STEP.s1 / 2 },
  underline: { textDecorationLine: "underline" },
});
