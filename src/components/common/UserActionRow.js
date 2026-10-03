import { View } from "react-native";
import { Press } from "../design/Press";
import { useUserActions } from "../../hooks/useUserActions";

// Siralama / grup uyesi satiri: satirin TAMAMI dokunulabilir. Eskiden yalniz
// 34px avatar aciyordu; isme basan kullanici "Bildir" bulamiyordu (Apple 1.2).
export function UserActionRow({ userId, name, image, you, style, children }) {
  const actions = useUserActions();
  if (you || !userId) return <View style={style}>{children}</View>;
  return (
    <Press
      haptic="tap"
      style={style}
      accessibilityRole="button"
      accessibilityLabel={`${name || "Kullanıcı"}: profili gör, arkadaş ekle, bildir veya engelle`}
      onPress={() => actions.open({ id: userId, name, image })}
    >
      {children}
    </Press>
  );
}
