import { SCREENS } from "../../../constants/screens";
import { trackButtonTap } from "../../../lib/analytics";
import { XPBoostToast } from "../../../components/common/XPBoostToast";
import { HomeComebackOverlay } from "./HomeComebackOverlay";
import { HomeCompletionOverlays } from "./HomeCompletionOverlays";
import { GoalCompleteModal } from "../../../components/common/GoalCompleteModal";
import { LevelUpModal } from "../../../components/common/LevelUpModal";
import { NudgePopup } from "../../../components/common/NudgePopup";
import { StreakDetailSheet } from "../../../components/common/StreakDetailSheet";
import StreakMilestoneModal from "../../../components/common/StreakMilestoneModal";
import { NudgeModal } from "../../../components/common/NudgeModal";

export function HomeOverlays({
  comeback,
  completion,
  dailyGoal,
  daysLeft,
  dismissComeback,
  dismissGoalComplete,
  dismissLevelUp,
  dismissMilestone,
  dismissNudgePopup,
  freezeCount,
  freezeResetAt,
  goalCompleteVisible,
  lastStudyDate,
  levelUpModal,
  longestStreak,
  milestoneModal,
  minutesToday,
  navigation,
  nudgePopup,
  nudgeVisible,
  nudges,
  onCloseNudgeModal,
  onCloseStreakSheet,
  routeCurrentWeek,
  routeTotals,
  solvedToday,
  streak,
  streakSheetVisible,
  xpToast,
  dismissXP,
}) {
  return (
    <>
      <XPBoostToast
        amount={xpToast.amount}
        visible={xpToast.visible}
        multiplier={xpToast.multiplier}
        onDismiss={dismissXP}
      />

      <HomeComebackOverlay
        comeback={comeback}
        dismissComeback={dismissComeback}
        minutesToday={minutesToday}
        navigation={navigation}
        routeCurrentWeek={routeCurrentWeek}
        routeTotals={routeTotals}
        solvedToday={solvedToday}
      />
      <HomeCompletionOverlays
        blocked={Boolean(comeback || goalCompleteVisible || levelUpModal.visible
          || milestoneModal.visible || nudgePopup || nudgeVisible || streakSheetVisible)}
        completion={completion}
        daysLeft={daysLeft}
        minutesToday={minutesToday}
        navigation={navigation}
        solvedToday={solvedToday}
      />

      <GoalCompleteModal
        visible={goalCompleteVisible}
        solved={solvedToday}
        goal={dailyGoal}
        xpEarned={40}
        onDismiss={dismissGoalComplete}
        onShare={() => {
          trackButtonTap("home_goal_complete_share", { targetScreen: SCREENS.SHARE_CARD });
          dismissGoalComplete();
          navigation.navigate(SCREENS.SHARE_CARD);
        }}
      />

      <LevelUpModal
        visible={levelUpModal.visible}
        level={levelUpModal.level}
        title={levelUpModal.title}
        onClose={dismissLevelUp}
      />

      <NudgePopup
        nudge={nudgePopup}
        visible={!!nudgePopup}
        onDismiss={dismissNudgePopup}
        onAction={(nudge) => {
          dismissNudgePopup();
          const target = nudge.subject ? SCREENS.ANALYSIS : SCREENS.PLAN_DETAIL;
          trackButtonTap("home_nudge_popup_action", {
            targetScreen: target,
            subject: nudge.subject || null,
          });
          navigation.navigate(target);
        }}
      />

      <StreakDetailSheet
        visible={streakSheetVisible}
        onClose={onCloseStreakSheet}
        streak={streak}
        longestStreak={longestStreak}
        freezeCount={freezeCount}
        freezeResetAt={freezeResetAt}
        lastStudyDate={lastStudyDate}
      />

      <StreakMilestoneModal
        visible={milestoneModal.visible}
        milestone={milestoneModal.milestone}
        onDismiss={dismissMilestone}
      />

      <NudgeModal
        visible={nudgeVisible}
        nudges={nudges}
        onClose={onCloseNudgeModal}
        onAction={(nudge) => {
          onCloseNudgeModal();
          if (nudge.actionLabel === "Plana Ekle" && nudge.subject) {
            trackButtonTap("home_nudge_modal_add_plan", {
              subject: nudge.subject,
              targetScreen: SCREENS.ADD_TASK,
            });
            navigation.navigate(SCREENS.ADD_TASK, { preSubject: nudge.subject });
          } else if (nudge.subject) {
            trackButtonTap("home_nudge_modal_subject", {
              subject: nudge.subject,
              targetScreen: SCREENS.SUBJECT_DETAIL,
            });
            navigation.navigate(SCREENS.SUBJECT_DETAIL, { subjectKey: nudge.subject });
          } else {
            trackButtonTap("home_nudge_modal_plan", { targetScreen: SCREENS.PLAN_DETAIL });
            navigation.navigate(SCREENS.PLAN_DETAIL);
          }
        }}
      />
    </>
  );
}
