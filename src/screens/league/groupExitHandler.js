import * as H from "../../lib/haptics";
import { leaveGroup, deleteGroup, transferGroupAdmin, groupLeaderboard } from "../../supabase/groups";

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

  const performTransferAndLeave = async (targetMember) => {
    try {
      const targetId = targetMember.id || targetMember.user_id;
      await transferGroupAdmin(group.id, targetId);
      await leaveGroup(group.id, user?.id);
      H.success();
      setSelected?.((prev) => (prev?.id === group.id ? null : prev));
      await loadGroups?.();
      showAlert(
        "Yöneticilik Devredildi",
        `Yöneticilik "${targetMember.name}" adlı üyeye devredildi ve gruptan ayrıldın.`
      );
    } catch (e) {
      showAlert("Hata", e.message || "Yöneticilik devredilemedi.");
    }
  };

  const handleTransferChoice = async () => {
    let list = [];
    try {
      const board = await groupLeaderboard(group.id, user?.id);
      list = board?.list || [];
    } catch {
      list = [];
    }
    const candidates = list.filter((m) => !m.you && (m.id || m.user_id) !== user?.id);

    if (candidates.length === 0) {
      showAlert(
        "Üye bulunamadı",
        "Yöneticiliği devredecek başka üye bulunamadı. Grubu kapatabilirsin."
      );
      return;
    }

    if (candidates.length === 1) {
      const candidate = candidates[0];
      showAlert(
        "Yöneticiliği devret",
        `Yöneticilik "${candidate.name}" adlı üyeye devredilecek ve gruptan ayrılacaksın. Onaylıyor musun?`,
        [
          { text: "Vazgeç", style: "cancel" },
          { text: "Devret ve ayrıl", onPress: () => performTransferAndLeave(candidate) },
        ]
      );
      return;
    }

    const actions = candidates.slice(0, 4).map((c) => ({
      text: c.name,
      onPress: () => {
        showAlert(
          "Yöneticiliği devret",
          `Yöneticiliği "${c.name}" adlı üyeye devredip gruptan ayrılmak istiyor musun?`,
          [
            { text: "Vazgeç", style: "cancel" },
            { text: "Devret ve ayrıl", onPress: () => performTransferAndLeave(c) },
          ]
        );
      },
    }));

    showAlert(
      "Yeni yönetici seç",
      "Yöneticiliği devretmek istediğin üyeyi seç:",
      [
        { text: "Vazgeç", style: "cancel" },
        ...actions,
      ]
    );
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
          onPress: handleTransferChoice,
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
