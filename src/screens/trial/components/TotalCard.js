import { useMemo } from "react";
import { View, Text } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Button } from "../../../components/design";

const makeStyles = (C) => ({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    ...TYPOGRAPHY.bodySemiBold,
    color: C.sec,
  },
  value: {
    ...TYPOGRAPHY.statSmall,
    color: C.accent,
  },
  errorWrap: { marginTop: SPACING.md, gap: SPACING.xs, borderTopWidth: 1, borderColor: C.border, paddingTop: SPACING.md },
  errorTitle: { ...TYPOGRAPHY.bodySemiBold, color: C.danger },
  errorBody: { ...TYPOGRAPHY.caption, color: C.sec },
});

export function TotalCard({ totalNet, overflow, onFixOverflow, normalizedNet, multiplierLabel }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const showNormalized = normalizedNet != null && Math.abs(Number(normalizedNet) - Number(totalNet)) >= 0.01;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Toplam Net</Text>
        <Text style={styles.value}>{totalNet}</Text>
      </View>
      {showNormalized ? (
        <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: SPACING.xs }]}>
          normalize net {Number(normalizedNet).toFixed(2)}{multiplierLabel ? ` · ${multiplierLabel}` : ""}
        </Text>
      ) : null}
      {overflow ? (
        <View style={styles.errorWrap} accessible accessibilityLabel={`Hesap hatası: toplam ${overflow.total}, soru sayısı ${overflow.max}`}>
          <Text style={styles.errorTitle}>Toplam {overflow.total}, soru sayısı {overflow.max}</Text>
          <Text style={styles.errorBody}>
            Doğru, yanlış ve boş toplamı soru sayısını geçemez. Boş sayısı {overflow.excess} fazla görünüyor.
          </Text>
          <Button size="sm" variant="outline" onPress={() => onFixOverflow?.(overflow)}>
            {`Boşu ${overflow.excess} düzelt`}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
