import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { STEP } from "../../../themes/tokens";

export function TrialDetailActions({ onAddWrong, onCompare }) {
  return (
    <Animated.View entering={FadeInDown.delay(320).duration(420)} style={styles.wrap}>
      <Button variant="primary" size="lg" fullWidth onPress={onAddWrong}>
        Yanlışları deftere ekle
      </Button>
      <View style={{ height: STEP.s1 }} />
      <Button variant="outline" size="md" fullWidth onPress={onCompare}>
        Başka denemeyle karşılaştır
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: STEP.s3, marginTop: STEP.s4, paddingBottom: STEP.s5 },
});
