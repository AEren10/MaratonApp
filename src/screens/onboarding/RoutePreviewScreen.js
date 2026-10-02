import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { Icon, Button, Press } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, NAV_ICON, CONTROL } from "../../themes/tokens";
import { useRoutePreviewForm } from "./useRoutePreviewForm";
import { PreviewChoices } from "./components/PreviewChoices";
import { PreviewResult } from "./components/PreviewResult";

// KAYIT ONCESI ROTA ONIZLEMESI. Kullanici taahhut (hesap) vermeden once
// kendi rotasinin ilk duraklarini gorur; "Rotami kaydet" hesabi acar.
// Kayit ekranindaki "Rotan hazir" cumlesi bu ekran sayesinde dogru.
function RoutePreviewInner() {
  const C = useC();
  const f = useRoutePreviewForm();
  const done = Boolean(f.preview);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        {done ? (
          <Press haptic="none" onPress={f.back} hitSlop={12} accessibilityLabel="Seçimlere dön" style={s.side}>
            <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
          </Press>
        ) : <View style={s.side} />}
        <Press haptic="tap" onPress={f.login} accessibilityRole="button" style={[s.side, s.login]}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Hesabım var</Text>
        </Press>
      </View>

      <ScrollView style={s.fill} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {done ? <PreviewResult preview={f.preview} C={C} /> : <PreviewChoices f={f} C={C} />}
      </ScrollView>

      <View style={s.cta}>
        {done ? (
          <>
            <Button onPress={f.save} iconRight="arrowR" size="lg" fullWidth>Rotamı kaydet</Button>
            <Text style={[TYPOGRAPHY.meta, s.note, { color: C.text3 }]}>
              Hesap rotanı buluta alır; hangi telefondan girersen aynı yerden devam eder.
            </Text>
          </>
        ) : (
          <Button onPress={f.draw} size="lg" fullWidth disabled={!f.canDraw}>Rotamı çiz</Button>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function RoutePreviewScreen() {
  return (
    <ScreenErrorBoundary>
      <RoutePreviewInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: GUTTER, paddingVertical: STEP.s1, minHeight: CONTROL.tapMin,
  },
  side: { minWidth: CONTROL.tapMin, minHeight: CONTROL.tapMin, justifyContent: "center" },
  login: { alignItems: "flex-end" },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s4 },
  cta: { paddingHorizontal: GUTTER, paddingBottom: STEP.s3, paddingTop: STEP.s1 },
  note: { textAlign: "center", marginTop: STEP.s2 },
});
