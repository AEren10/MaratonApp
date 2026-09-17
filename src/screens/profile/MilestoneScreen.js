import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Button, EmptyState, ErrorState, Skeleton } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useMilestone } from "../../hooks/useMilestone";
import { MilestoneHero } from "./components/MilestoneHero";
import { MilestoneStats } from "./components/MilestoneStats";
import { MilestoneBadges } from "./components/MilestoneBadges";
import * as H from "../../lib/haptics";

export default function MilestoneScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { done, questions, hours, net, loading, accessError } = useMilestone();

  const goShare = () => {
    H.tap();
    navigation.navigate(SCREENS.SHARE_CARD);
  };
  const goRoute = () => {
    H.select();
    navigation.navigate(SCREENS.HOME);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={styles.back}
        >
          <Icon name="chevL" size={15} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Kilometre taşı</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loading}>
            <Skeleton width={132} height={132} radius={SHAPE.iconBox} />
            <Skeleton width={200} height={28} style={{ marginTop: STEP.s3 }} />
            <Skeleton width={260} height={72} radius={SHAPE.panel} style={{ marginTop: STEP.s4 }} />
          </View>
        ) : accessError ? (
          <ErrorState preset="server" onPrimary={() => navigation.goBack()} />
        ) : done <= 0 ? (
          <EmptyState preset="shareCards" onPrimary={() => navigation.goBack()} />
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(500)}>
              <MilestoneHero done={done} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.stats}>
              <MilestoneStats questions={questions} hours={hours} net={net} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <MilestoneBadges />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.cta}>
              <Button onPress={goShare} size="lg" fullWidth>Kartı paylaş</Button>
              <Button
                onPress={goRoute}
                size="md"
                variant="outline"
                fullWidth
                style={styles.secondaryCta}
              >
                Rotaya dön
              </Button>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: GUTTER - 4, paddingVertical: STEP.s1,
  },
  back: {
    width: 44, height: 44,
    alignItems: "center", justifyContent: "center",
  },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s4 },
  loading: { alignItems: "center", marginTop: STEP.s5 },
  stats: { marginTop: STEP.s4 },
  cta: { marginTop: STEP.s4 },
  secondaryCta: { marginTop: STEP.s2 },
});
