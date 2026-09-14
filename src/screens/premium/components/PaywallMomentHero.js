import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { formatNet } from "../../../lib/format";
import { PAYWALL_MOMENT as M } from "../../../constants/paywallMoment";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";
import { PaywallMomentLine } from "./PaywallMomentLine";

// "ROTANIN TAMAMI · KILITLI" + son net + fark + hat. Kayit yoksa yalniz etiket.
export const PaywallMomentHero = React.memo(function PaywallMomentHero({ hero }) {
  const C = useC();
  const delta = hero?.delta;
  const up = delta != null && delta > 0;
  const deltaColor = up ? C.up : C.down;

  return (
    <View>
      <View style={styles.pad}>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{M.lockedLabel}</Text>
        {hero ? (
          <View style={styles.row}>
            <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]}>{formatNet(hero.net)}</Text>
            {delta != null && delta !== 0 ? (
              <View style={styles.delta}>
                <Icon name={up ? "trendUp" : "trendDown"} size={14} color={deltaColor} sw={1.8} />
                <Text style={[TYPOGRAPHY.bodySemiBold, styles.tabular, { color: deltaColor }]}>
                  {`${up ? "+" : "−"}${formatNet(Math.abs(delta))}`}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      {hero ? (
        <View style={styles.line}>
          <PaywallMomentLine points={hero.points} />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2, marginTop: STEP.s2 },
  delta: { flexDirection: "row", alignItems: "center", gap: 5, paddingBottom: STEP.s1 },
  tabular: { fontVariant: ["tabular-nums"] },
  line: { marginTop: STEP.s3 },
});
