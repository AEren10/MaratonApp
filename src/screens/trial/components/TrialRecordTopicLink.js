import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { Card, Icon, SectionLabel } from "../../../components/design";
import { Press } from "../../../components/design/Press";

export const TrialRecordTopicLink = React.memo(function TrialRecordTopicLink({ onPress, C }) {
  return (
    <View style={styles.wrap}>
      <SectionLabel>KONU KIRILIMI</SectionLabel>
      <Press haptic="none" onPress={onPress} accessibilityRole="button" accessibilityLabel="Ders bazında analiz">
        <Card tone="surface" style={styles.card}>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>Ders bazında analiz</Text>
          <Icon name="chevR" size={14} color={C.text3} />
        </Card>
      </Press>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
