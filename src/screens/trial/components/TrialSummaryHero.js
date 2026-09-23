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
        {`${typeLabel} · KAYDEDİLDİ`.toLocaleUpperCase("tr-TR")}
      </Text>
      <View style={styles.netRow}>
        <Text style={[TYPOGRAPHY.statHeroTight, styles.net, { color: C.text }]}>{formatNumber(net, 2)}</Text>
        {delta != null ? (
          <View style={[styles.delta, { backgroundColor: C.surface, borderColor: C.line }]}>
            {delta !== 0 ? <Icon name={delta > 0 ? "arrowUp" : "arrowDown"} size={11} color={tone} sw={1.7} /> : null}
            <Text style={[TYPOGRAPHY.topicName, styles.deltaText, { color: tone }]}>{formatDelta(delta, 2)}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.metaRow}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>TOPLAM NET</Text>
        {prevNet != null ? (
          <Text style={[TYPOGRAPHY.meta, styles.prevText, { color: C.text3 }]}>
            {`önceki ${formatNumber(prevNet, 2)} \u2192 yeni ${formatNumber(net, 2)}`}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, alignItems: "center" },
  kicker: { alignSelf: "stretch", fontFamily: "Archivo_700", letterSpacing: 2.76 },
  netRow: { width: "100%", alignItems: "center", justifyContent: "center", marginTop: STEP.s2 + 8, minHeight: 116 },
  net: { textAlign: "center" },
  delta: {
    position: "absolute",
    right: 0,
    bottom: STEP.s1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 32,
    paddingHorizontal: STEP.s1,
    borderRadius: 16,
    borderWidth: 1,
  },
  deltaText: { fontFamily: "Archivo_600", fontVariant: ["tabular-nums"] },
  metaRow: { alignItems: "center", gap: STEP.s1 - 2, marginTop: STEP.s1 },
  prevText: { textAlign: "center", fontVariant: ["tabular-nums"] },
});
