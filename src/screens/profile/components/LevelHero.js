import { View, Text, StyleSheet, useWindowDimensions } from "react-native";

import { StatBlock } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { LevelGauge } from "./LevelGauge";

// Tasarimda halka 286px (390px cerceve icinde). Dar ekranda tasmasin diye
// ekran genisligine sikistiriliyor, orani korunuyor.
const RING = 286;

export function LevelHero({ badge, heroXP, targetLabel, remainingLabel, progress }) {
  const C = useC();
  const { width } = useWindowDimensions();
  const size = Math.min(RING, width - GUTTER * 2);

  return (
    <View style={styles.wrap}>
      <LevelGauge size={size} progress={progress}>
        <View style={styles.center}>
          <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{badge}</Text>
          <StatBlock value={heroXP} size="page" align="center" style={styles.stat} />
          <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: 6 }]}>
            {targetLabel}
          </Text>
        </View>
      </LevelGauge>

      {remainingLabel ? (
        <Text style={[TYPOGRAPHY.caption, styles.remaining, { color: C.text2 }]}>
          {remainingLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: STEP.s2, position: "relative" },
  center: { alignItems: "center", paddingHorizontal: STEP.s3 },
  stat: { marginTop: STEP.s1 },
  // Tasarimda bu satir halkanin alt acikliginin icinde duruyor.
  remaining: { position: "absolute", bottom: STEP.s2 + 2 },
});
