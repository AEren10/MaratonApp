import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Paywall maddesi. "check": Pro ile acilan (kizil kutu + tik).
// "free" / "freeMuted": ucretsizde acik kalan (yesil kare nokta).
export const PaywallBullet = React.memo(function PaywallBullet({ text, tone = "check" }) {
  const C = useC();

  if (tone === "check") {
    return (
      <View style={styles.row}>
        <View style={[styles.box, { backgroundColor: C.accent }]}>
          <Icon name="check" size={11} color={C.accentInk} sw={2.6} />
        </View>
        <Text style={[TYPOGRAPHY.captionMedium, styles.text, { color: C.text2 }]}>{text}</Text>
      </View>
    );
  }

  const muted = tone === "freeMuted";
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: C.up }]} />
      <Text style={[muted ? TYPOGRAPHY.meta : TYPOGRAPHY.caption, styles.text, { color: muted ? C.text3 : C.text2 }]}>
        {text}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  box: { width: 18, height: 18, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  dot: { width: 5, height: 5, borderRadius: 1 },
  text: { flex: 1 },
});
