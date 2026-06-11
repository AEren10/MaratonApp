import { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

export default function AppearanceScreen() {
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Gorunum</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={s.content}>
        <Text style={s.sectionLabel}>TEMA</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={s.iconWrap}>
              <Icon name="moon" size={20} color={C.purple} />
            </View>
            <Text style={s.rowLabel}>Karanlik Mod</Text>
            <View style={s.activeDot} />
          </View>
        </View>

        <View style={s.infoBox}>
          <Icon name="info" size={16} color={C.sec} />
          <Text style={s.infoText}>
            Maraton su anda yalnizca karanlik tema destekliyor.
          </Text>
        </View>
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
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionLabel: { ...TYPOGRAPHY.label, color: C.muted, marginBottom: SPACING.sm },
  card: {
    backgroundColor: C.surface, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: C.amber + "40", padding: SPACING.lg,
  },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  iconWrap: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: C.purple + "20", alignItems: "center", justifyContent: "center",
  },
  rowLabel: { ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 },
  activeDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: C.green,
  },
  infoBox: {
    flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm,
    marginTop: SPACING.xl, paddingHorizontal: SPACING.xs,
  },
  infoText: { ...TYPOGRAPHY.caption, color: C.sec, flex: 1 },
});
