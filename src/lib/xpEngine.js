import { XP_REWARDS, LEVELS, getBadges } from "../constants/gamification";
import { C } from "../themes/tokens";

export function calculateXP(action, data = {}) {
  switch (action) {
    case "study_log":
      return Math.floor((data.minutes || 0) / 15) * XP_REWARDS.study_15min;
    case "question_solved":
      return (data.count || 0) * XP_REWARDS.question_solved;
    case "trial_entry":
      return XP_REWARDS.trial_entry;
    case "wrong_resolved":
      return XP_REWARDS.wrong_resolved;
    case "daily_login":
      return XP_REWARDS.daily_login;
    case "streak_bonus":
      return (data.streak || 0) * XP_REWARDS.streak_bonus_per_day;
    case "plan_task_done":
      return XP_REWARDS.plan_task_done;
    case "perfect_plan":
      return XP_REWARDS.perfect_plan;
    case "daily_goal_complete":
      return XP_REWARDS.daily_goal_complete;
    default:
      return 0;
  }
}

export function getLevelForXP(totalXP) {
  let current = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xp) {
      current = LEVELS[i];
      break;
    }
  }
  const nextIdx = LEVELS.findIndex((l) => l.xp > current.xp);
  const next = nextIdx !== -1 ? LEVELS[nextIdx] : null;
  const xpInLevel = totalXP - current.xp;
  const xpForNext = next ? next.xp - current.xp : 0;
  const progress = xpForNext > 0 ? xpInLevel / xpForNext : 1;

  return { ...current, xpInLevel, xpForNext, progress, next };
}

export function checkBadgeUnlocks(userStats, unlockedIds) {
  const newBadges = [];

  for (const badge of getBadges(C)) {
    if (unlockedIds.includes(badge.id)) continue;

    const { type, value } = badge.condition;
    let met = false;

    switch (type) {
      case "streak":
        met = (userStats.streak || 0) >= value;
        break;
      case "questions":
        met = (userStats.totalQuestions || 0) >= value;
        break;
      case "trials":
        met = (userStats.totalTrials || 0) >= value;
        break;
      case "max_net":
        met = (userStats.maxNet || 0) >= value;
        break;
      case "wrongs_resolved":
        met = (userStats.wrongsResolved || 0) >= value;
        break;
      case "perfect_plan":
        met = (userStats.perfectPlans || 0) >= value;
        break;
      case "level":
        met = (userStats.level || 1) >= value;
        break;
    }

    if (met) newBadges.push(badge);
  }

  return newBadges;
}
