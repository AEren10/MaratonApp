import { useState, useCallback, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  earnXP,
  revertXP,
  unlockBadge,
  incrementStat,
  setMaxStat,
  selectBadgeIds,
  selectStats,
  selectLevel,
  selectXP,
  selectWeeklyXP,
  selectClaimedMilestones,
  claimStreakMilestone,
  saveGamificationToStorage,
} from "../store/slices/gamificationSlice";
import { calculateXP, checkBadgeUnlocks, getLevelForXP } from "../lib/xpEngine";
import { shouldApplyMultiplier, rollMultiplier } from "../lib/variableRewards";
import { getAllUnclaimedMilestones, claimMilestone } from "../lib/streakMilestones";
import { useAuth } from "../contexts/AuthContext";
import { logXP } from "../supabase/xp";
import { saveGamificationToSupabase, grantPremiumDays } from "../supabase/profiles";

// Module-level guard: prevents concurrent reward/milestone operations
// across multiple hook instances mounted simultaneously.
let _opLock = false;
let _globalSaveTimer = null;

// Serialized XP log queue: ensures revert operations execute in order
// and don't corrupt XP totals when multiple logXP calls overlap.
let _xpQueue = Promise.resolve();
function enqueueXPLog(dispatch, userId, amount, action) {
  _xpQueue = _xpQueue.then(() =>
    logXP(userId, amount, action).catch(() => dispatch(revertXP({ amount }))),
  );
}

