import { useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon, IconBox } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useTheme, useC } from "../../contexts/ThemeContext";

export default function AppearanceScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const OPTIONS = useMemo(() => ([
    { key: "system", icon: "settings", label: "Sistem", desc: "Cihazımın temasını kullan", color: C.blue },
    { key: "dark", icon: "moon", label: "Karanlık", desc: "Gözlere yumuşak, gece dostu", color: C.purple },
    { key: "light", icon: "sun", label: "Aydınlık", desc: "Gün ışığında daha okunaklı", color: C.amber },
  ]), [C]);
  const navigation = useNavigation();
  const { pref, setPref } = useTheme();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Görünüm</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={s.content}>
        <Text style={s.sectionLabel}>TEMA</Text>
        {OPTIONS.map((opt) => {
          const active = pref === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setPref(opt.key)}
              style={[s.card, { borderColor: active ? opt.color : C.border }]}
            >
              <IconBox icon={opt.icon} color={opt.color} size={36} rounded={10} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>{opt.label}</Text>
                <Text style={s.rowDesc}>{opt.desc}</Text>
              </View>
              <View
                style={[
                  s.radio,
                  { borderColor: active ? opt.color : C.border },
                ]}
              >
                {active && <View style={[s.radioInner, { backgroundColor: opt.color }]} />}
              </View>
            </Pressable>
          );
        })}

        <View style={s.infoBox}>
          <Icon name="info" size={16} color={C.sec} />
          <Text style={s.infoText}>
            Tercihin kaydedildi. Light tema ileri sürümde tüm ekranlara uygulanacak; şu an durum çubuğu ve önizleme alanlarında etkili.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
    content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
    sectionLabel: { ...TYPOGRAPHY.label, color: C.muted, marginBottom: SPACING.sm },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      backgroundColor: C.surface,
      borderRadius: RADIUS.xl,
      borderWidth: 1.5,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    rowLabel: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    rowDesc: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: 2 },
    radio: {
      width: 22, height: 22, borderRadius: 11,
      borderWidth: 2,
      alignItems: "center", justifyContent: "center",
    },
    radioInner: { width: 12, height: 12, borderRadius: 6 },
    infoBox: {
      flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm,
      marginTop: SPACING.xl, paddingHorizontal: SPACING.xs,
    },
    infoText: { ...TYPOGRAPHY.caption, color: C.sec, flex: 1 },
  });
}
