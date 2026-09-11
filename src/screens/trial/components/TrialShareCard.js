import { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatBlock } from "../../../components/design/StatBlock";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

function SubjectBar({ name, net, bestNet, color }) {
  const C = useC();
  const pct = bestNet > 0 ? Math.max(0, net / bestNet) : 0;
  return (
    <View style={styles.barRow}>
      <View style={styles.barHead}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>{name}</Text>
        <Text style={[TYPOGRAPHY.tableValue, { color }]}>{net.toFixed(1)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: C.elev }]}>
        <View style={[styles.fill, { width: `${Math.min(100, pct * 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export const TrialShareCard = forwardRef(function TrialShareCard(
  { typeName, trialTitle, net, dateStr, bars, trend, userName },
  ref,
) {
  const C = useC();
  const bestNet = Math.max(...bars.map((b) => Math.abs(b.net)), 1);
  const trendColor = trend > 0 ? C.up : trend < 0 ? C.down : C.text3;

  return (
    <View ref={ref} collapsable={false} style={[styles.card, { backgroundColor: C.void, borderColor: C.elev }]}>
      <LinearGradient colors={[`${C.accent}18`, "transparent"]} style={styles.glow} />

      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright, letterSpacing: 2 }]}>MARATON</Text>
        <View style={[styles.typeBadge, { backgroundColor: C.brandTint, borderColor: C.accent }]}>
          <Text style={[TYPOGRAPHY.meta, { color: C.accentBright }]}>{typeName}</Text>
        </View>
      </View>

      {trialTitle ? (
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, marginTop: STEP.s1 }]}>{trialTitle}</Text>
      ) : null}

      <View style={styles.netSection}>
        <StatBlock value={net.toFixed(1)} unit="TOPLAM NET" size="hero" color={C.accentBright} align="center" />
        {trend !== 0 && (
          <View style={[styles.trendPill, { backgroundColor: `${trendColor}18` }]}>
            <Text style={[TYPOGRAPHY.captionMedium, { color: trendColor }]}>
              {trend > 0 ? "Yükseliyor" : "Düşüyor"} · {Math.abs(trend).toFixed(1)} net
            </Text>
          </View>
        )}
      </View>

      <View style={styles.barsWrap}>
        {bars.slice(0, 8).map((b) => (
          <SubjectBar key={b.key} name={b.name} net={b.net} bestNet={bestNet} color={b.c} />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>{userName}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{dateStr}</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: C.border }]} />
      <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center" }]}>
        maraton.app · sınav hazırlık asistanın
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { width: 340, borderRadius: SHAPE.card, borderWidth: 1, padding: STEP.s4, overflow: "hidden" },
  glow: { position: "absolute", top: 0, left: 0, right: 0, height: 120 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  typeBadge: { paddingHorizontal: STEP.s2, paddingVertical: 4, borderRadius: SHAPE.chip, borderWidth: 1 },
  netSection: { alignItems: "center", marginVertical: STEP.s4 },
  trendPill: { paddingHorizontal: STEP.s3, paddingVertical: STEP.s1, borderRadius: SHAPE.chip, marginTop: STEP.s2 },
  barsWrap: { gap: STEP.s2 },
  barRow: { gap: 3 },
  barHead: { flexDirection: "row", justifyContent: "space-between" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: STEP.s4 },
  divider: { height: 1, marginTop: STEP.s3, marginBottom: STEP.s1 },
});
