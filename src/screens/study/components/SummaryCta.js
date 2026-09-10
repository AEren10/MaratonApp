import { View, StyleSheet } from "react-native";

import { Button } from "../../../components/design";
import { GUTTER, STEP } from "../../../themes/tokens";

export function SummaryCta({ ctaLabel, shareLabel, onPrimary, onShare }) {
  return (
    <View style={styles.wrap}>
      <Button variant="primary" size="lg" fullWidth onPress={onPrimary}>
        {ctaLabel}
      </Button>
      <Button variant="outline" size="lg" fullWidth onPress={onShare} style={styles.secondary}>
        {shareLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s5, paddingBottom: STEP.s4 },
  secondary: { marginTop: STEP.s2 },
});
