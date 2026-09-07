import { useEffect } from "react";

export function useHomeGamificationBridge({ checkMilestone, streak, syncStat }) {
  useEffect(() => {
    if (streak > 0) syncStat("streak", streak);
  }, [streak, syncStat]);

  useEffect(() => {
    if (streak > 0) checkMilestone(streak);
  }, [streak, checkMilestone]);
}
