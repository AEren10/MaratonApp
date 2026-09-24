import { Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { useC } from "../../../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

export function RecordIntro({ children }) {
  const C = useC();
  return (
    <Animated.View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.caption, styles.text, { color: C.text2 }]}>{children}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 2 },
  text: { maxWidth: 300, lineHeight: 21 },
});
