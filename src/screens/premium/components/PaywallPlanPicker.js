import React from "react";
import { View, StyleSheet } from "react-native";

import { usePremiumPlanRows } from "../../../hooks/usePremiumPlanRows";
import { STEP } from "../../../themes/tokens";
import { ProPlanRow } from "./ProPlanRow";

// Magaza kurali: satin alma dugmesinden once fiyat ve donem gorunur.
// Fiyat metni usePaywallPurchase'ten (magaza paketi varsa onun fiyati).
export const PaywallPlanPicker = React.memo(function PaywallPlanPicker({ plans, selected, onSelect, style }) {
  const rows = usePremiumPlanRows(plans);
  if (!rows.length) return null;

  return (
    <View style={[styles.wrap, style]}>
      {rows.map((plan) => (
        <ProPlanRow key={plan.id} plan={plan} selected={selected === plan.id} onSelect={onSelect} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({ wrap: { gap: STEP.s1 } });
