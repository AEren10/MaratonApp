import { XP_REWARDS, LEVELS, getBadges } from "../constants/gamification";
import { C } from "../themes/tokens";

export function calculateXP(action, data = {}) {
  let base = 0;
  switch (action) {
    case "study_log":
      base = Math.floor((data.minutes || 0) / 15) * XP_REWARDS.study_15min;
      break;
    case "question_solved":
      base = (data.count || 0) * XP_REWARDS.question_solved;
      break;
    case "trial_entry":
      base = XP_REWARDS.trial_entry;
      break;
    case "wrong_resolved":
      base = XP_REWARDS.wrong_resolved;
      break;
    case "daily_login":
      base = XP_REWARDS.daily_login;
      break;
    case "streak_bonus":
      base = (data.streak || 0) * XP_REWARDS.streak_bonus_per_day;
      break;
    case "plan_task_done":
      base = XP_REWARDS.plan_task_done;
      break;
    case "perfect_plan":
      base = XP_REWARDS.perfect_plan;
      break;
    case "daily_goal_complete":
      base = XP_REWARDS.daily_goal_complete;
      break;
    case "comeback_bonus":
      base = XP_REWARDS.comeback_bonus;
      break;
    case "referral_applied":
      base = data.xpOverride || XP_REWARDS.referral_applied;
      break;
    case "streak_milestone":
      base = data.xpOverride || 0;
      break;
    default:
      base = 0;
  }
  const multiplier = data.multiplier || 1;
  return Math.floor(base * multiplier);
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
