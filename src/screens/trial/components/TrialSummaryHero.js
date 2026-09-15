import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatDelta, formatNumber } from "../../../lib/format";

export function TrialSummaryHero({ typeLabel, net, prevNet, delta }) {
  const C = useC();
  const tone = delta > 0 ? C.up : delta < 0 ? C.down : C.text3;
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, styles.kicker, { color: C.text3 }]}>
        {${typeLabel} · KAYDEDİLDİ.toLocaleUpperCase("tr-TR")}
      </Text>
      <View style={styles.netRow}>
        <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]}>{formatNumber(net, 2)}</Text>
        {delta != null ? (
          <View style={styles.delta}>
            {delta !== 0 ? <Icon name={delta > 0 ? "arrowUp" : "arrowDown"} size={11} color={tone} sw={1.7} /> : null}
            <Text style={[TYPOGRAPHY.topicName, styles.deltaText, { color: tone }]}>{formatDelta(delta, 2)}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.metaRow}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>TOPLAM NET</Text>
        {prevNet != null ? (
          <Text style={[TYPOGRAPHY.meta, styles.tabular, { color: C.text3 }]}>
            {önceki ${formatNumber(prevNet, 2)} \u2192 yeni ${formatNumber(net, 2)}}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  kicker: { fontFamily: "Archivo_700", letterSpacing: 2.76 },
  netRow: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2, marginTop: STEP.s2 + 4 },
  delta: { flexDirection: "row", alignItems: "center", gap: 5, paddingBottom: STEP.s1 + 1 },
  deltaText: { fontFamily: "Archivo_600", fontVariant: ["tabular-nums"] },
  metaRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 + 1, marginTop: STEP.s2, flexWrap: "wrap" },
  tabular: { fontVariant: ["tabular-nums"] },
});
