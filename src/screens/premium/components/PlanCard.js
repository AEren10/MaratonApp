import { memo, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

function PlanCard({ plan, selected, onSelect }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C, selected), [C, selected]);

  return (
    <Pressable style={s.card} onPress={onSelect}>
      {plan.popular && (
        <View style={s.badge}>
          <Text style={s.badgeText}>En popüler</Text>
        </View>
      )}
      <View style={s.row}>
        <View style={s.radio}>
          {selected && <View style={s.radioDot} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.planName}>
            {plan.id === "yearly" ? "Yıllık Plan" : "Aylık Plan"}
          </Text>
          {plan.savings && (
            <Text style={s.savings}>{plan.savings} tasarruf</Text>
          )}
        </View>
        <View style={s.priceCol}>
          <Text style={s.price}>{plan.price}</Text>
          <Text style={s.period}>/ {plan.period}</Text>
          {plan.monthlyEquiv && (
            <Text style={s.equiv}>{plan.monthlyEquiv}/ay</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default memo(PlanCard);

function makeStyles(C, selected) {
  return StyleSheet.create({
    card: {
      borderWidth: selected ? 2 : 1,
      borderColor: selected ? C.accent : C.border,
      borderRadius: RADIUS.xl,
      backgroundColor: selected ? C.accent + "0A" : C.surface,
      padding: SPACING.lg,
      position: "relative",
      overflow: "visible",
    },
    badge: {
      position: "absolute", top: -11, alignSelf: "center",
      backgroundColor: C.accent, borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.md, paddingVertical: 3,
    },
    badgeText: { ...TYPOGRAPHY.micro, color: "#FFFFFF", letterSpacing: 0.4 },
    row: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
    radio: {
      width: 22, height: 22, borderRadius: 11,
      borderWidth: 2, borderColor: selected ? C.accent : C.muted,
      alignItems: "center", justifyContent: "center",
    },
    radioDot: {
      width: 12, height: 12, borderRadius: 6,
      backgroundColor: C.accent,
    },
    planName: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    savings: { ...TYPOGRAPHY.micro, color: C.green, marginTop: 2 },
    priceCol: { alignItems: "flex-end" },
    price: { ...TYPOGRAPHY.subheading, color: C.text },
    period: { ...TYPOGRAPHY.caption, color: C.sec },
    equiv: { ...TYPOGRAPHY.micro, color: C.muted, marginTop: 2 },
  });
}
