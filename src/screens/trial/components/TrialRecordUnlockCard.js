import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { Card, Button } from "../../../components/design";

export const TrialRecordUnlockCard = React.memo(function TrialRecordUnlockCard({ lockedCount, onPress, C }) {
  if (lockedCount <= 0) return null;

  return (
    <Card tone="surface" style={styles.card}>
      <Text style={[TYPOGRAPHY.caption, { color: C.text3, textAlign: "center" }]}>
        Son 8 hafta açık. {lockedCount} daha eski deneme kayıtlı.
      </Text>
      <Button
        variant="outline"
        size="lg"
        fullWidth
        icon="lock"
        onPress={onPress}
        style={{ marginTop: STEP.s2, borderColor: C.accent }}
        accessibilityLabel="Tüm geçmişi aç"
      >
        Tüm geçmişi aç
      </Button>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginTop: STEP.s3 },
});
