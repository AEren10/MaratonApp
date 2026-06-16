import { useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

const INFO_ROWS = [
  { label: "Gelistirici", value: "Maraton Team" },
  { label: "E-posta", value: "destek@maraton.app" },
  { label: "Web", value: "maraton.app" },
];

export default function AboutScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Hakkinda</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={s.center}>
        <View style={s.iconWrap}>
          <Icon name="zap" size={56} color={C.amber} />
        </View>
        <Text style={s.appName}>Maraton</Text>
        <Text style={s.version}>v1.0.0</Text>
      </View>

      <View style={s.infoCard}>
        {INFO_ROWS.map((row, i) => (
          <View
            key={row.label}
            style={[s.infoRow, i < INFO_ROWS.length - 1 && s.infoRowBorder]}
          >
            <Text style={s.infoLabel}>{row.label}</Text>
            <Text style={s.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <Text style={s.footer}>React Native ile yapildi</Text>
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
    center: { alignItems: "center", marginTop: SPACING.xxxl },
    iconWrap: {
      width: 88, height: 88, borderRadius: RADIUS.xxl,
      backgroundColor: C.amber + "18", alignItems: "center",
      justifyContent: "center", marginBottom: SPACING.lg,
    },
    appName: { ...TYPOGRAPHY.heading, color: C.text },
    version: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: SPACING.xs },
    infoCard: {
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      marginHorizontal: SPACING.lg, marginTop: SPACING.xxxl,
    },
    infoRow: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    },
    infoRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
    infoLabel: { ...TYPOGRAPHY.body, color: C.sec },
    infoValue: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    footer: {
      ...TYPOGRAPHY.caption, color: C.muted,
      textAlign: "center", marginTop: SPACING.xxxl,
    },
  });
}
