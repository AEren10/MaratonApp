import { useCallback, useEffect, useState } from "react";

import { EVENTS } from "../constants/analytics";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { track } from "../lib/analytics";
import { getProfile } from "../supabase/profiles";
import { updatePublicProfileVisibility } from "../supabase/publicProfiles";

export function useProfileVisibility() {
  const { user } = useAuth();
  const showAlert = useAlert();
  const [groupVisible, setGroupVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || user.id === "dev") { setLoading(false); return; }
    getProfile(user.id)
      .then((profile) => setGroupVisible(profile?.public_profile_visibility !== "friends_only"))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const update = useCallback(async (next) => {
    const previous = groupVisible;
    setGroupVisible(next);
    try {
      const visibility = next ? "group_and_friends" : "friends_only";
      await updatePublicProfileVisibility(user.id, visibility);
      track(EVENTS.PROFILE_VISIBILITY_CHANGED, { visibility });
    } catch (_) {
      setGroupVisible(previous);
      showAlert("Kaydedilemedi", "Profil görünürlüğü değiştirilemedi. Tekrar dene.");
    }
  }, [groupVisible, showAlert, user?.id]);

  return { groupVisible, loading, update };
}
