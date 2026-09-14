import React, { useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import * as H from "../../lib/haptics";

// Tasarim: "8. Gun". Ilk 7 gunluk surecin ardindan kullanicinin karsilastigi Paywall bilgilendirme ekrani.
export default function EighthDayLockScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleClose = useCallback(() => {
    H.select();
    navigation.goBack();
  }, [navigation]);

  const handleTryFree = useCallback(() => {
    H.select();
    navigation.navigate(SCREENS.PREMIUM); // Ileride premium akisina yonlendirme
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: GUTTER }]}>
        <View style={{ width: 24 }} />
        <Text style={[styles.headerTitle, { color: C.text }]}></Text>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Icon name="x" size={24} color={C.text2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + STEP.s5 }}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={{ paddingHorizontal: 26, paddingTop: STEP.s5 }}>
          <Text style={[styles.eyebrow, { color: C.accentBright }]}>8. GÜN</Text>
          <Text style={[styles.title, { color: C.text }]}>Bir haftadır rotanı kullanıyorsun. Buradan sonrası Pro.</Text>
          <Text style={[styles.desc, { color: C.text2 }]}>
            Rota durmaz — kilitliyken yalnızca görünmez. Kayıtların, defterin ve serin olduğu gibi kalır.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4 }}>
          <View style={[styles.statsRow, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: C.text }]}>6</Text>
              <Text style={[styles.statLabel, { color: C.text3 }]}>durak</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: C.text }]}>4:20</Text>
              <Text style={[styles.statLabel, { color: C.text3 }]}>saat çalışma</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: C.text }]}>5</Text>
              <Text style={[styles.statLabel, { color: C.text3 }]}>çalışma günü</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s5 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: C.text3 }]}>ÜCRETSİZDE KALIR</Text>
            <View style={[styles.line, { backgroundColor: C.line }]} />
          </View>

          <View style={styles.list}>
            {["Çalışma oturumu ve süre kaydı - sınırsız", "Yanlış defteri ve aralıklı tekrar - sınırsız", "Ayda 4 deneme kaydı", "Seri, günlük ve haftalık özet"].map((text, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: C.up }]} />
                <Text style={[styles.listItemText, { color: C.text2 }]}>{text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: 26 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: C.text3 }]}>PRO'DA DEVAM EDER</Text>
            <View style={[styles.line, { backgroundColor: C.line }]} />
          </View>

          <View style={styles.list}>
            {["Rota - bugünün durakları", "Rotanın tamamı, gelecek duraklar ve tahmin bandı", "Tempo senaryoları ve öncelikli konuların tamamı"].map((text, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: C.accent }]} />
                <Text style={[styles.listItemText, { color: C.text2 }]}>{text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={{ paddingHorizontal: GUTTER, paddingTop: 30 }}>
          <Button
            title="7 gün ücretsiz dene"
            onPress={handleTryFree}
            size="large"
          />
          <Pressable onPress={handleClose} style={[styles.secondaryBtn, { borderColor: C.border }]}>
            <Text style={[styles.secondaryBtnText, { color: C.text }]}>Ücretsiz devam et</Text>
          </Pressable>
          <Text style={[styles.footerText, { color: C.text3 }]}>
            Deneme bitmeden iptal edersen ücret alınmaz.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontFamily: TYPOGRAPHY.Bricolage_400, fontSize: 22 },
  eyebrow: { fontFamily: TYPOGRAPHY.Archivo_700, fontSize: 11.5, letterSpacing: 2.76 },
  title: {
    fontFamily: TYPOGRAPHY.Bricolage_400,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.02,
    marginTop: 16,
    maxWidth: 290,
  },
  desc: {
    fontFamily: TYPOGRAPHY.Archivo_400,
    fontSize: 13.5,
    lineHeight: 22,
    marginTop: 14,
    maxWidth: 296,
  },
  statsRow: {
    flexDirection: "row",
    gap: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  statCol: {},
  statNum: { fontFamily: TYPOGRAPHY.Bricolage_400, fontSize: 26, fontVariant: ["tabular-nums"] },
  statLabel: { fontFamily: TYPOGRAPHY.Archivo_500, fontSize: 11.5, marginTop: 5 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    paddingBottom: 4,
  },
  sectionHeader: {
    fontFamily: TYPOGRAPHY.Archivo_600,
    fontSize: 11.5,
    letterSpacing: 1.84,
  },
  line: { flex: 1, height: 1 },
  list: {
    marginTop: 14,
    gap: 11,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  bullet: {
    width: 5,
    height: 5,
    marginTop: 7,
    borderRadius: 1,
  },
  listItemText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.Archivo_400,
    fontSize: 13,
    lineHeight: 20,
  },
  secondaryBtn: {
    width: "100%",
    height: 52,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontFamily: TYPOGRAPHY.Archivo_600,
    fontSize: 14.5,
  },
  footerText: {
    fontFamily: TYPOGRAPHY.Archivo_400,
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 14,
    textAlign: "center",
  },
});
