import { useEffect, useState } from "react";

import { isProfileSettling, PROFILE_SETTLE_MAX_MS } from "../lib/profileSettleGate";

// Profil okumasi surerken true (bkz. lib/profileSettleGate). Sure dolunca
// o kullanici icin kapi acilir.
export function useProfileSettleGate({ userId, profileReadyFor, examType }) {
  const [expiredFor, setExpiredFor] = useState(null);
  const waiting = isProfileSettling({ userId, profileReadyFor, examType, expiredFor });

  useEffect(() => {
    if (!waiting) return undefined;
    const timer = setTimeout(() => setExpiredFor(userId), PROFILE_SETTLE_MAX_MS);
    return () => clearTimeout(timer);
  }, [waiting, userId]);

  return waiting;
}
