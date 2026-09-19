import { View, StyleSheet } from "react-native";
import { Skeleton } from "../../../components/design/Skeleton";
import { GUTTER, STEP, SHAPE } from "../../../themes/tokens";

export function GroupsSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Gruplar yükleniyor">
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={44} height={44} radius={SHAPE.button} />
        <Skeleton width={120} height={22} radius={SHAPE.chip} />
        <Skeleton width={44} height={44} radius={SHAPE.button} />
      </View>

      {/* Info Card Skeleton */}
      <Skeleton width="100%" height={90} radius={SHAPE.card} style={styles.mb} />

      {/* Group List Skeletons */}
      <View style={styles.list}>
        <Skeleton width="100%" height={124} radius={SHAPE.card} />
        <Skeleton width="100%" height={124} radius={SHAPE.card} />
        <Skeleton width="100%" height={124} radius={SHAPE.card} />
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
  list: {
    gap: STEP.s2,
  },
});
