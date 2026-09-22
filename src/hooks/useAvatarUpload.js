import { useState, useEffect, useMemo, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { uploadAvatar, getAvatarUrl } from "../supabase/storage";
import { getProfile, updateProfile } from "../supabase/profiles";
import { useAlert } from "../contexts/AlertContext";
import * as H from "../lib/haptics";

// Profil fotografi secme + yukleme akisi. Is mantigi ProfileHero'dan
// buraya tasindi (AGENTS: is mantigi src/hooks'ta yasar).
export function useAvatarUpload() {
  const { user } = useAuth();
  const showAlert = useAlert();
  const isFocused = useIsFocused();
  const [avatarUri, setAvatarUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isFocused || !user?.id || user.id === "dev") return;
    getProfile(user.id)
      .then((p) => { setAvatarUri(p?.avatar_url || null); })
      .catch(() => {});
  }, [user?.id, isFocused]);

  const avatarSource = useMemo(() => (avatarUri ? { uri: avatarUri } : null), [avatarUri]);

  const handlePicked = async (localUri) => {
    setAvatarUri(localUri);
    setUploading(true);
    try {
      const path = await uploadAvatar(user.id, localUri);
      const url = getAvatarUrl(path);
      const stampedUrl = url ? `${url}?t=${Date.now()}` : url;
      await updateProfile(user.id, { avatar_url: stampedUrl });
      H.success();
      setAvatarUri(stampedUrl);
    } catch (e) {
      showAlert("Hata", "Avatar yüklenirken bir sorun oluştu.\n\n" + (e?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = useCallback(async () => {
    if (!user?.id) return;
    setUploading(true);
    try {
      await updateProfile(user.id, { avatar_url: null });
      setAvatarUri(null);
      H.success();
    } catch (e) {
      showAlert("Hata", "Avatar silinirken bir sorun oluştu.\n\n" + (e?.message || ""));
    } finally {
      setUploading(false);
    }
  }, [user?.id, showAlert]);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { showAlert("İzin gerekli", "Galeri erişimi için izin ver."); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.length) handlePicked(res.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { showAlert("İzin gerekli", "Kamera erişimi için izin ver."); return; }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.length) handlePicked(res.assets[0].uri);
  };

  const pickAvatar = () => {
    if (!user?.id) return;
    H.medium();
    const actions = [
      { text: "Kamera", onPress: pickFromCamera },
      { text: "Galeri", onPress: pickFromGallery },
    ];
    if (avatarUri) {
      actions.push({ text: "Fotoğrafı Kaldır", style: "destructive", onPress: removeAvatar });
    }
    actions.push({ text: "İptal", style: "cancel" });
    showAlert("Profil Fotoğrafı", "Nereden eklemek istersin?", actions);
  };

  return { avatarUri, avatarSource, uploading, pickAvatar, removeAvatar };
}
