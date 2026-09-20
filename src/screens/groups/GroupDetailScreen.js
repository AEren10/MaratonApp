import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useGroupDetail } from "../../hooks/useGroupDetail";
import { GroupDetailSkeleton } from "./components/GroupDetailSkeleton";
import { GroupDetailHero } from "./components/GroupDetailHero";
import { GroupPodium } from "./components/GroupPodium";
import { GroupLeaderboardRow } from "./components/GroupLeaderboardRow";
import { GroupShareCard } from "./components/GroupShareCard";
import { GroupDetailHeader } from "./components/GroupDetailHeader";
import * as H from "../../lib/haptics";

export default function GroupDetailScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName: initialName } = route.params || {};
  const { group, leaderboard = [], goal, loading, refresh } = useGroupDetail(groupId);

  const displayName = group?.name || initialName || "Grup Detayı";

  const handleBack = () => {
    H.tap();
    navigation.goBack();
  };

  const handleSettings = () => {
    H.tap();
    navigation.navigate(SCREENS.GROUP_SETTINGS, {
      groupId: group?.id || groupId,
      groupName: group?.name,
      code: group?.code,
      role: group?.role,
    });
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: C.bg }]}>
        <GroupDetailSkeleton />
      </SafeAreaView>
    );
  }

  const top3 = leaderboard.slice(0, 3);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: C.bg }]}>
      <GroupDetailHeader
        title={displayName}
        onBack={handleBack}
        onSettings={handleSettings}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={C.accent}
            colors={[C.accent]}
          />
        }
      >
        <GroupDetailHero group={group} goal={goal} />

        {top3.length >= 2 ? <GroupPodium topMembers={top3} /> : null}

        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: C.text3 }]}>TÜM ÜYELER</Text>
          {(leaderboard || []).map((member) => (
            <GroupLeaderboardRow key={member.user_id || member.id} member={member} />
          ))}
        </View>

        <GroupShareCard code={group?.code} groupName={group?.name} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3,
    paddingBottom: STEP.s5 + STEP.s3,
  },
  listSection: {
    marginBottom: STEP.s4,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    marginBottom: STEP.s2,
  },
});
