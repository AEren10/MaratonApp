import React, { useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import { useBlockBack } from "../../hooks/useBlockBack";

import { Button, Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useFirstWeekMomentData } from "../../hooks/useFirstWeekMomentData";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { formatStudyMinutes } from "../../domain/study/studyHistoryModel";
import * as H from "../../lib/haptics";

// Tasarim: "8. Gun" (Artboard 118). Ilk 7 gunluk deneme suresinin bitisi ve Pro paywall.
export default function EighthDayLockScreen() {
  useBlockBack(true);
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const moment = useFirstWeekMomentData();

  const handleClose = useCallback(() => {
    H.select();
    navigation.goBack();
  }, [navigation]);

  const handleTrial = useCallback(() => {
    H.select();
    navigation.navigate(SCREENS.PAYWALL, { source: "route_gate" });
  }, [navigation]);

  const handleContinueFree = useCallback(() => {
    H.select();
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: GUTTER }]}>
        <View style={{ width: 24 }} />
        <Pressable onPress={handleClose} hitSlop={10}>
          <Icon name="x" size={24} color={C.text2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + STEP.s5 }}>
        <Animated.View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s2 }}>
          <Text style={[styles.eyebrow, { color: C.text2 }]}>8. GÜN</Text>
          <Text style={[styles.title, { color: C.text }]}>Bir haftadır rotanı kullanıyorsun. Buradan sonrası Pro.</Text>
          <Text style={[styles.desc, { color: C.text3 }]}>
            Rota durmaz — kilitliyken yalnızca görünmez. Kayıtların, defterin ve serin olduğu gibi kalır.
          </Text>
        </Animated.View>

        <Animated.View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
          <View style={[styles.statsCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: C.text }]}>{moment.totals.routeStops || 0}</Text>
              <Text style={[styles.statLabel, { color: C.text3 }]}>durak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: C.text }]}>{formatStudyMinutes(moment.totals.studyMinutes)}</Text>
              <Text style={[styles.statLabel, { color: C.text3 }]}>çalışma</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: C.text }]}>{moment.totals.studyDays || 0}</Text>
              <Text style={[styles.statLabel, { color: C.text3 }]}>çalışma günü</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={styles.featureList}>
          <View style={styles.featureCol}>
            <Text style={[styles.colTitle, { color: C.up }]}>Ücretsiz Kalır</Text>
            <FeatureItem color={C.up} text="Çalışma oturumu ve süre kaydı · sınırsız" C={C} />
            <FeatureItem color={C.up} text="Yanlış defteri ve aralıklı tekrar · sınırsız" C={C} />
            <FeatureItem color={C.up} text="Ayda 4 deneme" C={C} />
            <FeatureItem color={C.up} text="Seri, günlük ve haftalık özet" C={C} />
          </View>

          <View style={styles.featureCol}>
            <Text style={[styles.colTitle, { color: C.accentBright }]}>Pro'da Devam Eder</Text>
            <FeatureItem color={C.accent} text="Rota bugünün durakları" C={C} />
            <FeatureItem color={C.accent} text="Gelecek duraklar & tahmin bandı" C={C} />
            <FeatureItem color={C.accent} text="Tempo senaryoları" C={C} />
            <FeatureItem color={C.accent} text="Öncelikli konular" C={C} />
          </View>
        </Animated.View>

        <Animated.View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s5 }}>
          <Button
            title="7 gün ücretsiz dene"
            onPress={handleTrial}
            size="large"
            style={{ marginBottom: STEP.s2 }}
          />
          <Button
            title="Ücretsiz devam et"
            variant="ghost"
            onPress={handleContinueFree}
            size="large"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ color, text, C }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.featureText, { color: C.text2 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontFamily: TYPOGRAPHY.Archivo_700, fontSize: 11.5, letterSpacing: 2.76 },
  title: { fontFamily: TYPOGRAPHY.Bricolage_400, fontSize: 32, lineHeight: 36, letterSpacing: -1, marginTop: 12 },
  desc: { fontFamily: TYPOGRAPHY.Archivo_400, fontSize: 14, lineHeight: 22, marginTop: 14 },
  statsCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 18, paddingHorizontal: 22, borderRadius: 20, borderWidth: 1,
  },
  statItem: { alignItems: "center" },
  statValue: { fontFamily: TYPOGRAPHY.Bricolage_400, fontSize: 26, fontVariant: ["tabular-nums"] },
  statLabel: { fontFamily: TYPOGRAPHY.Archivo_600, fontSize: 11, letterSpacing: 1.5, marginTop: 4, textTransform: "uppercase" },
  statDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.1)" },
  featureList: {
    flexDirection: "row", paddingHorizontal: GUTTER, paddingTop: STEP.s5, gap: STEP.s3,
  },
  featureCol: { flex: 1 },
  colTitle: { fontFamily: TYPOGRAPHY.Archivo_600, fontSize: 12.5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: STEP.s2 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  featureText: { flex: 1, fontFamily: TYPOGRAPHY.Archivo_400, fontSize: 13, lineHeight: 18 },
});



