import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, SectionLabel } from "../../components/design";
import { Press } from "../../components/design/Press";
import { useC } from "../../contexts/ThemeContext";
import { DISCOVER_TIPS, useDiscoverTips } from "../../hooks/useDiscoverTips";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { GuideSteps } from "./components/GuideSteps";
import { HOME_STEPS, LOCK_STEPS, WIDGETS } from "./widgetGuideContent";

// "Ana ekranina ekle" rehberi. Widget'lar uygulamada hic anilmiyordu;
// kullanici var olduklarini bilmeden galeride bulmak zorundaydi.
export default function WidgetGuideScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { close } = useDiscoverTips();

  // Rehberi acan icin ana sayfadaki ipucu isini gordu.
  useEffect(() => { close(DISCOVER_TIPS.WIDGET); }, [close]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12}
          accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Press>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>Maraton'u ana ekranına al</Text>
        <Text style={[TYPOGRAPHY.body, s.lead, { color: C.text2 }]}>
          Uygulamayı açmadan bugünün işini, serini ve sınava kalan günü gör. Dokununca ilgili sayfa açılır.
        </Text>

        <GuideSteps C={C} title="ANA EKRAN" steps={HOME_STEPS} />
        <GuideSteps C={C} title="KİLİT EKRANI" steps={LOCK_STEPS} />

        <View style={s.list}>
          <SectionLabel>WIDGET'LAR</SectionLabel>
          {WIDGETS.map((w, i) => (
            <View key={w.key} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
              <View style={s.rowText}>
                <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{w.name}</Text>
                <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{w.line}</Text>
              </View>
              {w.lock ? (
                <View style={[s.chip, { borderColor: C.border }]}>
                  <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>Kilit ekranı</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <Text style={[TYPOGRAPHY.meta, s.note, { color: C.text3 }]}>
          Widget'lar uygulamayı her açtığında güncellenir. Sınav sayacı kendi kendine işler.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: GUTTER, height: CONTROL.tapMin, justifyContent: "center" },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 },
  lead: { marginTop: STEP.s1 },
  list: { marginTop: STEP.s4, gap: STEP.s1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2 },
  rowText: { flex: 1, gap: 2 },
  chip: { borderWidth: 1, borderRadius: SHAPE.chip, paddingHorizontal: STEP.s1, paddingVertical: 4 },
  note: { marginTop: STEP.s3 },
});
