import { useMemo } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { SwipeToHome } from "../../components/common/SwipeToHome";
import { useAppSelector } from "../../store/hooks";
import { selectLevel, selectStats, selectWeeklyXP } from "../../store/slices/gamificationSlice";
import { selectStreak, selectLongestStreak } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { useCurriculum } from "../../hooks/useCurriculum";
import { subjectColorOf } from "../../themes/subjectPalette";
import { getTier, getNextTier } from "../../constants/league";
import { SCREENS } from "../../constants/screens";
import { STEP, GUTTER } from "../../themes/tokens";

import { ProfileTopBar } from "./components/ProfileTopBar";
import { ProfileHero } from "./components/ProfileHero";
import { TargetDepartmentCard } from "./components/TargetDepartmentCard";
import { RouteCredentialsList } from "./components/RouteCredentialsList";
import { YearRouteChart } from "./components/YearRouteChart";
import { StrengthMap } from "./components/StrengthMap";
import { ProfileLinkRow } from "./components/ProfileLinkRow";
import { LevelRow } from "./components/LevelRow";
import { LeagueMiniCard } from "./components/LeagueMiniCard";

const FADE = (delay) => FadeInDown.delay(delay).duration(350).springify();

export default function ProfileScreen() {
  const C = useC();
  const { user } = useAuth();
  const { examType, field, targetDepartment } = useExam();
  const navigation = useNavigation();
  const { subjects = [] } = useCurriculum();
  const level = useAppSelector(selectLevel);
  const gStats = useAppSelector(selectStats);
  const streak = useAppSelector(selectStreak);
  const longestStreak = useAppSelector(selectLongestStreak);
  const weeklyXP = useAppSelector(selectWeeklyXP);
  const trials = useAppSelector(selectTrials);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Kullanıcı";

  const examLabel = useMemo(() => {
    if (examType === "lgs") return "LGS";
    if (examType === "tyt") return "SADECE TYT";
    if (examType === "dil") return "YKS DİL";
    if (field === "sayisal") return "TYT + SAY";
    if (field === "ea") return "TYT + EA";
    if (field === "sozel") return "TYT + SÖZ";
    return "YKS";
  }, [examType, field]);

  const leagueTier = useMemo(() => getTier(weeklyXP), [weeklyXP]);
  const leagueNextTier = useMemo(() => getNextTier(weeklyXP), [weeklyXP]);

  const careerStats = useMemo(() => {
    const totalQ = gStats.totalQuestions || 0;
    const totalMin = gStats.totalMinutes || 0;
    return { totalQuestions: totalQ, totalHours: Math.floor(totalMin / 60) };
  }, [gStats]);

  const strengths = useMemo(() => {
    if (!trials.length) return [];
    const subjectMap = {};
    subjects.forEach((s) => { subjectMap[s.key] = s; });

    const totals = {};
    trials.slice(0, 5).forEach((trial) => {
      Object.entries(trial.subjects || {}).forEach(([key, data]) => {
        const norm = key.replace(/^tyt_/, "").replace(/^ayt_/, "");
        if (!totals[norm]) totals[norm] = { correct: 0, total: 0 };
        totals[norm].correct += data.correct || 0;
        totals[norm].total += (data.correct || 0) + (data.wrong || 0);
      });
    });

    const entries = [];
    Object.entries(totals).forEach(([norm, agg]) => {
      if (agg.total < 5) return;
      const acc = Math.round((agg.correct / agg.total) * 100);
      const subj = subjectMap[norm];
      entries.push({ name: subj?.label || norm, c: subjectColorOf(C, norm), v: acc });
    });
    return entries.sort((a, b) => b.v - a.v).slice(0, 6);
  }, [subjects, trials, C]);

  return (
    <SwipeToHome>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <ProfileTopBar />
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
              label="Premium"
              meta="7 gün ücretsiz"
              onPress={() => navigation.navigate(SCREENS.PREMIUM, { source: "profile_premium_row" })}
              first
            />
          </Animated.View>

          <Animated.View entering={FADE(280)}>
            <LevelRow level={level?.level} xpInLevel={level?.xpInLevel} xpForNext={level?.xpForNext} />
          </Animated.View>

          <Animated.View entering={FADE(320)} style={{ marginHorizontal: GUTTER, marginTop: STEP.s4 }}>
            <LeagueMiniCard tier={leagueTier} nextTier={leagueNextTier} weeklyXP={weeklyXP} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </SwipeToHome>
  );
}
