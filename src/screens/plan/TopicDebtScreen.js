import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Card, Button, EmptyState, StatBlock } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useTopicDebt } from "../../hooks/useTopicDebt";
import { TopicDebtStopRow } from "./components/TopicDebtStopRow";

export default function TopicDebtScreen() {
  const C = useC();
  const navigation = useNavigation();
  const {
    stops, stopCount, totalHours, hasHours, capped,
    canDistribute, distributing, error, distribute, isEmpty,
  } = useTopicDebt();

  const onDistribute = useCallback(async () => {
    await distribute();
  }, [distribute]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Konu borcu</Text>
      </View>

      {isEmpty ? (
        <EmptyState
          title="Geçilmemiş durak yok."
          body="Rotan planladığın yerde. Borç biriktiğinde burada saat olarak görürsün."
          style={styles.empty}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(560)}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>GEÇİLMEYEN DURAKLAR</Text>
            <View style={styles.heroRow}>
              <StatBlock value={hasHours ? totalHours : "—"} size="page" color={C.text} />
              {hasHours && (
                <Text style={[styles.unit, { color: C.text2 }]} allowFontScaling={false}>sa</Text>
              )}
            </View>

            {capped && (
              <View style={[styles.note, { backgroundColor: C.surface, borderColor: C.elev }]}>
                <View style={[styles.noteDot, { backgroundColor: C.up }]} />
                <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
                  Borç bir haftalık kapasitende tutuldu
                </Text>
              </View>
            )}

            <Text style={[TYPOGRAPHY.caption, styles.lede, { color: C.text2 }]}>
              Borç bir haftalık kapasiteni geçmez — üstü otomatik "Sırada"ya düşer.
              21 günü geçen durak borç olmaktan çıkar.
            </Text>
          </Animated.View>

          {stopCount > 0 && (
            <Animated.View entering={FadeInDown.delay(140).duration(560)} style={styles.listWrap}>
              <View style={styles.listHead}>
                <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BİRİKEN DURAKLAR</Text>
                <View style={[styles.rule, { backgroundColor: C.line }]} />
                <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{stopCount} durak</Text>
              </View>
              {stops.map((item) => (
                <TopicDebtStopRow key={item.key} item={item} C={C} />
              ))}
            </Animated.View>
          )}

          {error && (
            <Card tone="surface" radius="panel" style={{ marginTop: STEP.s3 }}>
              <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
                Duraklar taşınamadı. Bağlantını kontrol edip tekrar dene.
              </Text>
            </Card>
          )}

          <View style={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={onDistribute}
              disabled={!canDistribute}
              loading={distributing}
              accessibilityLabel="Borcu sıradaki haftalara dağıt"
            >
              Borcu sıradaki haftalara dağıt
            </Button>
            <Text style={[TYPOGRAPHY.meta, styles.footnote, { color: C.text3 }]}>
              Dağıtım hiçbir haftayı kapasitesinin üstüne çıkarmaz; sığmayan durak
              "Sırada" kalır.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 26, paddingBottom: 40 },
  empty: { flex: 1, paddingHorizontal: GUTTER, justifyContent: "center" },
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: 11, marginTop: 14 },
  unit: { fontFamily: "Archivo_500", fontSize: 17, lineHeight: 24, paddingBottom: STEP.s1 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 9,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  noteDot: { width: 6, height: 6, borderRadius: 1 },
  lede: { marginTop: 14, maxWidth: 300, lineHeight: 22 },
  listWrap: { marginTop: 26 },
  listHead: { flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 4 },
  rule: { flex: 1, height: 1 },
  actions: { marginTop: 26 },
  footnote: { marginTop: 10, textAlign: "center", lineHeight: 19 },
});
