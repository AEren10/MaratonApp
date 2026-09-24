import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/colorMix";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Deneme Kotasi Doldu: soluk 1/3 arka plan + alt sayfa. Kayitli denemeler
// listede durur; ikincil aksiyon yalniz kapatir.
export function TrialQuotaSheet({ sheet, onPro, onClose }) {
  const C = useC();
  const body = [sheet.resetLabel ? `Yenisi ${sheet.resetLabel} açılır.` : null,
    "Kayıtlı denemelerin ve rotan olduğu gibi kalır."].filter(Boolean).join(" ");
  return (
    <View style={styles.fill}>
      <View style={styles.ghost} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>DENEME GİR · ADIM 1/3</Text>
        <Text style={[TYPOGRAPHY.heading, styles.ghostTitle, { color: C.text }]}>Hangi denemeyi girdin?</Text>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.ghostBlock, { backgroundColor: C.surface, borderColor: C.elev }]} />
        ))}
      </View>
      <Animated.View entering={FadeIn.duration(500)} style={[StyleSheet.absoluteFill, { backgroundColor: alpha(C.canvas, 72) }]} />
      <Animated.View accessibilityViewIsModal
        style={[styles.sheet, { backgroundColor: C.bg, borderTopColor: C.elev }]}>
        <View style={[styles.handle, { backgroundColor: C.elev }]} />
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>AYLIK KOTA</Text>
        <Text accessibilityRole="header" style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>
          {`Bu ay ${sheet.used} deneme kaydettin.`}
        </Text>
        <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>{body}</Text>
        {sheet.rows.length ? (
          <View style={[styles.list, { borderTopColor: C.line }]}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{sheet.monthLabel}</Text>
            <View style={{ marginTop: STEP.s1 + 2 }}>
              {sheet.rows.map((row) => (
                <View key={row.id} style={[styles.row, { borderTopColor: C.line }]}>
                  <Text numberOfLines={1} style={[TYPOGRAPHY.tableName, styles.rowTitle, { color: C.text2 }]}>{row.title}</Text>
                  <Text style={[TYPOGRAPHY.topicName, { color: C.text, fontVariant: ["tabular-nums"] }]}>{row.net}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        <Button size="lg" fullWidth onPress={onPro} style={{ marginTop: STEP.s3 }}>Pro ile sınırsız kaydet</Button>
        <Pressable onPress={onClose} style={styles.close} accessibilityRole="button">
          <Text style={[TYPOGRAPHY.tableName, { fontFamily: "Archivo_600", color: C.text2 }]}>Tamam</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  ghost: { opacity: 0.34, paddingHorizontal: GUTTER, paddingTop: 4 },
  ghostTitle: { marginTop: STEP.s2 + 2, maxWidth: 280 },
  ghostBlock: { height: 56, borderRadius: SHAPE.card, borderWidth: 1, marginTop: STEP.s1 + 2 },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0, borderTopWidth: 1,
    borderTopLeftRadius: SHAPE.sheet + STEP.s1, borderTopRightRadius: SHAPE.sheet + STEP.s1,
    paddingHorizontal: GUTTER, paddingTop: STEP.s2 + 2, paddingBottom: STEP.s4 - 4,
  },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: STEP.s3 },
  title: { marginTop: STEP.s2 + 1, maxWidth: 300 },
  body: { marginTop: STEP.s2, maxWidth: 296 },
  list: { marginTop: STEP.s3, paddingTop: STEP.s2 + 2, borderTopWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2, borderTopWidth: 1 },
  rowTitle: { flex: 1 },
  close: { height: CONTROL.buttonPrimary - 4, marginTop: 6, alignItems: "center", justifyContent: "center" },
});
