import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, Card, Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { STEP, SHAPE, TYPOGRAPHY, GUTTER } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import * as haptic from "../../lib/haptics";

export default function ReviewDoneScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { params } = useRoute();
  
  // Params'dan gelen veriler
  const reviewedCount = params?.reviewedCount ?? 6;
  const closedCount = params?.closedCount ?? 2;
  const rememberedCount = params?.rememberedCount ?? 4;
  const forgotCount = params?.forgotCount ?? 2;
  const pendingBefore = params?.pendingBefore ?? 14;
  const pendingAfter = params?.pendingAfter ?? 12;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3, letterSpacing: 1.5 }]}>TEKRAR BİTTİ</Text>
          
          <View style={styles.heroTitleRow}>
            <Text style={[TYPOGRAPHY.hero, { color: C.text, fontSize: 64, lineHeight: 64 }]}>{reviewedCount}</Text>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginTop: 12 }]}>soru tekrar edildi</Text>
          </View>
          
          <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s3 }]}>
            {rememberedCount}'ünü bildin, {forgotCount}'si tekrar takvimine geri döndü.
            Yarın 4 soru, üç gün sonra 7 soru bekliyor.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          {closedCount > 0 ? (
            <View style={[styles.closedRow, { backgroundColor: C.success + "1A", borderColor: C.success }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1 }}>
                <Icon name="checkCircle" size={18} color={C.success} />
                <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{closedCount} soru kapandı</Text>
              </View>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>defterde <Text style={{ color: C.text, fontFamily: "Archivo_600" }}>{pendingBefore}</Text></Text>
            </View>
          ) : null}

          <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s2 }]}>
            Bugünkü emeğin kayda geçti. Bir sonraki denemeye daha hazırlıklı gidiyorsun.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.metrics}>
          <View style={styles.row}>
            <Card style={styles.halfCard}>
              <Text style={[TYPOGRAPHY.label, { color: C.text }]}>BİLDİM</Text>
              <Text style={[TYPOGRAPHY.hero, { color: C.text, fontSize: 32, marginTop: STEP.s1 }]}>{rememberedCount}</Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>aralık uzadı</Text>
            </Card>
            <Card style={styles.halfCard}>
              <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BİLEMEDİM</Text>
              <Text style={[TYPOGRAPHY.hero, { color: C.text, fontSize: 32, marginTop: STEP.s1 }]}>{forgotCount}</Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 }]}>yarın tekrar</Text>
            </Card>
          </View>

          <Card style={styles.fullCard}>
            <View style={styles.cardHeader}>
              <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>DEFTER DURUMU</Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
                {pendingBefore} \u2192 <Text style={{ color: C.text }}>{pendingAfter}</Text> bekliyor
              </Text>
            </View>
            <View style={styles.progressRow}>
              <View style={[styles.bar, { flex: 3, backgroundColor: C.warn }]} />
              <View style={[styles.bar, { flex: 2, backgroundColor: C.success }]} />
              <View style={[styles.bar, { flex: 2, backgroundColor: C.up }]} />
              <View style={[styles.bar, { flex: 1, backgroundColor: C.line }]} />
            </View>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s2 }]}>
              Tekrar kayda geçti. Bu konu 9 gün sonra tekrar önerilecek.
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.actions}>
          <Button
            size="lg"
            onPress={() => {
              haptic.tap();
              navigation.navigate(SCREENS.WRONG_NOTEBOOK);
            }}
            style={styles.actionBtn}
          >
            Deftere dön
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={() => {
              haptic.select();
              navigation.navigate(SCREENS.ROADMAP);
            }}
            style={styles.actionBtn}
          >
            Çalışmaya başla · sıradaki durak
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: GUTTER, paddingTop: STEP.s4 },
  hero: { marginBottom: STEP.s3 },
  heroTitleRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2, marginTop: STEP.s2 },
  closedRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: STEP.s3, borderRadius: SHAPE.card, borderWidth: 1, marginTop: STEP.s2,
  },
  metrics: { marginTop: STEP.s4, gap: STEP.s2 },
  row: { flexDirection: "row", gap: STEP.s2 },
  halfCard: { flex: 1 },
  fullCard: { marginTop: STEP.s2 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressRow: { flexDirection: "row", gap: 4, marginTop: STEP.s2 },
  bar: { height: 6, borderRadius: 3 },
  actions: { marginTop: STEP.s4, gap: STEP.s2, paddingBottom: STEP.s4 },
  actionBtn: { width: "100%" },
});
