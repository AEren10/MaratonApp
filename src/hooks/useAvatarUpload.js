import { useState, useEffect, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
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
  const [avatarUri, setAvatarUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    getProfile(user.id)
      .then((p) => { if (p?.avatar_url) setAvatarUri(p.avatar_url); })
      .catch(() => {});
  }, [user?.id]);

  const avatarSource = useMemo(() => (avatarUri ? { uri: avatarUri } : null), [avatarUri]);

  const handlePicked = async (localUri) => {
    setAvatarUri(localUri);
    setUploading(true);
    try {
      const path = await uploadAvatar(user.id, localUri);
      const url = getAvatarUrl(path);
      await updateProfile(user.id, { avatar_url: url });
      H.success();
      setAvatarUri(url + "?t=" + Date.now());
    } catch (e) {
      showAlert("Hata", "Avatar yüklenirken bir sorun oluştu.\n\n" + (e?.message || ""));
    } finally {
      setUploading(false);
    }
  };

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
    showAlert("Profil Fotoğrafı", "Nereden eklemek istersin?", [
      { text: "Kamera", onPress: pickFromCamera },
      { text: "Galeri", onPress: pickFromGallery },
      { text: "İptal", style: "cancel" },
    ]);
  };

  return { avatarUri, avatarSource, uploading, pickAvatar };
}
