import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

const LABEL = { high: "yüksek", medium: "orta", low: "düşük" };

function riskCopy(risks = []) {
  const top = risks[0];
  if (!top) return "Risk görünmüyor";
  if (top.code === "route_overflow") return "Rota sıkışık";
  if (top.code === "capacity_low_confidence") return "Tempo verisi az";
  if (top.code === "topic_signal_sparse") return "Konu verisi seyrek";
  if (top.code === "prerequisite_debt") return "Temel sırası hassas";
  return "Dikkat isteyen sinyal var";
}

function RouteIntelligenceCard({ intelligence, C }) {
  if (!intelligence) return null;
  const confidence = LABEL[intelligence.confidence] || "düşük";
  const score = Number(intelligence.confidenceScore || 0);
  const riskText = riskCopy(intelligence.risks);

  return (
    <View
      accessible
      accessibilityLabel={`Rota zekası, güven ${confidence}, ${riskText}`}
      style={[styles.card, { backgroundColor: C.elev, borderColor: C.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: C.accent + "18" }]}>
        <Icon name="zap" size={18} color={C.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: C.muted }]}>ROTA ZEKÂSI</Text>
        <Text style={[styles.title, { color: C.text }]}>
          Güven {confidence} · %{score}
        </Text>
        <Text style={[styles.body, { color: C.sec }]} numberOfLines={2}>
          {intelligence.nextBestAction}
        </Text>
      </View>
      <View style={[styles.badge, { borderColor: C.border }]}>
        <Text style={[styles.badgeText, { color: C.sec }]}>{riskText}</Text>
      </View>
    </View>
  );
}

export default memo(RouteIntelligenceCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  eyebrow: { ...TYPOGRAPHY.micro },
  title: { ...TYPOGRAPHY.bodySemiBold, marginTop: SPACING.xs },
  body: { ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
  badge: {
    minHeight: 32,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { ...TYPOGRAPHY.micro },
});
