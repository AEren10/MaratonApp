import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";

export function GroupDetailHero({ group }) {
  const C = useC();
  if (!group) return null;

  const current = group.weekly_questions || 0;
  const target = group.weekly_target || 1000;
  const percent = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.groupName, { color: C.text }]}>{group.name}</Text>
          <View style={styles.memberBadge}>
            <Icon name="users" size={13} color={C.text3} />
            <Text style={[styles.memberText, { color: C.text2 }]}>
              {group.member_count} üye
            </Text>
          </View>
        </View>
        <View style={[styles.percentBadge, { backgroundColor: C.elev, borderColor: C.line }]}>
          <Text style={[styles.percentText, { color: C.accentBright }]}>%{percent}</Text>
        </View>
      </View>

      <View style={styles.targetSection}>
        <View style={styles.labelRow}>
          <Text style={[styles.targetLabel, { color: C.text3 }]}>Haftalık Ortak Hedef</Text>
          <Text style={[styles.statText, { color: C.text }]}>
            {current.toLocaleString("tr-TR")} / {target.toLocaleString("tr-TR")}{" "}
            <Text style={{ color: C.text3 }}>soru</Text>
          </Text>
        </View>

        <View style={[styles.barTrack, { backgroundColor: C.void }]}>
          <View
            style={[
              styles.barFill,
              { width: `${percent}%`, backgroundColor: C.accent },
            ]}
          />
        </View>

        <Text style={[styles.nudgeText, { color: C.text2 }]}>
          {remaining > 0
            ? `Hedefe ${remaining.toLocaleString("tr-TR")} soru kaldı · Her çözülen soru grubu hedefine yaklaştırır.`
            : "Tebrikler! Grubun bu haftaki ortak hedefi başarıyla tamamlandı."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SHAPE.card,
    borderWidth: 1,
    padding: STEP.s3,
    marginBottom: STEP.s3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: STEP.s2,
  },
  titleBlock: {
    flex: 1,
    marginRight: STEP.s2,
  },
  groupName: {
    ...TYPOGRAPHY.subheading,
    marginBottom: SPACING.xs,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SHAPE.chip,
  },
  memberText: {
    ...TYPOGRAPHY.micro,
  },
  percentBadge: {
    paddingHorizontal: STEP.s2,
    paddingVertical: SPACING.xs,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  percentText: {
    ...TYPOGRAPHY.micro,
  },
  targetSection: {
    marginTop: SPACING.xs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: STEP.s1,
  },
  targetLabel: {
    ...TYPOGRAPHY.micro,
  },
  statText: {
    ...TYPOGRAPHY.tableValue,
  },
  barTrack: {
    height: 8,
    borderRadius: SHAPE.chip / 2,
    overflow: "hidden",
    marginBottom: STEP.s1,
  },
  barFill: {
    height: "100%",
    borderRadius: SHAPE.chip / 2,
  },
  nudgeText: {
    ...TYPOGRAPHY.micro,
    lineHeight: 16,
  },
});
