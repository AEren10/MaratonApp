import { View } from "react-native";

import { SkeletonCard } from "../../../components/common/SkeletonCard";
import { SPACING } from "../../../themes/tokens";

export function WrongNotebookSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: SPACING.md }}>
      <SkeletonCard height={180} />
      <SkeletonCard height={180} />
      <SkeletonCard height={180} />
    </View>
  );
}
