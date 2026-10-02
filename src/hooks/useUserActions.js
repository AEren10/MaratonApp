import { useCallback } from "react";

import { useAlert } from "../contexts/AlertContext";
import { blockUser, sendFriendRequest } from "../supabase/friends";
import { reportAvatar } from "../supabase/profiles";
import { reportContent } from "../supabase/moderation";
import { markBlocked } from "../lib/blockedUsers";

// Siralama / grup satirindaki baskasina dokununca: arkadas ekle, bildir,
// engelle (Apple 1.2: kullanici icerigi bildirilebilir ve engellenebilir).
export function useUserActions() {
  const showAlert = useAlert();

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

  const open = useCallback((user) => {
    if (!user?.id) return;
    showAlert(user.name || "Öğrenci", null, [
      { text: "Arkadaş ekle", onPress: () => addFriend(user) },
      { text: "Bildir", onPress: () => report(user) },
      { text: "Engelle", style: "destructive", onPress: () => block(user) },
      { text: "Vazgeç", style: "cancel" },
    ]);
  }, [addFriend, block, report, showAlert]);

  return { open };
}
