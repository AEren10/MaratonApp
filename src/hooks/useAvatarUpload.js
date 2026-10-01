import { useState, useMemo, useCallback } from "react";
import { ActionSheetIOS, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { uploadAvatar, getAvatarUrl } from "../supabase/storage";
import { updateProfile } from "../supabase/profiles";
import { setMyAvatar } from "../lib/myAvatarStore";
import { useMyAvatar } from "./useMyAvatar";
import { useAlert } from "../contexts/AlertContext";
import * as H from "../lib/haptics";

// Profil fotografi secme + yukleme akisi. Is mantigi ProfileHero'dan
// buraya tasindi (AGENTS: is mantigi src/hooks'ta yasar).
const PICKER_DELAY_MS = 300;

export function useAvatarUpload() {
  const { user } = useAuth();
  const showAlert = useAlert();
  const saved = useMyAvatar();
  // Yukleme surerken yerel dosya onizlenir; bitince ortak kaynaga yazilir.
  const [pending, setPending] = useState(null);
  const [uploading, setUploading] = useState(false);
  const avatarUri = pending || saved;

  const avatarSource = useMemo(() => (avatarUri ? { uri: avatarUri } : null), [avatarUri]);

  const handlePicked = async (localUri) => {
    setPending(localUri);
    setUploading(true);
    try {
      const path = await uploadAvatar(user.id, localUri);
      const url = getAvatarUrl(path);
      const stampedUrl = url ? `${url}?t=${Date.now()}` : url;
      await updateProfile(user.id, { avatar_url: stampedUrl });
      setMyAvatar(user.id, stampedUrl);
      H.success();
    } catch (e) {
      // Fotografi birden cok kez bildirilip kaldirilan hesapta yukleme kapali.
      if (String(e?.message || "").includes("avatar_locked")) {
        showAlert("Fotoğraf eklenemiyor", "Bu hesapta profil fotoğrafı bildirimler nedeniyle kapatıldı.");
      } else showAlert("Hata", "Avatar yüklenirken bir sorun oluştu.\n\n" + (e?.message || ""));
    } finally {
      setPending(null);
      setUploading(false);
    }
  };

  const removeAvatar = useCallback(async () => {
    if (!user?.id) return;
    setUploading(true);
    try {
      await updateProfile(user.id, { avatar_url: null });
      setMyAvatar(user.id, null);
      H.success();
    } catch (e) {
      showAlert("Hata", "Avatar silinirken bir sorun oluştu.\n\n" + (e?.message || ""));
    } finally {
      setUploading(false);
    }
  }, [user?.id, showAlert]);

  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { showAlert("İzin gerekli", "Galeri erişimi için izin ver."); return; }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [1, 1],
      });
      if (!res.canceled && res.assets?.length) handlePicked(res.assets[0].uri);
    } catch (e) {
      showAlert("Hata", "Galeri açılırken bir sorun oluştu.");
    }
  };

  const pickFromCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { showAlert("İzin gerekli", "Kamera erişimi için izin ver."); return; }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [1, 1],
      });
      if (!res.canceled && res.assets?.length) handlePicked(res.assets[0].uri);
    } catch (e) {
      showAlert("Hata", "Kamera açılırken bir sorun oluştu.");
    }
  };

  const pickAvatar = () => {
    if (!user?.id) {
      showAlert("Giriş Gerekli", "Profil fotoğrafını değiştirmek için oturum açmalısın.");
      return;
    }
    H.medium();

    if (Platform.OS === "ios") {
      const options = ["İptal", "Kamera", "Galeri"];
      if (avatarUri) options.push("Fotoğrafı Kaldır");

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Profil Fotoğrafı",
          message: "Nereden eklemek istersin?",
          options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: avatarUri ? 3 : undefined,
        },
        (buttonIndex) => {
          // Secim menusu kapanirken secici acilirsa iOS iki sunumu cakistirip
          // dokunmayi kilitleyebiliyor: menu kapandiktan sonra ac.
          if (buttonIndex === 1) setTimeout(pickFromCamera, PICKER_DELAY_MS);
          else if (buttonIndex === 2) setTimeout(pickFromGallery, PICKER_DELAY_MS);
          else if (buttonIndex === 3 && avatarUri) removeAvatar();
        }
      );
      return;
    }

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
