import { Press } from "../../../components/design/Press";
import { Icon } from "../../../components/design/Icon";
import { useAlert } from "../../../contexts/AlertContext";
import { useC } from "../../../contexts/ThemeContext";
import { reportContent } from "../../../supabase/moderation";
import { CONTROL, NAV_ICON } from "../../../themes/tokens";

// Grup basliginda "..." -> grubu bildir (ad ya da aciklama uygunsuzsa).
export function GroupReportButton({ group }) {
  const C = useC();
  const showAlert = useAlert();
  if (!group?.id) return null;

  const send = async () => {
    try {
      await reportContent("group", group.id, "name");
      showAlert("Teşekkürler", "Bildirimin alındı. 24 saat içinde incelenir; uygunsuzsa kaldırılır.");
    } catch (_) {
      showAlert("Gönderilemedi", "Bağlantını kontrol edip yeniden dene.");
    }
  };

  return (
    <Press
      haptic="tap"
      accessibilityRole="button"
      accessibilityLabel="Grup seçenekleri"
      style={{ width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" }}
      onPress={() => showAlert(group.name || "Grup", "Grubun adı ya da açıklaması uygunsuz mu?", [
        { text: "Grubu bildir", style: "destructive", onPress: send },
        { text: "Vazgeç", style: "cancel" },
      ])}
    >
      <Icon name="more" size={NAV_ICON.action} color={C.text2} />
    </Press>
  );
}
