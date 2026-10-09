import { Press } from "../../../components/design/Press";
import { Icon } from "../../../components/design/Icon";
import { useAlert } from "../../../contexts/AlertContext";
import { anchorOf, useAnchoredMenu } from "../../../contexts/AnchoredMenuContext";
import { useC } from "../../../contexts/ThemeContext";
import { reportContent } from "../../../supabase/moderation";
import { CONTROL, NAV_ICON } from "../../../themes/tokens";

// Grup basliginda "..." -> dokunulan yerde kucuk menu: kodu paylas, gruptan
// ayril, grubu bildir. Eskiden yalniz "bildir" uyarisi aciyordu ve uyari
// uygulama kokunden acildigi icin bu Modal'in arkasinda kaliyordu (gorunmuyordu).
export function GroupReportButton({ group, onShare, onLeave }) {
  const C = useC();
  const showAlert = useAlert();
  const openMenu = useAnchoredMenu();
  if (!group?.id) return null;

  const report = () => showAlert(group.name || "Grup", "Grubun adı ya da açıklaması uygunsuz mu?", [
    { text: "Vazgeç", style: "cancel" },
    {
      text: "Grubu bildir", style: "destructive",
      onPress: async () => {
        try {
          await reportContent("group", group.id, "name");
          showAlert("Teşekkürler", "Bildirimin alındı. 24 saat içinde incelenir; uygunsuzsa kaldırılır.");
        } catch (_) {
          showAlert("Gönderilemedi", "Bağlantını kontrol edip yeniden dene.");
        }
      },
    },
  ]);

  const open = (event) => openMenu({
    anchor: anchorOf(event),
    title: group.name || "Grup",
    items: [
      onShare ? { label: "Kodu paylaş", icon: "share", onPress: () => onShare(group) } : null,
      onLeave ? { label: "Gruptan ayrıl", icon: "arrowR", destructive: true, onPress: () => onLeave(showAlert) } : null,
      { label: "Grubu bildir", icon: "flag", onPress: report },
    ].filter(Boolean),
  });

  return (
    <Press
      haptic="tap"
      accessibilityRole="button"
      accessibilityLabel="Grup seçenekleri"
      style={{ width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" }}
      onPress={open}
    >
      <Icon name="more" size={NAV_ICON.action} color={C.text2} />
    </Press>
  );
}
