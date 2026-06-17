import { forwardRef, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const makeStyles = (C) => StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: C.bg,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    overflow: "hidden",
  },
  accent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: C.amber,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 18,
    color: C.amber,
    letterSpacing: 1,
  },
  type: { ...TYPOGRAPHY.captionMedium, color: C.sec },
  owner: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: SPACING.xs },
  netWrap: { alignItems: "center", marginVertical: SPACING.xl },
  netValue: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 64,
    color: C.text,
    letterSpacing: -2,
  },
  netLabel: { ...TYPOGRAPHY.label, color: C.amber, marginTop: -SPACING.xs },
  barsWrap: { gap: SPACING.sm },
  barRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  barName: { ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 },
  barNet: { ...TYPOGRAPHY.bodySemiBold },
  footer: {
    ...TYPOGRAPHY.micro,
    color: C.muted,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
});

// Madde 6: Instagram story için paylaşılabilir deneme karnesi (watermark'lı).
// captureRef ile görüntüye çevrilmek üzere ref'lenir. Ekran dışında render edilir.
export const TrialReportCard = forwardRef(function TrialReportCard(
  { name, typeLabel, net, dateStr, bars },
  ref
) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View ref={ref} collapsable={false} style={s.card}>
      <View style={s.accent} />

      <View style={s.headerRow}>
        <Text style={s.brand}>MARATON</Text>
        <Text style={s.type}>{typeLabel}</Text>
      </View>

      <Text style={s.owner}>{name} · {dateStr}</Text>

      <View style={s.netWrap}>
        <Text style={s.netValue}>{net.toFixed(1)}</Text>
        <Text style={s.netLabel}>NET</Text>
      </View>

      <View style={s.barsWrap}>
        {bars.slice(0, 6).map((b) => (
          <View key={b.key} style={s.barRow}>
            <View style={[s.dot, { backgroundColor: b.c }]} />
            <Text style={s.barName} numberOfLines={1}>{b.name}</Text>
            <Text style={[s.barNet, { color: b.c }]}>{b.net.toFixed(1)}</Text>
          </View>
        ))}
      </View>

      <Text style={s.footer}>maraton.app · YKS hazırlık asistanın</Text>
    </View>
  );
});

