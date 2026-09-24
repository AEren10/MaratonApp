import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Tasarımın birebir kopyası yalnızca "zor" durumu için var - diğer
// zorluk seviyeleri için uydurma metin yazılmadı (bkz useTrialDetail).
export function TrialDetailDifficultyCard({ C, difficultyLabel }) {
  return (
    <Animated.View style={styles.wrap}>
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
  wrap: { paddingHorizontal: STEP.s3, marginTop: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2 },
  badge: { paddingHorizontal: STEP.s2, height: 26, borderRadius: 6, borderWidth: 1, justifyContent: "center" },
});
