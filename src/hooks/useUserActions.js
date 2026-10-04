import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../constants/screens";
import { useAlert } from "../contexts/AlertContext";
import { anchorOf, useAnchoredMenu } from "../contexts/AnchoredMenuContext";
import { blockUser, sendFriendRequest } from "../supabase/friends";
import { reportAvatar } from "../supabase/profiles";
import { reportContent } from "../supabase/moderation";
import { markBlocked } from "../lib/blockedUsers";

// Siralama / grup satirindaki baskasina dokununca: arkadas ekle, bildir,
// engelle (Apple 1.2: kullanici icerigi bildirilebilir ve engellenebilir).
export function useUserActions() {
  const showAlert = useAlert();
  const openMenu = useAnchoredMenu();
  const navigation = useNavigation();

  const viewProfile = useCallback((user) => {
    navigation.navigate(SCREENS.PUBLIC_PROFILE, { userId: user.id });
  }, [navigation]);

  const report = useCallback(async (user) => {
    try {
      await reportContent("user", user.id, user.image ? "photo" : "name");
      if (user.image) await reportAvatar(user.id).catch(() => null);
      showAlert("Teşekkürler", "Bildirimin alındı. 24 saat içinde incelenir; uygunsuzsa kaldırılır.");
    } catch (_) {
      showAlert("Gönderilemedi", "Bağlantını kontrol edip yeniden dene.");
    }
  }, [showAlert]);

  const block = useCallback((user) => {
    showAlert("Engellensin mi?", `${user.name || "Bu kişi"} artık sana istek gönderemez ve listelerinde görünmez.`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Engelle", style: "destructive",
        onPress: async () => {
          try {
            await blockUser(user.id);
            markBlocked(user.id);
          } catch (_) {
            showAlert("Engellenemedi", "Bağlantını kontrol edip yeniden dene.");
          }
        },
      },
    ]);
  }, [showAlert]);

  const addFriend = useCallback(async (user) => {
    try {
      await sendFriendRequest(user.id);
      showAlert("İstek gönderildi", `${user.name || "Arkadaşın"} kabul edince arkadaş listende görünecek.`);
    } catch (e) {
      showAlert("Gönderilemedi", e?.message || "Bağlantını kontrol edip yeniden dene.");
    }
  }, [showAlert]);

  // Dokunulan yerin yaninda kucuk menu (event verilirse oradan acilir).
  const open = useCallback((user, event) => {
    if (!user?.id) return;
    openMenu({
      anchor: anchorOf(event),
      title: user.name || "Öğrenci",
      items: [
        { label: "Profili gör", icon: "user", onPress: () => viewProfile(user) },
        { label: "Arkadaş ekle", icon: "plus", onPress: () => addFriend(user) },
        { label: "Bildir", icon: "flag", onPress: () => report(user) },
        { label: "Engelle", icon: "x", destructive: true, onPress: () => block(user) },
      ],
    });
  }, [addFriend, block, openMenu, report, viewProfile]);

  return { open };
}
