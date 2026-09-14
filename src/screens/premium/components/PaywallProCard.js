import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Button, Card } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { PAYWALL_MOMENT as M } from "../../../constants/paywallMoment";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { PaywallBullet } from "./PaywallBullet";
import { PaywallPlanPicker } from "./PaywallPlanPicker";

// "MARATON PRO" karti: marka tonu + 1px kenarlik (golge yok).
export const PaywallProCard = React.memo(function PaywallProCard({ purchase }) {
  const C = useC();

  return (
    <Card tone="tint" radius="sheet" style={[styles.card, { borderColor: C.border }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>{M.proLabel}</Text>
      <Text style={[TYPOGRAPHY.subheading, styles.title, { color: C.text }]}>{M.proTitle}</Text>
      <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>{M.proBody}</Text>

      <View style={styles.list}>
        {M.proChecks.map((line) => <PaywallBullet key={line} text={line} tone="check" />)}
      </View>

      <PaywallPlanPicker
        plans={purchase.displayPlans}
        selected={purchase.selectedPlan}
        onSelect={purchase.setSelectedPlan}
        style={styles.plans}
      />

      <Button
        onPress={purchase.handlePurchase}
        loading={purchase.purchasing}
        size="lg"
        fullWidth
        style={styles.cta}
      >
        {M.cta}
      </Button>
      <Text style={[TYPOGRAPHY.micro, styles.note, { color: C.text3 }]}>{M.ctaNote}</Text>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: STEP.s3 },
  title: { marginTop: STEP.s2, maxWidth: 280 },
  body: { marginTop: STEP.s2, maxWidth: 280 },
  list: { marginTop: STEP.s3, gap: STEP.s2 },
  plans: { marginTop: STEP.s3 },
  cta: { marginTop: STEP.s3 },
  note: { marginTop: STEP.s2, textAlign: "center" },
});
