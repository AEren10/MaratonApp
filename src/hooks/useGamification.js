import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  earnXP,
  unlockBadge,
  incrementStat,
  setMaxStat,
  selectBadgeIds,
  selectStats,
  selectLevel,
} from "../store/slices/gamificationSlice";
import { calculateXP, checkBadgeUnlocks } from "../lib/xpEngine";
import { useAuth } from "../contexts/AuthContext";
import { logXP } from "../supabase/xp";

export function useGamification() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const badgeIds = useAppSelector(selectBadgeIds);
  const stats = useAppSelector(selectStats);
  const level = useAppSelector(selectLevel);

  const [xpToast, setXpToast] = useState({ visible: false, amount: 0 });
  const [badgeModal, setBadgeModal] = useState({ visible: false, badge: null });

  const reward = useCallback(
    (action, data = {}) => {
      const amount = calculateXP(action, data);
      if (amount <= 0) return;

      dispatch(earnXP({ amount }));
      logXP(user?.id, amount, action); // gerçek XP defterine yaz (lig için)
      setXpToast({ visible: true, amount });

      const updatedStats = { ...stats, level: level.level };

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

      const newBadges = checkBadgeUnlocks(updatedStats, badgeIds);
      if (newBadges.length > 0) {
        newBadges.forEach((b) => dispatch(unlockBadge({ badgeId: b.id })));
        setTimeout(() => setBadgeModal({ visible: true, badge: newBadges[0] }), 2400);
      }
    },
    [dispatch, badgeIds, stats, level, user?.id],
  );

  const dismissXP = useCallback(() => setXpToast({ visible: false, amount: 0 }), []);
  const dismissBadge = useCallback(() => setBadgeModal({ visible: false, badge: null }), []);

  return { reward, xpToast, dismissXP, badgeModal, dismissBadge, level };
}
