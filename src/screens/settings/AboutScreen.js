import { useCallback, useMemo } from "react";
import { BrandMark } from "../../components/design/BrandMark";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, NAV_ICON } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Press } from "../../components/design/Press";
import Constants from "expo-constants";
import * as Updates from "expo-updates";

// Surum sabit "v1.0.0" yaziyordu. Uygulamadan okunur; OTA ile gelen paketin
// kisa kimligi de yaninda (destek: "hangi surumdesin").
const VERSION = Constants.expoConfig?.version || "1.0.0";
const OTA = Updates.updateId && !Updates.isEmbeddedLaunch ? ` · ${String(Updates.updateId).slice(0, 7)}` : "";

const INFO_ROWS = [
  { label: "Geliştirici", value: "Maraton Team" },
  { label: "E-posta", value: "destek@maratonapp.com" },
  { label: "Web", value: "maratonapp.com" },
];

export default function AboutScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Press haptic="none" onPress={goBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <Text style={s.headerTitle}>Hakkında</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={s.center}>
        <BrandMark width={150} word wordSize={22} color={C.text} direction="column" />
        <Text style={s.version}>{`v${VERSION}${OTA}`}</Text>
      </View>

      <View style={s.infoWrap}>
        {INFO_ROWS.map((row) => (
          <View key={row.label} style={[s.infoRow, { borderBottomColor: C.line }]}>
            <Text style={s.infoLabel}>{row.label}</Text>
            <Text style={s.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <Text style={s.footer}>Sınava hazırlananlar için yapıldı</Text>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: GUTTER, paddingVertical: STEP.s2,
    },
    headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
    center: { alignItems: "center", marginTop: STEP.s4 },
    iconWrap: {
      width: 88, height: 88, borderRadius: SHAPE.sheet,
      backgroundColor: C.accent + "18", alignItems: "center",
      justifyContent: "center", marginBottom: STEP.s3,
    },
    appName: { ...TYPOGRAPHY.heading, color: C.text },
    version: { ...TYPOGRAPHY.caption, color: C.text3, marginTop: STEP.s1 },
    infoWrap: {
      marginHorizontal: GUTTER, marginTop: STEP.s4,
    },
    infoRow: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", paddingVertical: STEP.s3,
      borderBottomWidth: 1,
    },
    infoLabel: { ...TYPOGRAPHY.body, color: C.text3 },
    infoValue: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    footer: {
      ...TYPOGRAPHY.caption, color: C.text3,
      textAlign: "center", marginTop: STEP.s5,
    },
  });
}
