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
import { WidgetMiniPreview } from "./components/WidgetMiniPreview";
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
          <View style={s.cardStack}>
            {WIDGETS.map((w) => (
              <View
                key={w.key}
                style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}
              >
                <WidgetMiniPreview widgetKey={w.key} C={C} />
                <View style={s.cardContent}>
                  <View style={s.cardHeader}>
                    <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{w.name}</Text>
                    {w.lock ? (
                      <View style={[s.chip, { borderColor: C.line, backgroundColor: C.void }]}>
                        <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>Kilit ekranı</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{w.line}</Text>
                </View>
              </View>
            ))}
          </View>
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
  list: { marginTop: STEP.s4, gap: STEP.s2 },
  cardStack: { gap: STEP.s2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    padding: STEP.s2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  cardContent: { flex: 1, gap: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: STEP.s1 },
  chip: { borderWidth: 1, borderRadius: SHAPE.chip, paddingHorizontal: STEP.s1, paddingVertical: 2 },
  note: { marginTop: STEP.s3 },
});
