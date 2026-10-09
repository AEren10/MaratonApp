import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import { countIncomingRequests } from "../supabase/friends";
import { SOCIAL_ENABLED } from "../constants/social";

// Bekleyen gelen arkadaslik istegi sayisi. Bildirim izni kapali ya da bildirim
// kacirildiysa istek Arkadaslar ekraninin icinde gizli kaliyordu: Ana Sayfa'daki
// sosyal ikonunda nokta ve Sosyal Hub'da satir bunu okur. Ekran odaklaninca tazelenir.
export function useIncomingRequestCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  useFocusEffect(useCallback(() => {
    if (!SOCIAL_ENABLED || !user?.id) return undefined;
    let cancelled = false;
    countIncomingRequests(user.id)
      .then((n) => { if (!cancelled) setCount(n); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]));
  return count;
}
