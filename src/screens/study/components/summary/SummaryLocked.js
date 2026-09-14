import { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";

import { Button, Skeleton } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { PAYWALL_CONTEXTS } from "../../../../constants/paywallContexts";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";

const COPY = PAYWALL_CONTEXTS.monthly_report;

// Paywall · Rapor: rapor govdesi yerine iskelet satirlar; paywall bir kez
// kendiliginden acilir, kapatilirsa "Raporu aç" ile yeniden acilir.
export function SummaryLocked({ onUnlock }) {
  const C = useC();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    onUnlock?.();
  }, [onUnlock]);

  return (
    <View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{COPY.eyebrow}</Text>
      <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginTop: STEP.s1 }]}>{COPY.title}</Text>
      <View style={styles.rows}>
        {[0, 1, 2].map((i) => <Skeleton key={i} height={56} radius={SHAPE.panel} />)}
      </View>
      <Button variant="primary" size="lg" fullWidth onPress={onUnlock} style={styles.cta}>
        {COPY.primary}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  rows: { gap: STEP.s1, marginTop: STEP.s3 },
  cta: { marginTop: STEP.s4 },
});
