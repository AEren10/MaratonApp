import { useCallback, useEffect, useState } from "react";

import { EVENTS } from "../constants/analytics";
import { track } from "../lib/analytics";
import { sendFriendRequest } from "../supabase/friends";
import { getPublicProfile } from "../supabase/publicProfiles";

export function usePublicProfile(userId, showAlert) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getPublicProfile(userId);
      setProfile(next);
      track(EVENTS.PUBLIC_PROFILE_VIEWED, { relationship: next.relationshipStatus });
    } catch (e) {
      setError(e?.message || "Profil yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const addFriend = useCallback(async () => {
    if (!profile || sending) return;
    setSending(true);
    try {
      await sendFriendRequest(profile.id);
      setProfile((current) => ({ ...current, relationshipStatus: "outgoing_pending" }));
      track(EVENTS.FRIEND_REQUEST_SENT, { source: "public_profile" });
      showAlert?.("İstek gönderildi", `${profile.name} kabul edince arkadaş listende görünecek.`);
    } catch (e) {
      showAlert?.("Gönderilemedi", e?.message || "Bağlantını kontrol edip yeniden dene.");
    } finally {
      setSending(false);
    }
  }, [profile, sending, showAlert]);

  return { profile, loading, sending, error, retry: load, addFriend };
}
