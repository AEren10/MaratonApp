import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, ErrorState, Skeleton } from "../../../components/design";
import { GUTTER, SHAPE, STEP } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import { TrialDetailHeader } from "./TrialDetailHeader";

export const TrialDetailStateViews = memo(function TrialDetailStateViews({
  C, onBack, loading, readError, onRetry, onNavigateEntry,
}) {
  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <TrialDetailHeader C={C} onBack={onBack} onMenu={() => {}} />
      {loading ? (
        <View style={s.loading}>
          <Skeleton width="100%" height={146} radius={SHAPE.panel} />
          <Skeleton width="100%" height={96} radius={SHAPE.card} style={s.gap} />
        </View>
      ) : (
        <View style={s.emptyBox}>
          {readError ? (
            <ErrorState preset="server" onPrimary={onRetry} code={readError.code || "sync_read_failed"} />
          ) : (
            <EmptyState preset="trialRecords" onPrimary={() => onNavigateEntry(SCREENS.TRIAL_ENTRY)} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
});

const s = StyleSheet.create({
  safe: { flex: 1 },
  loading: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  gap: { marginTop: STEP.s3 },
  emptyBox: { flex: 1, justifyContent: "center", paddingHorizontal: STEP.s3 },
});
