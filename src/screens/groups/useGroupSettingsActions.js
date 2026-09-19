import { useNavigation } from "@react-navigation/native";
import { useAlert } from "../../contexts/AlertContext";
import { SCREENS } from "../../constants/screens";
import { useGroupActions } from "../../hooks/useGroupActions";
import * as H from "../../lib/haptics";

export function useGroupSettingsActions({
  groupId,
  setGroupName,
  setGroupCode,
  setGroup,
  setLeaderboard,
}) {
  const navigation = useNavigation();
  const showAlert = useAlert();
  const {
    updateGroupName,
    regenerateGroupCode,
    removeMember,
    leaveGroup,
    deleteGroup,
    busy,
  } = useGroupActions();

  const handleSaveName = async (newName) => {
    try {
      await updateGroupName(groupId, newName);
      setGroupName(newName);
      setGroup((prev) => ({ ...prev, name: newName }));
      H.success();
    } catch {
      showAlert("Hata", "Grup adı güncellenemedi.");
    }
  };

  const handleRegenerateCode = () => {
    showAlert(
      "Kodu Yenile",
      "Mevcut katılım kodu geçersiz kılınacak ve yeni bir kod üretilecek. Onaylıyor musun?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Kodu Yenile",
          style: "destructive",
          onPress: async () => {
            try {
              const nextCode = await regenerateGroupCode(groupId);
              setGroupCode(nextCode);
              setGroup((prev) => ({ ...prev, code: nextCode }));
              H.success();
            } catch {
              showAlert("Hata", "Kod yenilenemedi.");
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = (member) => {
    showAlert("Üye Çıkar", `${member.display_name} gruptan çıkarılsın mı?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkar",
        style: "destructive",
        onPress: async () => {
          try {
            await removeMember(groupId, member.user_id);
            setLeaderboard((prev) => prev.filter((m) => m.user_id !== member.user_id));
            H.success();
          } catch {
            showAlert("Hata", "Üye çıkarılamadı.");
          }
        },
      },
    ]);
  };

  const handleLeave = () => {
    showAlert("Gruptan Ayrıl", "Bu gruptan ayrılmak istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Ayrıl",
        style: "destructive",
        onPress: async () => {
          try {
            await leaveGroup(groupId);
            H.success();
            navigation.navigate(SCREENS.GROUPS);
          } catch {
            showAlert("Hata", "Gruptan ayrılınamadı.");
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    showAlert(
      "Grubu Sil",
      "Grup ve tüm üye verileri kalıcı olarak silinecek. Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Grubu Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              H.success();
              navigation.navigate(SCREENS.GROUPS);
            } catch {
              showAlert("Hata", "Grup silinemedi.");
            }
          },
        },
      ]
    );
  };

  return {
    handleSaveName,
    handleRegenerateCode,
    handleRemoveMember,
    handleLeave,
    handleDelete,
    busy,
  };
}
