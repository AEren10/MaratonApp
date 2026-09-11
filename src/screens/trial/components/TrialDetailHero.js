import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, StatBlock, Chip } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export function TrialDetailHero({ C, latest, dateStr, typeMeta, rawNet, trend, prev }) {
  const trendColor = trend > 0 ? C.up || C.green : trend < 0 ? C.down || C.red : C.text3;

  return (
    <Animated.View entering={FadeInDown.duration(420)} style={styles.wrap}>
      <View style={styles.metaRow}>
        {typeMeta ? (
          <Chip color={C.accentBright} bg={C.brandTint}>
            {typeMeta.label.toUpperCase()}
          </Chip>
        ) : null}
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{dateStr}</Text>
      </View>

      <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginTop: STEP.s2 }]} numberOfLines={2}>
        {latest.name || typeMeta?.label || "Deneme"}
      </Text>

      <View style={styles.netRow}>
        <StatBlock value={rawNet.toFixed(2).replace(".", ",")} size="large" />
        {prev ? (
          <View style={styles.trend}>
            <Icon name={trend >= 0 ? "trendUp" : "trendDown"} size={12} color={trendColor} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: trendColor }]}>
              {trend > 0 ? "+" : ""}{trend.toFixed(2).replace(".", ",")}
            </Text>
          </View>
        ) : null}
        {prev ? (
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>önceki denemeye göre</Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: STEP.s3, marginTop: STEP.s2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  netRow: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2, marginTop: STEP.s3, flexWrap: "wrap" },
  trend: { flexDirection: "row", alignItems: "center", gap: 4, paddingBottom: 6 },
});
