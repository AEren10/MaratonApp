import * as H from "../../lib/haptics";
import { leaveGroup, deleteGroup } from "../../supabase/groups";

export function handleGroupExit({ group, user, showAlert, setSelected, loadGroups }) {
  if (!group) return;
  H.warn();

  const isAdmin = group.role === "admin" || (user?.id && group.owner_id === user.id);
  const memberCount = Number(group.member_count ?? group.memberCount ?? 0);

  const performLeave = async () => {
    try {
      await leaveGroup(group.id, user?.id);
      setSelected?.((prev) => (prev?.id === group.id ? null : prev));
      loadGroups?.();
    } catch (e) {
      showAlert("Hata", e.message || "Gruptan ayrılınamadı.");
    }
  };

  const performDelete = async () => {
    try {
      await deleteGroup(group.id);
      H.success();
      setSelected?.((prev) => (prev?.id === group.id ? null : prev));
      await loadGroups?.();
      showAlert("Grup Kapatıldı", `"${group.name}" grubu kapatıldı.`);
    } catch (e) {
      showAlert("Hata", e.message || "Grup kapatılamadı.");
    }
  };

  if (isAdmin) {
    if (memberCount <= 1) {
      showAlert(
        "Grubu kapat",
        `"${group.name}" grubunun yöneticisisin ve grupta başka üye yok. Grubu kapatmak istiyor musun?`,
        [
          { text: "Vazgeç", style: "cancel" },
          { text: "Grubu kapat", style: "destructive", onPress: performDelete },
        ],
      );
      return;
    }

    showAlert(
      "Grup Yöneticisisin",
      `"${group.name}" grubunun yöneticisisin. Ayrılmak için yöneticiliği devretmeli veya grubu kapatmalısın.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Grubu kapat",
          style: "destructive",
          onPress: () => {
            showAlert(
              "Grubu kapat",
              `"${group.name}" grubunu ve tüm üyelerini silerek kapatmak istediğinden emin misin? Bu işlem geri alınamaz.`,
              [
                { text: "Vazgeç", style: "cancel" },
                { text: "Evet, grubu kapat", style: "destructive", onPress: performDelete },
              ],
            );
          },
        },
        {
          text: "Yöneticiliği devret",
          onPress: () => {
            showAlert(
              "Yöneticiliği Devret",
              "Yöneticilik devretme özelliği bir sonraki güncellemede kullanıma açılacaktır.",
            );
          },
        },
      ],
    );
    return;
  }

  showAlert("Gruptan ayrıl", `${group.name} grubundan ayrılmak istiyor musun?`, [
    { text: "İptal", style: "cancel" },
    { text: "Ayrıl", style: "destructive", onPress: performLeave },
  ]);
}
