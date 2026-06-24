import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { getSubjectColor } from "../../themes/subjects";
import { Icon } from "../../components/design";

const PERIOD_LABELS = { weekly: "Haftalık Özet", monthly: "Aylık Özet" };

function StatCell({ icon, value, label, s }) {
  return (
    <View style={s.statCell}>
      <Icon name={icon} size={16} color="rgba(255,255,255,0.75)" />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function WrappedCard({ stats, period = "weekly" }) {
  const C = useC();
  const {
    totalQuestions = 0, totalHours = 0, bestNet = 0, uniqueDays = 0,
    strongestSubject, streak = 0, xp = 0, totalTrials = 0,
  } = stats || {};

  const subjectColor = strongestSubject?.name
    ? getSubjectColor(strongestSubject.name) || C.accent
    : C.accent;

  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={[s.card, { borderColor: subjectColor + "40" }]}>
      <View style={[s.overlay, { backgroundColor: subjectColor }]} />

      <Text style={s.periodLabel}>
        {PERIOD_LABELS[period] || PERIOD_LABELS.weekly}
      </Text>

      {/* Hero stat */}
      <Text style={s.heroValue}>{totalQuestions.toLocaleString("tr-TR")}</Text>
      <Text style={s.heroLabel}>soru çözdün</Text>

      {/* Supporting stats */}
      <View style={s.grid}>
        <StatCell icon="clock" value={`${totalHours}s`} label="Çalışma" s={s} />
        <StatCell icon="trendUp" value={bestNet} label="En İyi Net" s={s} />
        <StatCell icon="flame" value={uniqueDays} label="Gün" s={s} />
      </View>

      <View style={s.divider} />

      {/* Bottom meta */}
      <View style={s.bottomRow}>
        {strongestSubject?.name && (
          <View style={s.subjectBadge}>
            <View style={[s.subjectDot, { backgroundColor: subjectColor }]} />
            <Text style={s.subjectText}>{strongestSubject.name}</Text>
          </View>
        )}

        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <Icon name="flame" size={14} color={C.amber} />
            <Text style={[s.metaValue, { color: C.amber }]}>{streak}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={[s.metaValue, { color: C.accent }]}>{xp} XP</Text>
          </View>
          {totalTrials > 0 && (
            <View style={s.metaItem}>
              <Text style={s.metaMuted}>{totalTrials} Deneme</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={s.watermark}>Maraton</Text>
    </View>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    card: {
      borderRadius: RADIUS.xxl,
      borderWidth: 1,
      overflow: "hidden",
      padding: SPACING.xl,
      paddingTop: 0,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.78,
      borderRadius: RADIUS.xxl,
    },
    periodLabel: {
      ...TYPOGRAPHY.label,
      color: "rgba(255,255,255,0.80)",
      marginTop: SPACING.xl,
      marginBottom: SPACING.sm,
      zIndex: 1,
    },
    heroValue: {
      fontFamily: "SpaceGrotesk_700Bold",
      fontSize: 46,
      color: "#FFFFFF",
      zIndex: 1,
      letterSpacing: -1,
    },
    heroLabel: {
      ...TYPOGRAPHY.bodyMedium,
      color: "rgba(255,255,255,0.80)",
      marginBottom: SPACING.lg,
      zIndex: 1,
    },
    grid: {
      flexDirection: "row",
      zIndex: 1,
    },
    statCell: {
      flex: 1,
      alignItems: "center",
      paddingVertical: SPACING.sm,
    },
    statValue: {
      ...TYPOGRAPHY.statSmall,
      color: "#FFFFFF",
      marginTop: SPACING.xs,
    },
    statLabel: {
      ...TYPOGRAPHY.micro,
      color: "rgba(255,255,255,0.60)",
      marginTop: SPACING.xs,
    },
    divider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.15)",
      marginVertical: SPACING.md,
      zIndex: 1,
    },
    bottomRow: { zIndex: 1 },
    subjectBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    subjectDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.sm },
    subjectText: { ...TYPOGRAPHY.bodySemiBold, color: "#FFFFFF" },
    metaRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
    metaItem: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
    metaValue: { ...TYPOGRAPHY.captionMedium },
    metaMuted: { ...TYPOGRAPHY.captionMedium, color: "rgba(255,255,255,0.60)" },
    watermark: {
      ...TYPOGRAPHY.captionMedium,
      color: "rgba(255,255,255,0.35)",
      position: "absolute",
      bottom: SPACING.lg,
      right: SPACING.xl,
      zIndex: 1,
    },
  });
}
