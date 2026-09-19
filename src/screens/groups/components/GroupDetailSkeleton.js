import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design/Skeleton";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function GroupDetailSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Grup detayları yükleniyor">
      {/* Top Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={44} height={44} radius={SHAPE.button} />
        <Skeleton width={140} height={22} radius={SHAPE.chip} />
        <Skeleton width={44} height={44} radius={SHAPE.button} />
      </View>

      {/* Hero Card Skeleton */}
      <Skeleton width="100%" height={150} radius={SHAPE.card} style={styles.mb} />

      {/* Podium Skeleton */}
      <View style={styles.podiumRow}>
        <Skeleton width="30%" height={110} radius={SHAPE.card} />
        <Skeleton width="34%" height={130} radius={SHAPE.card} />
        <Skeleton width="30%" height={95} radius={SHAPE.card} />
      </View>

      {/* Leaderboard rows */}
      <View style={styles.list}>
        <Skeleton width="100%" height={56} radius={SHAPE.cardTight} />
        <Skeleton width="100%" height={56} radius={SHAPE.cardTight} />
        <Skeleton width="100%" height={56} radius={SHAPE.cardTight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: STEP.s3,
    minHeight: 44,
  },
  mb: {
    marginBottom: STEP.s3,
  },
  podiumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: STEP.s4,
  },
  list: {
    gap: STEP.s2,
  },
});
