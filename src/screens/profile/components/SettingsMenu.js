import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { usePremium } from "../../../contexts/PremiumContext";

function MenuRow({ item, isLast, onNavigate, onGated, C }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={() => {
        if (!item.route) return;
        if (item.premiumKey && onGated) { onGated(item.premiumKey, item.route); return; }
        onNavigate?.(item.route);
      }}
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
        backgroundColor: (item.color || C.muted) + "18",
        alignItems: "center", justifyContent: "center",
        marginRight: 12,
      }}>
        <Icon name={item.icon} size={17} color={item.color || C.sec} />
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
  const { checkFeature, showPaywall } = usePremium();
  const SECTIONS = useMemo(() => [
    {
      title: "HESAP",
      items: [
        { icon: "user",  label: "Profil Düzenle", route: SCREENS.EDIT_PROFILE, color: C.blue },
        { icon: "mail",  label: "E-posta Değiştir", route: SCREENS.EDIT_EMAIL, color: C.teal },
        { icon: "lock",  label: "Şifre Değiştir", route: SCREENS.CHANGE_PASSWORD, color: C.amber },
      ],
    },
    {
      title: "ÇALIŞMA",
      items: [
        { icon: "crown",    label: "Maraton Pro",       route: SCREENS.PAYWALL,         color: C.accent },
        { icon: "target",   label: "Hedeflerim",       route: SCREENS.GOALS,           color: C.green },
        { icon: "clock",    label: "Çalışma Geçmişi",  route: SCREENS.STUDY_LOG,       color: C.blue },
        { icon: "hash",     label: "Konu Kartları",     route: SCREENS.TOPIC_CARDS,     color: C.brandLight },
        { icon: "chart",    label: "Net Simülatörü",    route: SCREENS.RANK_SIMULATOR,  color: C.pink,  premiumKey: "rank_simulator" },
        { icon: "layers",   label: "Yol Haritası",      route: SCREENS.ROADMAP,         color: C.teal,  premiumKey: "detailed_roadmap" },
        { icon: "calendar", label: "Takvim",            route: SCREENS.CALENDAR,        color: C.amber },
      ],
    },
    {
      title: "SOSYAL",
      items: [
        { icon: "users",  label: "Arkadaşlar", route: SCREENS.FRIENDS, color: C.pink },
      ],
    },
    {
      title: "SİSTEM",
      items: [
        { icon: "settings", label: "Ayarlar", route: SCREENS.SETTINGS, color: C.muted },
      ],
    },
  ], [C]);
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
                onGated={(key, route) => {
                  if (checkFeature(key)) { onNavigate?.(route); } else { showPaywall(); }
                }}
                C={C}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Çıkış — ayrı, kırmızı */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Çıkış Yap"
        accessibilityHint="Hesabından çıkış yapar"
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
