import { View, Text, Pressable } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

// Bölümler: Hesap | Çalışma | Sistem | Çıkış
const SECTIONS = [
  {
    title: "HESAP",
    items: [
      { icon: "user",  label: "Profil Düzenle", route: "EditProfile", color: "purple" },
      { icon: "mail",  label: "E-posta Değiştir", route: "EditEmail", color: "blue" },
      { icon: "lock",  label: "Şifre Değiştir", route: "ChangePassword", color: "coral" },
    ],
  },
  {
    title: "ÇALIŞMA",
    items: [
      { icon: "target",   label: "Hedeflerim",     route: "Goals",         color: "amber" },
      { icon: "chart",    label: "Net Simülatörü", route: "RankSimulator", color: "teal" },
      { icon: "layers",   label: "Yol Haritası",   route: "Roadmap",       color: "green" },
      { icon: "calendar", label: "Takvim",         route: "Calendar",      color: "blue" },
    ],
  },
  {
    title: "SOSYAL",
    items: [
      { icon: "users",  label: "Arkadaşlar", route: "Friends", color: "pink" },
    ],
  },
  {
    title: "SİSTEM",
    items: [
      { icon: "settings", label: "Ayarlar",     route: "Settings",              color: "muted" },
      { icon: "bell",     label: "Bildirimler", route: "NotificationsSettings", color: "muted" },
      { icon: "moon",     label: "Görünüm",     route: "Appearance",            color: "muted" },
      { icon: "lock",     label: "Gizlilik",    route: "Privacy",               color: "muted" },
      { icon: "info",     label: "Hakkında",    route: "About",                 color: "muted" },
    ],
  },
];

function MenuRow({ item, isLast, onNavigate, C }) {
  const iconColor = item.color === "muted" ? C.muted : (C[item.color] || C.text);
  const bg        = item.color === "muted" ? C.surface2 : (C[item.color] + "1A");

  return (
    <Pressable
      onPress={() => item.route && onNavigate?.(item.route)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        opacity: pressed ? 0.65 : 1,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: C.border,
      })}
    >
      <View style={{
        width: 34, height: 34, borderRadius: 11,
        backgroundColor: bg,
        alignItems: "center", justifyContent: "center",
        marginRight: 12,
      }}>
        <Icon name={item.icon} size={17} color={iconColor} />
      </View>
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>
        {item.label}
      </Text>
      <Icon name="chevR" size={15} color={C.muted} />
    </Pressable>
  );
}

export function SettingsMenu({ onNavigate, onLogout }) {
  const C = useC();
  return (
    <View style={{ gap: SPACING.lg }}>
      {SECTIONS.map((section) => (
        <View key={section.title}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: 8, paddingHorizontal: 4 }]}>
            {section.title}
          </Text>
          <View style={{
            backgroundColor: C.surface,
            borderRadius: RADIUS.xxl,
            borderWidth: 1,
            borderColor: C.border,
            overflow: "hidden",
          }}>
            {section.items.map((item, i) => (
              <MenuRow
                key={item.route}
                item={item}
                isLast={i === section.items.length - 1}
                onNavigate={onNavigate}
                C={C}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Çıkış — ayrı, kırmızı */}
      <Pressable
        onPress={onLogout}
        style={({ pressed }) => ({
          flexDirection: "row", alignItems: "center", justifyContent: "center",
          backgroundColor: C.red + "12",
          borderWidth: 1, borderColor: C.red + "30",
          borderRadius: RADIUS.xxl, paddingVertical: 14,
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="x" size={18} color={C.red} />
        <Text style={[TYPOGRAPHY.button, { color: C.red }]}>Çıkış Yap</Text>
      </Pressable>
    </View>
  );
}
