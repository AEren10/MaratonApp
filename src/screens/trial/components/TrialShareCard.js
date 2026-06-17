import { forwardRef, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

function SubjectBar({ name, net, max, color, bestNet }) {
  const C = useC();
  const pct = max > 0 ? Math.max(0, net / bestNet) : 0;
  return (
    <View style={{ gap: 3 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: C.sec }}>{name}</Text>
        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 12, color }}>{net.toFixed(1)}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: C.surface2, overflow: "hidden" }}>
        <View style={{ width: `${Math.min(100, pct * 100)}%`, height: 6, borderRadius: 3, backgroundColor: color }} />
      </View>
    </View>
  );
}

export const TrialShareCard = forwardRef(function TrialShareCard(
  { name, typeName, trialTitle, net, dateStr, bars, trend, userName },
  ref,
) {
  const C = useC();
  const bestNet = Math.max(...bars.map((b) => Math.abs(b.net)), 1);
  const trendColor = trend > 0 ? "#34D399" : trend < 0 ? "#F87171" : C.muted;

  return (
    <View ref={ref} collapsable={false} style={[st.card, { backgroundColor: C.bg }]}>
      <LinearGradient
        colors={[C.amber + "18", "transparent"]}
        style={st.glow}
      />

      <View style={st.header}>
        <Text style={st.brand}>MARATON</Text>
        <View style={[st.typeBadge, { backgroundColor: C.amber + "18" }]}>
          <Text style={[st.typeText, { color: C.amber }]}>{typeName}</Text>
        </View>
      </View>

      {trialTitle ? (
        <Text style={[st.trialTitle, { color: C.sec }]}>{trialTitle}</Text>
      ) : null}

      <View style={st.netSection}>
        <Text style={[st.netNum, { color: C.text }]}>{net.toFixed(1)}</Text>
        <Text style={[st.netLabel, { color: C.amber }]}>TOPLAM NET</Text>
        {trend !== 0 && (
          <View style={[st.trendPill, { backgroundColor: trendColor + "18" }]}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: trendColor }}>
              {trend > 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)} net
            </Text>
          </View>
        )}
      </View>

      <View style={st.barsWrap}>
        {bars.slice(0, 8).map((b) => (
          <SubjectBar key={b.key} name={b.name} net={b.net} max={b.max} color={b.c} bestNet={bestNet} />
        ))}
      </View>

      <View style={st.footer}>
        <Text style={[st.footerUser, { color: C.sec }]}>{userName}</Text>
        <Text style={[st.footerDate, { color: C.muted }]}>{dateStr}</Text>
      </View>

      <View style={[st.divider, { backgroundColor: C.border }]} />
      <Text style={[st.watermark, { color: C.muted }]}>maraton.app · YKS hazırlık asistanın</Text>
    </View>
  );
});

const st = StyleSheet.create({
  card: {
    width: 340, borderRadius: 24, padding: 24, overflow: "hidden",
  },
  glow: {
    position: "absolute", top: 0, left: 0, right: 0, height: 120,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  brand: {
    fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color: "#F5A623", letterSpacing: 1.5,
  },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  typeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.5 },
  trialTitle: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 6 },
  netSection: { alignItems: "center", marginVertical: 24 },
  netNum: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 72, letterSpacing: -3, lineHeight: 76 },
  netLabel: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 2, marginTop: -2 },
  trendPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, marginTop: 10 },
  barsWrap: { gap: 10 },
  footer: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20,
  },
  footerUser: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  footerDate: { fontFamily: "Inter_400Regular", fontSize: 12 },
  divider: { height: 1, marginTop: 14, marginBottom: 10 },
  watermark: { fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "center" },
});
