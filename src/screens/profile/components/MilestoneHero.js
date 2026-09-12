import { View, Text, StyleSheet } from "react-native";

import { Card, StatBlock } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: "Kilometre Tasi" hero'su. Kutu 132x132 r12, zemin void, 1px kenarlik
// (tasarimin blur'lu accent parlamasi ALINMADI — derinlik golge/parlama ile
// degil yuzey tonu + kenarlikla kurulur).
export function MilestoneHero({ done }) {
  const C = useC();

  return (
    <View style={styles.wrap}>
      <Card tone="void" radius="iconBox" padded={false} style={styles.tile}>
        <StatBlock value={done} size="large" align="center" />
      </Card>

      <Text style={[TYPOGRAPHY.label, styles.eyebrow, { color: C.accentBright }]}>
        {done}. DURAK
      </Text>

      <Text style={[TYPOGRAPHY.heading, styles.headline, { color: C.text }]}>
        Rotanın {done} durağını geçtin.
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
});
