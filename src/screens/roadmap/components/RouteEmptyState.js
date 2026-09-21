import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { RouteEmptyChart } from "../../../components/charts/RouteEmptyChart";

// Tasarim "Boş Rota": rotada henuz durak yok. Kopya artboard'dan birebir.
export function RouteEmptyState({ daysLeft, examDateTag, loading, onAddFirstStop }) {
  const C = useC();
  const title = Number.isFinite(daysLeft)
    ? `${daysLeft} günlük yol buradan başlıyor.`
    : "Yol buradan başlıyor.";
  return (
    <View>
      <Animated.View entering={FadeInDown.duration(600)} style={s.intro}>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>BAŞLANGIÇ NOKTASIN</Text>
        <Text style={[TYPOGRAPHY.display, s.title, { color: C.text }]}>{title}</Text>
        <Text style={[TYPOGRAPHY.body, s.body, { color: C.text2 }]}>
          Rota, girdiğin denemelerin net ortalamasıyla çizilir. İlk durağını ekle — hat oradan yükselmeye başlasın.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(600)} style={s.chart}>
        <RouteEmptyChart examDateTag={examDateTag} />
      </Animated.View>

      <View style={s.pad}>
        <Button size="lg" fullWidth loading={loading} onPress={onAddFirstStop}>
          İlk durağını ekle
        </Button>
      </View>

      <Animated.View entering={FadeInDown.delay(160).duration(600)} style={[s.pad, s.section]}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BUGÜNÜN DURAKLARI</Text>
        <View style={[s.slot, { borderColor: C.border }]}>
          <View style={[s.box, { borderColor: C.text5 }]} />
          <View style={s.slotCopy}>
            <Text style={[TYPOGRAPHY.topicName, { color: C.text2 }]}>Rotanda henüz durak yok</Text>
            <Text style={[TYPOGRAPHY.meta, s.slotSub, { color: C.text3 }]}>
              İlk durağını ekle, hat dolmaya başlasın.
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  intro: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  title: { marginTop: STEP.s2, maxWidth: 320 },
  body: { marginTop: STEP.s2, maxWidth: 300 },
  chart: { marginTop: STEP.s3 },
  pad: { paddingHorizontal: GUTTER, paddingTop: STEP.s1 },
  section: { paddingTop: STEP.s4 },
  slot: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    marginTop: STEP.s2,
    padding: STEP.s2 + STEP.s1 / 2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  box: { width: 26, height: 26, borderRadius: SHAPE.chip, borderWidth: 2, borderStyle: "dashed" },
  slotCopy: { flex: 1 },
  slotSub: { marginTop: STEP.s1 / 2 },
});
