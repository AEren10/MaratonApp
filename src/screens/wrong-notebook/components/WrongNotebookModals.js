import { AppModal } from "../../../components/common/AppModal";
import { XPBoostToast } from "../../../components/common/XPBoostToast";

export function WrongNotebookModals({
  C,
  dismissXP,
  errorModal,
  onCloseError,
  onCloseShare,
  onShare,
  shareModal,
  xpToast,
}) {
  return (
    <>
      <AppModal
        visible={shareModal.visible}
        onClose={onCloseShare}
        icon="globe"
        iconColor={C.accent}
        title="Soruyu Paylaş"
        message="Bu yanlışı toplulukla paylaşmak ister misin?"
        actions={[
          { label: "Anonim Paylaş", icon: "users", color: C.accent, onPress: () => onShare(shareModal.item, true) },
          { label: "İsimle Paylaş", icon: "user", color: C.accent, onPress: () => onShare(shareModal.item, false) },
          { label: "Vazgeç", style: "cancel" },
        ]}
      />
      <AppModal
        visible={errorModal.visible}
        onClose={onCloseError}
        icon="alert"
        iconColor={C.danger}
        title="Hata"
        message={errorModal.message}
        actions={[{ label: "Tamam", style: "cancel" }]}
      />
      <XPBoostToast
        amount={xpToast.amount}
        visible={xpToast.visible}
        multiplier={xpToast.multiplier}
        onDismiss={dismissXP}
      />
    </>
  );
}
