import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";

import { Button, Icon, Card } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatDelta, formatNumber } from "../../../lib/format";
import { SCREENS } from "../../../constants/screens";
import { TAB_KEYS } from "../../../navigation/tabAssignment";
import { resetToTabStackScreen } from "../../../navigation/rootStackActions";
import { Press } from "../../../components/design/Press";

export function TrialDropLayout({ trial, summary, typeLabel, dayMonth, onShare }) {
  const C = useC();
  const navigation = useNavigation();

  // En cok dusen dersi bulalim
  const worstDrop = summary.bars.length ? [...summary.bars].sort((a, b) => (a.delta || 0) - (b.delta || 0))[0] : null;

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <Press haptic="none" onPress={() => navigation.popToTop()} style={styles.close}
          accessibilityLabel="Kapat" accessibilityRole="button">
          <Icon name="x" size={14} color={C.text2} sw={1.7} />
        </Press>
        <Text style={[TYPOGRAPHY.label, styles.headerLabel, { color: C.text3 }]}>
          {[typeLabel, dayMonth].filter(Boolean).join(" · ").toLocaleUpperCase("tr-TR")}
        </Text>
        {onShare ? (
          <Press haptic="none" onPress={onShare} style={styles.close} accessibilityLabel="Paylaş" accessibilityRole="button">
            <Icon name="share" size={16} color={C.text2} />
          </Press>
        ) : <View style={styles.close} />}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.accentBright, letterSpacing: 1.5 }]}>ROTA GÜNCELLENDİ</Text>
          <Text style={[TYPOGRAPHY.hero, { color: C.text, marginTop: STEP.s2 }]}>Bu sonuç rotanın sonu değil.</Text>
          <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s2 }]}>
            Maraton bunu bir gerileme olarak değil, rotayı düzeltmek için yeni bir veri olarak görüyor.
          </Text>
        </Animated.View>

        {worstDrop && worstDrop.delta < 0 ? (
          <Animated.View style={styles.section}>
            <Card style={styles.worstCard}>
              <View style={styles.worstHeader}>
                <View style={[styles.dot, { backgroundColor: worstDrop.color || C.warn }]} />
                <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>
                  {worstDrop.name.toLocaleUpperCase("tr-TR")} NETİ
                </Text>
              </View>
              <View style={styles.netRow}>
                <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{formatNumber(worstDrop.net, 2)}</Text>
                <View style={styles.deltaBox}>
                  <Text style={[TYPOGRAPHY.label, { color: C.down }]}>DEĞİŞİM</Text>
                  <Text style={[TYPOGRAPHY.subheading, { color: C.down, marginTop: 2 }]}>
                    {formatDelta(worstDrop.delta, 2)}
                  </Text>
                </View>
              </View>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 }]}>
                ÖNCEKİ {formatNumber((worstDrop.net - worstDrop.delta), 2)} \u2192 YENİ {formatNumber(worstDrop.net, 2)}
              </Text>
              
              <View style={[styles.divider, { backgroundColor: C.line }]} />
              
              <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>ROTA ÜZERİNDEKİ ETKİSİ</Text>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, marginTop: STEP.s1 }]}>
                {worstDrop.name} yükü önümüzdeki iki haftaya yeniden dağıtıldı.
              </Text>
              <View style={[styles.track, { backgroundColor: C.track }]}>
                <View style={[styles.fill, { backgroundColor: C.down, width: "70%" }]} />
              </View>
              <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 }]}>
                Ders bazlı deneme neti · konu bazlı çıkarım yapılmaz
              </Text>
            </Card>
          </Animated.View>
        ) : null}

        <Animated.View style={styles.section}>
          <View style={[styles.messageBox, { backgroundColor: C.brandTint, borderColor: C.accent }]}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>
              Netin düşmüş olabilir, ama artık hangi ders yüküne daha fazla zaman ayırman gerektiği daha görünür.
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={styles.actions}>
          <Button size="lg" fullWidth onPress={() => resetToTabStackScreen(navigation, TAB_KEYS.ROTA, SCREENS.ROADMAP)}>
            Yeni rotayı gör
          </Button>
          <View style={{ height: STEP.s2 }} />
          <Button size="lg" variant="outline" fullWidth onPress={() => resetToTabStackScreen(navigation, TAB_KEYS.PROGRAM, SCREENS.DAILY_PLAN)}>
            Bugün küçük bir durak seç
          </Button>
          <View style={{ height: STEP.s2 }} />
          <Button size="lg" variant="ghost" fullWidth onPress={() => navigation.popToTop()}>
            Şimdi bakmayacağım
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingHorizontal: GUTTER - STEP.s2, paddingTop: 4 },
  close: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  headerLabel: { flex: 1, fontFamily: "Archivo_700" },
  scroll: { paddingBottom: STEP.s4 + STEP.s1 },
  section: { paddingHorizontal: GUTTER, marginTop: STEP.s4 },
  worstCard: { padding: STEP.s3, marginTop: STEP.s2 },
  worstHeader: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  dot: { width: 8, height: 8, borderRadius: 1 },
  netRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: STEP.s2 },
  deltaBox: { alignItems: "flex-end" },
  divider: { height: 1, marginVertical: STEP.s3 },
  track: { height: 6, borderRadius: 3, marginTop: STEP.s2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  messageBox: { padding: STEP.s3, borderRadius: SHAPE.card, borderWidth: 1, marginTop: STEP.s3 },
  actions: { paddingHorizontal: GUTTER, marginTop: STEP.s4 + STEP.s2 },
});
