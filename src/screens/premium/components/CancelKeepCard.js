import { View, Text, StyleSheet } from "react-native";

import { Card, Skeleton } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { formatNumber } from "../../../lib/format";

// Tasarim: "KALIR" + ucretsiz plana dondugunde elinde kalan sayilar.
// Okunamayan sayi listeden dusuyor (bkz. useSubscriptionKeepStats).
export function CancelKeepCard({ loading, stats }) {
  const C = useC();
  if (!loading && !stats.length) return null;

  return (
    <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>KALIR</Text>
      {loading ? (
        <Skeleton height={42} style={{ marginTop: STEP.s2 + 4 }} />
      ) : (
        <View style={styles.row}>
          {stats.map((item) => (
            <View key={item.key}>
              <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]} allowFontScaling={false}>
                {formatNumber(item.value)}
              </Text>
              <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 5 }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 22, marginTop: STEP.s2 + 4 },
});
