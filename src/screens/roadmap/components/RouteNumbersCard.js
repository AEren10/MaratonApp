import { StyleSheet, Text, View } from "react-native";

import { Card, Skeleton } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { formatNumber } from "../../../lib/format";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Yikici aksiyon ekranlarinin sayi karti (DONDURULAN / KALIR): ne olacagini
// sayiyla soyler. Okunamayan sayi listeden duser, sifir yazilmaz.
export function RouteNumbersCard({ label, loading, stats }) {
  const C = useC();
  if (!loading && !stats.length) return null;
  return (
    <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{label}</Text>
      {loading ? (
        <Skeleton height={42} style={s.body} />
      ) : (
        <View style={[s.row, s.body]}>
          {stats.map((item) => (
            <View key={item.key}>
              <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{formatNumber(item.value)}</Text>
              <Text style={[TYPOGRAPHY.micro, s.unit, { color: C.text3 }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  body: { marginTop: STEP.s2 + STEP.s1 / 2 },
  row: { flexDirection: "row", gap: STEP.s3 },
  unit: { marginTop: STEP.s1 / 2 },
});
