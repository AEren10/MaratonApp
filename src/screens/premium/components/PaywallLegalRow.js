import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { PAYWALL_LEGAL } from "../../../constants/paywallMoment";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Geri yukleme + yasal baglantilar. Her oge 44px dokunma alani.
export const PaywallLegalRow = React.memo(function PaywallLegalRow({ onRestore, disabled }) {
  const C = useC();
  const navigation = useNavigation();
  const text = [TYPOGRAPHY.micro, { color: C.text3 }];

  return (
    <View style={styles.wrap}>
      <Press haptic="none" onPress={onRestore} disabled={disabled} style={styles.hit} accessibilityRole="button">
        <Text style={[text, styles.underline]}>{PAYWALL_LEGAL.restore}</Text>
      </Press>
      <View style={styles.links}>
        <Press haptic="none" onPress={() => navigation.navigate(SCREENS.PRIVACY)} style={styles.hit} accessibilityRole="link">
          <Text style={[text, styles.underline]}>{PAYWALL_LEGAL.privacy}</Text>
        </Press>
        <Text style={text}>·</Text>
        <Press haptic="none" onPress={() => navigation.navigate(SCREENS.TERMS)} style={styles.hit} accessibilityRole="link">
          <Text style={[text, styles.underline]}>{PAYWALL_LEGAL.terms}</Text>
        </Press>
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
