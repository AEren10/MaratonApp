import { Avatar } from "../design";
import { Press } from "../design/Press";
import { useUserActions } from "../../hooks/useUserActions";

// Siralama ve grup satirlarindaki avatar. Baskasina dokununca secenekler:
// arkadas ekle, bildir (ad/fotograf), engelle (Apple 1.2). Kendine dokunulmaz.
export function ReportableAvatar({ userId, name, image, size, color, you }) {
  const actions = useUserActions();
  const avatar = <Avatar init={(name || "?").slice(0, 2).toUpperCase()} image={image} size={size} color={color} />;
  if (you || !userId) return avatar;

  return (
    <Press
      haptic="tap"
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`${name || "Kullanıcı"}: arkadaş ekle, bildir ya da engelle`}
      onPress={() => actions.open({ id: userId, name, image })}
    >
      {avatar}
    </Press>
  );
}
