import { ScrollView } from "react-native";
import { useTabScrollTop } from "../../hooks/useTabScrollTop";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { SwipeToHome } from "../../components/common/SwipeToHome";
import { SCREENS } from "../../constants/screens";
import { PREMIUM_ENABLED } from "../../constants/premium";
import { SOCIAL_ENABLED } from "../../constants/social";
import { XP_VISIBLE } from "../../constants/gamification";
import { STEP, GUTTER } from "../../themes/tokens";

import { ProfileTopBar } from "./components/ProfileTopBar";
import { ProfileHero } from "./components/ProfileHero";
import { TargetDepartmentCard } from "./components/TargetDepartmentCard";
import { ProfileStatsCard } from "./components/ProfileStatsCard";
import { ProfileShareTiles } from "./components/ProfileShareTiles";
import { StrengthMap } from "./components/StrengthMap";
import { ProfileLinkRow } from "./components/ProfileLinkRow";
import { LevelRow } from "./components/LevelRow";
import { ExamFlowRow } from "./components/ExamFlowRow";
import { LeagueMiniCard } from "./components/LeagueMiniCard";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import { useProfileViewModel } from "./useProfileViewModel";


function studyMeta({ totalQuestions = 0, totalHours = 0 } = {}) {
  const parts = [];
  if (totalQuestions > 0) parts.push(`${totalQuestions} soru`);
  if (totalHours > 0) parts.push(`${totalHours} sa`);
  return parts.length ? parts.join(" · ") : undefined;
}

export default function ProfileScreen() {
  const C = useC();
  const scrollRef = useTabScrollTop();
  const navigation = useNavigation();
  const {
    careerStats,
    displayName,
    examLabel,
    leagueNextTier,
    leagueTier,
    level,
    longestStreak,
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
          <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
            {/* Kimlik: kim, hangi sinav, hedef, seviye ve lig. Seviye ve lig
                eskiden sayfanin en altinda, baglanti listesinin arkasindaydi. */}
            <Animated.View>
              <ProfileHero name={displayName} exam={examLabel} />
            </Animated.View>
            <Animated.View>
              <TargetDepartmentCard targetDepartment={targetDepartment} />
            </Animated.View>
            {XP_VISIBLE ? (
              <Animated.View>
                <LevelRow level={level?.level} xpInLevel={level?.xpInLevel} xpForNext={level?.xpForNext} />
              </Animated.View>
            ) : null}
            {/* Istatistik ligden once ve kutusuz (kullanici, 29 Eylul). */}
            <Animated.View>
              <ProfileStatsCard longestStreak={longestStreak} />
            </Animated.View>
            {SOCIAL_ENABLED ? (
              <Animated.View style={{ marginHorizontal: GUTTER, marginTop: STEP.s4 }}>
                <LeagueMiniCard tier={leagueTier} nextTier={leagueNextTier} weeklyXP={weeklyXP} />
              </Animated.View>
            ) : null}
            <Animated.View>
              <StrengthMap />
            </Animated.View>
            <ProfileShareTiles />

            {/* "Yol kunyesi" kutulari (soru, saat, en uzun seri) kalkti; ayni
                bilgi Calisma gecmisi satirinda, yalniz sifir degilse. */}
            <Animated.View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 }}>
              {/* Yanlis defteri ana sayfada ve Analiz'de; hikaye ve widget
                  listeden cikip ustte kutucuk oldu. Liste hafifledi. */}
              <ProfileLinkRow
                label="Çalışma geçmişi"
                meta={studyMeta(careerStats)}
                onPress={() => navigation.navigate(SCREENS.STUDY_LOG)}
                first
              />
              {SOCIAL_ENABLED ? (
                <>
                  <ProfileLinkRow
                    label="Meydan okumalar"
                    meta="Arkadaşınla yarış"
                    onPress={() => navigation.navigate(SCREENS.CHALLENGE)}
                  />
                </>
              ) : null}
              <ProfileLinkRow
                label="Arkadaşını davet et"
                onPress={() => navigation.navigate(SCREENS.REFERRAL)}
              />
              {PREMIUM_ENABLED ? (
                <ProfileLinkRow
                  label="Premium"
                  meta="7 gün ücretsiz"
                  onPress={() => navigation.navigate(SCREENS.PREMIUM, { source: "profile_premium_row" })}
                />
              ) : null}
              <ExamFlowRow />
              <ProfileLinkRow
                label="Rotayı dondur"
                onPress={() => navigation.navigate(SCREENS.ROUTE_PAUSE)}
              />
              <ProfileLinkRow
                label="Rotayı yeniden çiz"
                onPress={() => navigation.navigate(SCREENS.ROUTE_REDRAW)}
              />
            </Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </SwipeToHome>
  );
}
