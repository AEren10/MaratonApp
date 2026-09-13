import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatDelta, formatNet } from "../../../lib/format";

// TOPLAM NET (Deneme Gir 2/3). Onceki deneme yoksa sag taraf gosterilmez.
export function TotalCard({ totalNet, previousNet, styles: shared }) {
  const C = useC();
  const net = Number(totalNet) || 0;
  const hasPrevious = previousNet != null && Number.isFinite(Number(previousNet));
  const delta = hasPrevious ? net - Number(previousNet) : 0;
  const tone = delta > 0 ? C.up : delta < 0 ? C.down : C.text3;
  return (
    <View style={[shared.panel, styles.card]}>
      <View>
        <Text style={shared.label}>TOPLAM NET</Text>
        <Text style={[TYPOGRAPHY.statPair, styles.value, { color: C.text }]}>{formatNet(net)}</Text>
      </View>
      {hasPrevious ? (
        <View style={styles.side} accessible accessibilityLabel={`Son denemeye göre ${formatDelta(delta, 2)} net`}>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>son denemeye göre</Text>
          <View style={styles.delta}>
            {delta !== 0 ? <Icon name={delta > 0 ? "arrowUp" : "arrowDown"} size={10} color={tone} sw={1.7} /> : null}
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: tone, fontVariant: ["tabular-nums"] }]}>
              {formatDelta(delta, 2)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  value: { marginTop: STEP.s2 - 2, lineHeight: 40 },
  side: { alignItems: "flex-end" },
  delta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
});
