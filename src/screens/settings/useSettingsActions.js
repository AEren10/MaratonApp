import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";

// Ayarlar ekranindaki yikici aksiyonlar ve yardim. Ekran dosyasinda is
// mantigi durmaz (AGENTS.md); uyari metinleri buraya tasindi.
export function useSettingsActions() {
  const { logout, deleteAccount } = useAuth();
  const showAlert = useAlert();
  const navigation = useNavigation();

  const handleHelp = useCallback(() => {
    showAlert("Yardım", "Soruların için bize ulaşabilirsin:\n\ndestek@maraton.app");
  }, []);

  const handleLogout = useCallback(() => {
    H.warn();
    showAlert("Çıkış Yap", "Hesabından çıkış yapmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: logout },
    ]);
  }, [logout]);

  // Tasarim "Hesap Silme": onay artik tam ekran (SİL yazilarak). Satirlar
  // o ekrana gider; asil silme deleteAccountNow'da.
  const handleDeleteAccount = useCallback(() => {
    H.warn();
    navigation.navigate(SCREENS.ACCOUNT_DELETE);
  }, [navigation]);

  const deleteAccountNow = useCallback(() => {
    H.warn();
    return deleteAccount()
      .then((result) => {
        // Hesap silindi ama bazı dosyalar kalmış olabilir. Sessiz
        // geçmek gizlilik metnindeki "tümü silinir" ifadesiyle
        // çelişirdi; kullanıcıya ne yapacağını söylüyoruz.
        if (result?.storageFailures?.length) {
          showAlert(
            "Hesabın silindi",
            "Bazı dosyaların sunucudan kaldırılamadı. Destek ekibine yazarsan kalanları biz temizleriz: destek@maraton.app",
          );
        }
        return true;
      })
      .catch((error) => {
        showAlert(
          "Hesap silinemedi",
          error?._safeMessage || "Hesap silinemedi. Lütfen tekrar dene.",
        );
        return false;
      });
  }, [deleteAccount, showAlert]);

  return { handleHelp, handleLogout, handleDeleteAccount, deleteAccountNow };
}
