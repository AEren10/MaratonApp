import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { Skeleton } from "../../../components/design/Skeleton";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";

export function GroupPreviewCard({ group, loading }) {
  const C = useC();

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Skeleton width={120} height={16} radius={SHAPE.chip} style={{ marginBottom: STEP.s1 }} />
        <Skeleton width={180} height={22} radius={SHAPE.chip} style={{ marginBottom: STEP.s1 }} />
        <Skeleton width={140} height={14} radius={SHAPE.chip} />
      </View>
    );
  }

  if (!group) return null;

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.badgeRow}>
        <View style={[styles.statusBadge, { backgroundColor: C.elev }]}>
          <Icon name="checkCircle" size={12} color={C.accentBright} />
          <Text style={[styles.badgeText, { color: C.accentBright }]}>Grup Bulundu</Text>
        </View>
        <Text style={[styles.codeText, { color: C.text3 }]}>{group.code}</Text>
      </View>

      <Text style={[styles.groupName, { color: C.text }]}>{group.name}</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Icon name="user" size={13} color={C.text3} />
          <Text style={[styles.detailText, { color: C.text2 }]}>
            Kurucu: {group.creator_name || group.creatorName || group.owner_name || "Öğrenci"}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Icon name="users" size={13} color={C.text3} />
          <Text style={[styles.detailText, { color: C.text2 }]}>
            {group.member_count || group.memberCount || 1} üye
          </Text>
        </View>
      </View>

      <View style={[styles.targetBanner, { backgroundColor: C.void, borderColor: C.line }]}>
        <Text style={[styles.targetLabel, { color: C.text3 }]}>Haftalık Hedef:</Text>
        <Text style={[styles.targetVal, { color: C.text }]}>
          {(group.weekly_target || group.weeklyTarget || 1000).toLocaleString("tr-TR")} soru
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
    marginTop: STEP.s2,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: STEP.s1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: STEP.s1,
    paddingVertical: SPACING.xs,
    borderRadius: SHAPE.chip,
  },
  badgeText: {
    ...TYPOGRAPHY.micro,
  },
  codeText: {
    ...TYPOGRAPHY.micro,
    letterSpacing: 1,
  },
  groupName: {
    ...TYPOGRAPHY.signalValue,
    marginBottom: STEP.s2,
  },
  detailsRow: {
    flexDirection: "row",
    gap: STEP.s3,
    marginBottom: STEP.s2,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SHAPE.chip,
  },
  detailText: {
    ...TYPOGRAPHY.micro,
  },
  targetBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: STEP.s2,
    paddingVertical: STEP.s1,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  targetLabel: {
    ...TYPOGRAPHY.micro,
  },
  targetVal: {
    ...TYPOGRAPHY.tableValue,
  },
});
