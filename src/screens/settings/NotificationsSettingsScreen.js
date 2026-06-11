import { useState, useCallback } from "react";
import { View, Text, Pressable, Switch, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon, IconBox } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

const ITEMS = [
  { key: "daily", icon: "clock", color: C.amber, label: "Gunluk Hatirlatici" },
  { key: "trial", icon: "chart", color: C.blue, label: "Deneme Sonuclari" },
  { key: "streak", icon: "flame", color: C.red, label: "Seri Uyarisi" },
  { key: "news", icon: "zap", color: C.purple, label: "Yeni Ozellikler" },
];

const DEFAULTS = { daily: true, trial: true, streak: true, news: false };

export default function NotificationsSettingsScreen() {
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const [values, setValues] = useState(DEFAULTS);

  const toggle = (key) =>
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  // TODO: save to AsyncStorage

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Bildirimler</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={s.list}>
        {ITEMS.map((item) => (
          <View key={item.key} style={s.row}>
            <IconBox icon={item.icon} color={item.color} size={38} rounded={12} />
            <Text style={s.label}>{item.label}</Text>
            <Switch
              value={values[item.key]}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: C.border, true: C.amber + "80" }}
              thumbColor={values[item.key] ? C.amber : C.muted}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  row: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: C.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.sm,
  },
  label: { ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 },
});