export function useGamification() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const badgeIds = useAppSelector(selectBadgeIds);
  const stats = useAppSelector(selectStats);
  const level = useAppSelector(selectLevel);
  const totalXP = useAppSelector(selectXP);
  const weeklyXP = useAppSelector(selectWeeklyXP);

  const claimedMilestones = useAppSelector(selectClaimedMilestones);

  const [xpToast, setXpToast] = useState({ visible: false, amount: 0, multiplier: 1 });
  const [badgeModal, setBadgeModal] = useState({ visible: false, badge: null });
  const [levelUpModal, setLevelUpModal] = useState({ visible: false, level: 0, title: "" });
  const [milestoneModal, setMilestoneModal] = useState({ visible: false, milestone: null });
  const badgeTimerRef = useRef(null);
  const levelUpTimerRef = useRef(null);
  const milestoneTimerRef = useRef(null);

  const statsRef = useRef(stats);
  const badgeIdsRef = useRef(badgeIds);
  const levelRef = useRef(level);
  const totalXPRef = useRef(totalXP);
  const weeklyXPRef = useRef(weeklyXP);
  const claimedRef = useRef(claimedMilestones);
  statsRef.current = stats;
  badgeIdsRef.current = badgeIds;
  levelRef.current = level;
  totalXPRef.current = totalXP;
  weeklyXPRef.current = weeklyXP;
  claimedRef.current = claimedMilestones;

  const debouncedSave = useCallback(() => {
    clearTimeout(_globalSaveTimer);
    _globalSaveTimer = setTimeout(() => {
      const state = {
        xp: totalXPRef.current, weeklyXP: weeklyXPRef.current,
        badges: badgeIdsRef.current, stats: statsRef.current,
        claimedMilestones: claimedRef.current,
      };
      saveGamificationToStorage(state);
      saveGamificationToSupabase(user?.id, state.badges, state.stats, state.claimedMilestones);
    }, 500);
  }, [user?.id]);

  const reward = useCallback(
    (action, data = {}) => {
      if (_opLock) return;
      _opLock = true;
      try {
        let multiplier = 1;
        const noMultiply = ["daily_login", "comeback_bonus", "streak_milestone", "mystery_chest"];
        if (!noMultiply.includes(action) && shouldApplyMultiplier()) {
          multiplier = rollMultiplier();
        }

        const amount = calculateXP(action, { ...data, multiplier });
        if (amount <= 0) return;

        const currentXP = totalXPRef.current;
        const prevLevel = getLevelForXP(currentXP);
        dispatch(earnXP({ amount }));
        if (user?.id) enqueueXPLog(dispatch, user.id, amount, action);
        setXpToast({ visible: true, amount, multiplier });

        const newLevel = getLevelForXP(currentXP + amount);
        if (newLevel.level > prevLevel.level) {
          clearTimeout(levelUpTimerRef.current);
          levelUpTimerRef.current = setTimeout(() => setLevelUpModal({ visible: true, level: newLevel.level, title: newLevel.title }), 3000);
        }

        const updatedStats = { ...statsRef.current, level: newLevel.level };

        if (data.statUpdates) {
          data.statUpdates.forEach(({ type, key, value }) => {
            if (type === "increment") {
              dispatch(incrementStat({ key, amount: value || 1 }));
              updatedStats[key] = (updatedStats[key] || 0) + (value || 1);
            } else if (type === "max") {
              dispatch(setMaxStat({ key, value }));
              updatedStats[key] = Math.max(updatedStats[key] || 0, value);
            }
          });
        }

        const newBadges = checkBadgeUnlocks(updatedStats, badgeIdsRef.current);
        if (newBadges.length > 0) {
          newBadges.forEach((b) => dispatch(unlockBadge({ badgeId: b.id })));
          clearTimeout(badgeTimerRef.current);
          badgeTimerRef.current = setTimeout(() => setBadgeModal({ visible: true, badge: newBadges[0] }), 2400);
        }
        debouncedSave();
      } finally {
        _opLock = false;
      }
    },
    [dispatch, user?.id, debouncedSave],
  );

  const syncStat = useCallback(
    (key, value) => {
      dispatch(setMaxStat({ key, value }));
      const updatedStats = { ...statsRef.current, [key]: Math.max(statsRef.current[key] || 0, value), level: levelRef.current.level };
      const newBadges = checkBadgeUnlocks(updatedStats, badgeIdsRef.current);
      if (newBadges.length > 0) {
        newBadges.forEach((b) => dispatch(unlockBadge({ badgeId: b.id })));
        clearTimeout(badgeTimerRef.current);
        badgeTimerRef.current = setTimeout(() => setBadgeModal({ visible: true, badge: newBadges[0] }), 2400);
      }
      debouncedSave();
    },
    [dispatch, debouncedSave],
  );

  const checkMilestone = useCallback(
    (streak) => {
      if (_opLock) return;
      _opLock = true;
      try {
        const unclaimed = getAllUnclaimedMilestones(streak, claimedRef.current);
        if (unclaimed.length === 0) return;

        let showMilestone = null;

        for (const milestone of unclaimed) {
          claimedRef.current = [...claimedRef.current, milestone.day];
          dispatch(claimStreakMilestone(milestone.day));
          claimMilestone(milestone.day).catch(() => {});
          dispatch(unlockBadge({ badgeId: milestone.badgeId }));
          dispatch(earnXP({ amount: milestone.xp }));
          if (user?.id) {
            enqueueXPLog(dispatch, user.id, milestone.xp, "streak_milestone");
            if (milestone.premiumDays > 0) grantPremiumDays(user.id, milestone.premiumDays).catch(() => {});
          }
          showMilestone = milestone;
        }

        if (showMilestone) {
          clearTimeout(milestoneTimerRef.current);
          milestoneTimerRef.current = setTimeout(() => setMilestoneModal({ visible: true, milestone: showMilestone }), 1500);
        }
        debouncedSave();
      } finally {
        _opLock = false;
      }
    },
    [dispatch, user?.id, debouncedSave],
  );

  useEffect(() => () => {
    clearTimeout(badgeTimerRef.current);
    clearTimeout(levelUpTimerRef.current);
    clearTimeout(milestoneTimerRef.current);
  }, []);

  const dismissXP = useCallback(() => setXpToast({ visible: false, amount: 0, multiplier: 1 }), []);
  const dismissBadge = useCallback(() => setBadgeModal({ visible: false, badge: null }), []);
  const dismissLevelUp = useCallback(() => setLevelUpModal({ visible: false, level: 0, title: "" }), []);
  const dismissMilestone = useCallback(() => setMilestoneModal({ visible: false, milestone: null }), []);

  return {
    reward, syncStat, checkMilestone,
    xpToast, dismissXP,
    badgeModal, dismissBadge,
    levelUpModal, dismissLevelUp,
    milestoneModal, dismissMilestone,
    level,
  };
}
