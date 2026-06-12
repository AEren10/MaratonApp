import { View, Text, Pressable } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { Icon } from "../../../components/design";

const ITEMS = [
  { icon: "calendar", label: "Takvim", route: "Calendar" },
  { icon: "target", label: "Hedeflerim", route: "Goals" },
  { icon: "settings", label: "Ayarlar", route: "Settings" },
  { icon: "bell", label: "Bildirimler", route: "NotificationsSettings" },
  { icon: "lock", label: "Gizlilik", route: "Privacy" },
  { icon: "info", label: "Hakkında", route: "About" },
  { icon: "x", label: "Çıkış Yap", danger: true },
];

export function SettingsMenu({ onNavigate, onLogout }) {
  return (
    <View
      style={{
        backgroundColor: C.surface,
        borderRadius: RADIUS.xxl,
        borderWidth: 1,
        borderColor: C.border,
        overflow: "hidden",
      }}
    >
      {ITEMS.map((item, i) => {
        const isLast = i === ITEMS.length - 1;
        const color = item.danger ? C.red : C.text;

        return (
          <Pressable
            key={i}
            onPress={() => {
              if (item.danger) {
                onLogout?.();
              } else if (item.route) {
                onNavigate?.(item.route);
              }
            }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: SPACING.lg,
              paddingVertical: 14,
              opacity: pressed ? 0.7 : 1,
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: C.border,
            })}
          >
            <Icon name={item.icon} size={20} color={color} />
            <Text
              style={[
                TYPOGRAPHY.bodyMedium,
                { color, flex: 1, marginLeft: SPACING.md },
              ]}
            >
              {item.label}
            </Text>
            {!item.danger && (
              <Icon name="chevR" size={16} color={C.muted} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
