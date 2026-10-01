import { Avatar } from "../design";
import { Press } from "../design/Press";
import { useAlert } from "../../contexts/AlertContext";
import { reportAvatar } from "../../supabase/profiles";

// Siralama ve grup satirlarindaki avatar. Baskasinin FOTOGRAFINA dokununca
// "Fotografi bildir" sorulur (Apple 1.2: kullanici icerigi bildirilebilir).
// Kendi fotografin ve fotografsiz bas harf kutusu dokunulmaz.
export function ReportableAvatar({ userId, name, image, size, color, you }) {
  const showAlert = useAlert();
  const avatar = <Avatar init={(name || "?").slice(0, 2).toUpperCase()} image={image} size={size} color={color} />;
  if (!image || you || !userId) return avatar;

  const send = async () => {
    try {
      const result = await reportAvatar(userId);
      showAlert(
        "Teşekkürler",
        result === "removed" ? "Fotoğraf kaldırıldı." : "Bildirimin alındı. Fotoğraf incelenecek.",
      );
    } catch (_) {
      showAlert("Gönderilemedi", "Bağlantını kontrol edip yeniden dene.");
    }
  };

  return (
    <Press
      haptic="none"
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`${name || "Kullanıcı"} fotoğrafı, uygunsuzsa bildir`}
      onPress={() => showAlert("Fotoğrafı bildir", "Bu fotoğraf uygunsuz mu? Bildirirsen incelenir ve kaldırılabilir.", [
        { text: "Vazgeç", style: "cancel" },
        { text: "Bildir", style: "destructive", onPress: send },
      ])}
    >
      {avatar}
    </Press>
  );
}
