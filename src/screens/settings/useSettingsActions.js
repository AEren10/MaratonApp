import { useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

// Ayarlar ekranindaki yikici aksiyonlar ve yardim. Ekran dosyasinda is
// mantigi durmaz (AGENTS.md); uyari metinleri buraya tasindi.
export function useSettingsActions() {
  const { logout, deleteAccount } = useAuth();
  const showAlert = useAlert();

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

  const handleDeleteAccount = useCallback(() => {
    H.warn();
    showAlert(
      "Hesabını Sil",
      "Hesabın ve tüm verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabımı Sil",
          style: "destructive",
          onPress: () => {
            deleteAccount()
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
              })
              .catch(() => showAlert("Hata", "Hesap silinemedi. Lütfen tekrar dene."));
          },
        },
      ]
    );
  }, [deleteAccount]);

  return { handleHelp, handleLogout, handleDeleteAccount };
}
