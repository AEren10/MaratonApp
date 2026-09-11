import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";
import RouteIntelligenceCard from "./RouteIntelligenceCard";
import RouteNetChart from "./RouteNetChart";

export default function RouteProgressHeader({
  totals,
  daysLeft,
  isPaused,
  intelligence,
  onTogglePause,
  forecast,
  targetNet,
  C,
}) {
  const progress = Math.round((totals?.progress || 0) * 100);
  const stopCount = Number(totals?.pending || 0);

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: C.muted }]}>ROTANIN TAMAMI</Text>
          <Text style={[styles.progress, { color: C.text }]}>%{progress}</Text>
          <Text style={[styles.caption, { color: C.sec }]}>
            {stopCount} durak · {daysLeft ?? "—"} gün kaldı
          </Text>
        </View>
        <Pressable
          accessibilityLabel={isPaused ? "Rotayı sürdür" : "Rotayı dondur"}
          accessibilityRole="button"
          accessibilityState={{ selected: isPaused }}
          onPress={onTogglePause}
          style={({ pressed }) => [
            styles.pauseButton,
            { borderColor: C.border, backgroundColor: pressed ? C.elev : C.void },
          ]}
        >
          <Icon name={isPaused ? "play" : "pause"} size={18} color={C.text} />
          <Text style={[styles.pauseText, { color: C.text }]}>{isPaused ? "Sürdür" : "Dondur"}</Text>
        </Pressable>
      </View>
      <View style={[styles.track, { backgroundColor: C.track }]}>
        <View style={[styles.fill, { width: `${progress}%`, backgroundColor: C.accent }]} />
      </View>
      {isPaused ? (
        <Text accessibilityLiveRegion="polite" style={[styles.frozen, { color: C.sec }]}>Rota donduruldu; geçmişin korunuyor.</Text>
      ) : null}
      <RouteNetChart forecast={forecast} targetNet={targetNet} C={C} />
      <RouteIntelligenceCard intelligence={intelligence} C={C} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xxl, borderWidth: 1, padding: SPACING.xl, marginBottom: SPACING.xl },
  topRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  copy: { flex: 1 },
  eyebrow: { ...TYPOGRAPHY.label },
  progress: { ...TYPOGRAPHY.stat, marginTop: SPACING.xs },
  caption: { ...TYPOGRAPHY.caption },
  pauseButton: {
    minWidth: 48, minHeight: 48, borderRadius: RADIUS.lg, borderWidth: 1,
    paddingHorizontal: SPACING.md, alignItems: "center", justifyContent: "center", gap: SPACING.xs,
  },
  pauseText: { ...TYPOGRAPHY.micro },
  track: { height: 8, borderRadius: RADIUS.pill, overflow: "hidden", marginTop: SPACING.lg },
  fill: { height: 8, borderRadius: RADIUS.pill },
  frozen: { ...TYPOGRAPHY.caption, marginTop: SPACING.sm },
});
