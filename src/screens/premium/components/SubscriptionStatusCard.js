import { View, Text, Pressable, StyleSheet } from "react-native";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: brand-tint zeminli kart, "PREMIUM AKTIF" + donem + yenilenme
// satiri + "Aboneligi yonet" cipi.
//
// Tasarimdaki "₺1.068/yıl" satiri CIZILMIYOR: tutar ne RevenueCat
// customerInfo'da ne veritabaninda var. Rakami uydurmak yerine satir
// dusuyor. Yenilenme satiri da yalniz tarih gercekten biliniyorsa cikiyor.
export function SubscriptionStatusCard({ periodLabel, renewsLine, onManage }) {
  const C = useC();

  return (
    <Card tone="tint" radius="sheet" style={[styles.card, { borderColor: C.border }]}>
      <View style={styles.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>PREMIUM AKTİF</Text>
        {periodLabel ? (
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{periodLabel}</Text>
        ) : null}
      </View>

      {renewsLine ? (
        <Text style={[TYPOGRAPHY.meta, { color: C.text2, marginTop: STEP.s2 }]}>
          {renewsLine}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={onManage}
          hitSlop={{ top: 6, bottom: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Aboneliği yönet, mağazada açılır"
          style={({ pressed }) => [
            styles.chip,
            { borderColor: C.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Aboneliği yönet</Text>
        </Pressable>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>mağazada açılır</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // tone="tint" kenarlik cizmiyor; tasarimin tint karti 1px border tasiyor.
  card: { padding: STEP.s3, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  actions: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: STEP.s2 + 4 },
  chip: {
    height: CONTROL.chip - 4,
    paddingHorizontal: 15,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
