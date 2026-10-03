import { useCallback, useEffect, useRef, useState } from "react";

import { EVENTS } from "../constants/analytics";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { track } from "../lib/analytics";
import { getProfile } from "../supabase/profiles";
import { updatePublicProfileVisibility } from "../supabase/publicProfiles";

export function useProfileVisibility() {
  const { user } = useAuth();
  const showAlert = useAlert();
  const [groupVisible, setGroupVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const writeLock = useRef(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev") { setLoading(false); return; }
    getProfile(user.id)
      .then((profile) => setGroupVisible(profile?.public_profile_visibility !== "friends_only"))
      .catch(() => setGroupVisible(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const update = useCallback(async (next) => {
    if (writeLock.current || groupVisible == null) return;
    writeLock.current = true;
    const previous = groupVisible;
    setGroupVisible(next);
    setSaving(true);
    try {
      const visibility = next ? "group_and_friends" : "friends_only";
      await updatePublicProfileVisibility(user.id, visibility);
      track(EVENTS.PROFILE_VISIBILITY_CHANGED, { visibility });
    } catch (_) {
      setGroupVisible(previous);
      showAlert("Kaydedilemedi", "Profil görünürlüğü değiştirilemedi. Tekrar dene.");
    } finally {
      writeLock.current = false;
      setSaving(false);
    }
  }, [groupVisible, showAlert, user?.id]);

  return { groupVisible, loading, saving, update };
}
