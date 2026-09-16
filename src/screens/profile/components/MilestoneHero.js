import { View, Text, StyleSheet } from "react-native";

import { Card, StatBlock } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function MilestoneHero({ done }) {
  const C = useC();

  return (
    <View style={styles.wrap}>
      <Card tone="void" radius="iconBox" padded={false} style={styles.tile}>
        <StatBlock value={done} size="large" align="center" />
      </Card>

      <Text style={[TYPOGRAPHY.label, styles.eyebrow, { color: C.accentBright }]}>
        ONUNCU DURAK
      </Text>

      <Text style={[TYPOGRAPHY.heading, styles.headline, { color: C.text }]}>
        Rotanın onda birini geçtin.
      </Text>
      
      <Text style={[TYPOGRAPHY.bodyMedium, styles.subtitle, { color: C.text3 }]}>
        Onuncu durakta olan öğrencilerin çoğu sınava kadar rotada kalıyor. İyi gidiyorsun.
      </Text>
    </View>
  );
}

const TILE = 132;

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  tile: {
    width: TILE,
    height: TILE,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: { marginTop: STEP.s3, letterSpacing: 2.8 },
  headline: {
    marginTop: STEP.s2,
    maxWidth: 270,
    textAlign: "center",
  },
  subtitle: {
    marginTop: STEP.s2,
    maxWidth: 270,
    textAlign: "center",
  }
});
