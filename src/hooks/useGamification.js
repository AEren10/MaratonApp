import { useState, useCallback, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  earnXP,
  unlockBadge,
  incrementStat,
  setMaxStat,
  selectBadgeIds,
  selectStats,
  selectLevel,
  selectXP,
} from "../store/slices/gamificationSlice";
import { calculateXP, checkBadgeUnlocks, getLevelForXP } from "../lib/xpEngine";
import { useAuth } from "../contexts/AuthContext";
import { logXP } from "../supabase/xp";

export function useGamification() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const badgeIds = useAppSelector(selectBadgeIds);
  const stats = useAppSelector(selectStats);
  const level = useAppSelector(selectLevel);
  const totalXP = useAppSelector(selectXP);

  const [xpToast, setXpToast] = useState({ visible: false, amount: 0 });
  const [badgeModal, setBadgeModal] = useState({ visible: false, badge: null });
  const [levelUpModal, setLevelUpModal] = useState({ visible: false, level: 0, title: "" });
  const badgeTimerRef = useRef(null);
  const levelUpTimerRef = useRef(null);

  const statsRef = useRef(stats);
  const badgeIdsRef = useRef(badgeIds);
  const levelRef = useRef(level);
  statsRef.current = stats;
  badgeIdsRef.current = badgeIds;
  levelRef.current = level;

  const reward = useCallback(
    (action, data = {}) => {
      const amount = calculateXP(action, data);
      if (amount <= 0) return;

      const prevLevel = getLevelForXP(totalXP);
      dispatch(earnXP({ amount }));
      logXP(user?.id, amount, action);
      setXpToast({ visible: true, amount });

      const newLevel = getLevelForXP(totalXP + amount);
      if (newLevel.level > prevLevel.level) {
        clearTimeout(levelUpTimerRef.current);
        levelUpTimerRef.current = setTimeout(() => setLevelUpModal({ visible: true, level: newLevel.level, title: newLevel.title }), 3000);
      }

      const updatedStats = { ...statsRef.current, level: levelRef.current.level };

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
    },
    [dispatch, user?.id],
  );

  useEffect(() => () => {
    clearTimeout(badgeTimerRef.current);
    clearTimeout(levelUpTimerRef.current);
  }, []);

  const dismissXP = useCallback(() => setXpToast({ visible: false, amount: 0 }), []);
  const dismissBadge = useCallback(() => setBadgeModal({ visible: false, badge: null }), []);
  const dismissLevelUp = useCallback(() => setLevelUpModal({ visible: false, level: 0, title: "" }), []);

  return { reward, xpToast, dismissXP, badgeModal, dismissBadge, levelUpModal, dismissLevelUp, level };
}
