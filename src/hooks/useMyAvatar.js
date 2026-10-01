import { useEffect, useSyncExternalStore } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProfile } from "../supabase/profiles";
import { getMyAvatar, isMyAvatarLoaded, setMyAvatar, subscribeMyAvatar } from "../lib/myAvatarStore";

// Oturumdaki kullanicinin fotograf adresi; yoksa null. Ilk kullanan ekran
// profilden bir kez ceker, sonra yukleme/silme aninda her yere yansir.
export function useMyAvatar() {
  const { user } = useAuth();
  const uid = user?.id && user.id !== "dev" ? user.id : null;
  const snap = useSyncExternalStore(subscribeMyAvatar, getMyAvatar);

  useEffect(() => {
    if (!uid || isMyAvatarLoaded(uid)) return;
    let alive = true;
    getProfile(uid)
      .then((p) => { if (alive && !isMyAvatarLoaded(uid)) setMyAvatar(uid, p?.avatar_url); })
      .catch(() => {});
    return () => { alive = false; };
  }, [uid]);

  return uid && snap.userId === uid ? snap.url : null;
}
