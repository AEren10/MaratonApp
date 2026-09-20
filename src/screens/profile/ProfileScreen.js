import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { SwipeToHome } from "../../components/common/SwipeToHome";
import { SCREENS } from "../../constants/screens";
import { PREMIUM_ENABLED } from "../../constants/premium";
import { STEP, GUTTER } from "../../themes/tokens";

import { ProfileTopBar } from "./components/ProfileTopBar";
import { ProfileHero } from "./components/ProfileHero";
import { TargetDepartmentCard } from "./components/TargetDepartmentCard";
import { RouteCredentialsList } from "./components/RouteCredentialsList";
import { YearRouteChart } from "./components/YearRouteChart";
import { StrengthMap } from "./components/StrengthMap";
import { ProfileLinkRow } from "./components/ProfileLinkRow";
import { LevelRow } from "./components/LevelRow";
import { ExamFlowRow } from "./components/ExamFlowRow";
import { LeagueMiniCard } from "./components/LeagueMiniCard";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import { useProfileViewModel } from "./useProfileViewModel";

const FADE = (delay) => FadeInDown.delay(delay).duration(350).springify();

export default function ProfileScreen() {
  const C = useC();
  const navigation = useNavigation();
  const {
    careerStats,
    displayName,
    examLabel,
    leagueNextTier,
    leagueTier,
    level,
    longestStreak,
    streak,
    strengths,
    targetDepartment,
    weeklyXP,
    loading,
  } = useProfileViewModel(C);

  return (
    <SwipeToHome>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <ProfileTopBar />
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FADE(0)}>
              <ProfileHero name={displayName} exam={examLabel} streak={streak} />
            </Animated.View>

            <Animated.View entering={FADE(50)}>
              <TargetDepartmentCard targetDepartment={targetDepartment} />
            </Animated.View>

            <Animated.View entering={FADE(100)}>
              <RouteCredentialsList
                totalQuestions={careerStats.totalQuestions}
                totalHours={careerStats.totalHours}
                longestStreak={longestStreak}
              />
            </Animated.View>

            <Animated.View entering={FADE(150)}>
              <YearRouteChart />
            </Animated.View>

            <Animated.View entering={FADE(200)}>
              <StrengthMap strengths={strengths} />
            </Animated.View>

            <Animated.View entering={FADE(250)} style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 }}>
              <ProfileLinkRow
                label="Arkadaşını davet et"
                meta="2 aktif"
                onPress={() => navigation.navigate(SCREENS.REFERRAL)}
                first
              />
              <ProfileLinkRow
                label="Gruplarım"
                onPress={() => navigation.navigate(SCREENS.GROUPS)}
              />
              <ProfileLinkRow
                label="Çalışma Geçmişi"
                onPress={() => navigation.navigate(SCREENS.STUDY_LOG)}
              />
              <ProfileLinkRow
                label="Rotayı Dondur"
                onPress={() => navigation.navigate(SCREENS.ROUTE_PAUSE)}
              />
              <ProfileLinkRow
                label="Rotayı Yeniden Çiz"
                onPress={() => navigation.navigate(SCREENS.ROUTE_REDRAW)}
              />
              {PREMIUM_ENABLED ? (
                <ProfileLinkRow
                  label="Premium"
                  meta="7 gün ücretsiz"
                  onPress={() => navigation.navigate(SCREENS.PREMIUM, { source: "profile_premium_row" })}
                />
              ) : null}
              <ExamFlowRow />
            </Animated.View>

            <Animated.View entering={FADE(280)}>
              <LevelRow level={level?.level} xpInLevel={level?.xpInLevel} xpForNext={level?.xpForNext} />
            </Animated.View>

            <Animated.View entering={FADE(320)} style={{ marginHorizontal: GUTTER, marginTop: STEP.s4 }}>
              <LeagueMiniCard tier={leagueTier} nextTier={leagueNextTier} weeklyXP={weeklyXP} />
            </Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </SwipeToHome>
  );
}
