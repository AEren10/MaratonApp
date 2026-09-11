import { View } from "react-native";
import { Skeleton } from "../../../components/design";
import { STEP } from "../../../themes/tokens";

// Yukleniyor durumu — sessiz nefes alan iskelet, spinner degil.
export function TopicStudySkeleton() {
  return (
    <View style={{ marginTop: STEP.s3 }}>
      <View style={{ flexDirection: "row", gap: STEP.s2 }}>
        <Skeleton width="100%" height={78} radius={20} style={{ flex: 1 }} />
        <Skeleton width="100%" height={78} radius={20} style={{ flex: 1 }} />
        <Skeleton width="100%" height={78} radius={20} style={{ flex: 1 }} />
      </View>
      <Skeleton width="100%" height={92} radius={16} style={{ marginTop: STEP.s4 }} />
      <Skeleton width="100%" height={140} radius={16} style={{ marginTop: STEP.s4 }} />
    </View>
  );
}
