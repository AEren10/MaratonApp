import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING, CONTROL } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function GroupCard({ group, onPress }) {
  const C = useC();
  const target = group.weekly_target || 1000;
  const current = group.weekly_questions || 0;
  const progressPercent = Math.min(100, Math.round((current / target) * 100));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${group.name} grubu detayı`}
      onPress={() => {
        H.tap();
        onPress?.(group);
      }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: C.surface, borderColor: C.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: C.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.metaRow}>
            <Icon name="users" size={13} color={C.text3} />
            <Text style={[styles.metaText, { color: C.text2 }]}>{group.member_count || 1} üye</Text>
            {group.user_rank ? (
              <View style={[styles.rankPill, { backgroundColor: C.elev }]}>
                <Text style={[styles.rankText, { color: C.accentBright }]}>
                  {group.user_rank}. sıradasın
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={[styles.codeBadge, { backgroundColor: C.elev, borderColor: C.line }]}>
          <Text style={[styles.codeText, { color: C.text2 }]}>{group.code}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.metaText, { color: C.text3 }]}>Haftalık Hedef</Text>
          <Text style={[styles.statText, { color: C.text }]}>
            {current.toLocaleString("tr-TR")} / {target.toLocaleString("tr-TR")}{" "}
            <Text style={{ color: C.text3 }}>soru</Text>
          </Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: C.void }]}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%`, backgroundColor: C.accent },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SHAPE.card,
    borderWidth: 1,
    padding: STEP.s3,
    marginBottom: STEP.s2,
    minHeight: CONTROL.tapMin,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: STEP.s2,
  },
  nameBlock: { flex: 1, marginRight: STEP.s2 },
  name: { ...TYPOGRAPHY.signalValue, marginBottom: SPACING.xs },
  metaRow: { flexDirection: "row", alignItems: "center", gap: SHAPE.chip },
  metaText: { ...TYPOGRAPHY.micro },
  statText: { ...TYPOGRAPHY.tableValue },
  rankPill: { paddingHorizontal: STEP.s1, borderRadius: SHAPE.chip, marginLeft: SPACING.xs },
  rankText: { ...TYPOGRAPHY.micro },
  codeBadge: { paddingHorizontal: STEP.s1, paddingVertical: SPACING.xs, borderRadius: SHAPE.chip, borderWidth: 1 },
  codeText: { ...TYPOGRAPHY.micro, letterSpacing: 0.5 },
  progressContainer: { marginTop: STEP.s1 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: SHAPE.chip },
  progressBarBg: { height: 6, borderRadius: SHAPE.chip / 2, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: SHAPE.chip / 2 },
});
