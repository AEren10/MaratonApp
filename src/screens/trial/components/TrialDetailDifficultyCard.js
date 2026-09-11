import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Tasarımın birebir kopyası yalnızca "zor" durumu için var — diğer
// zorluk seviyeleri için uydurma metin yazılmadı (bkz useTrialDetail).
export function TrialDetailDifficultyCard({ C, difficultyLabel }) {
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(420)} style={styles.wrap}>
      <Card style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ZORLUK</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text2, marginTop: STEP.s1 }]}>
            Bu deneme ortalamanın üstünde zordu. Aynı neti kolay bir denemede almaktan daha değerli.
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: C.brandTint, borderColor: C.bandEdge }]}>
          <Text style={[TYPOGRAPHY.label, { color: C.accentBright, marginBottom: 0 }]}>
            {difficultyLabel?.toUpperCase()}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: STEP.s3, marginTop: STEP.s4 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  badge: {
    height: 32, paddingHorizontal: 14, borderRadius: 6,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
});
