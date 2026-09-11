import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Card, Button } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { HOW_IT_WORKS as T } from "../../constants/howItWorks";
import { HowItWorksSource } from "./components/HowItWorksSource";

// Tasarim: "Neye Gore Oneriyoruz". Rota Detay'daki "Bu siralama neye gore?"
// ve Premium'daki "Neye dayanarak oneriyor?" satirlarinin ortak hedefi.
//
// Tamamen statik metin, hicbir sayi gostermiyor -- veri riski yok.
// Ekranin degeri tam olarak NE YAPMADIGINI soylemesinde: konu bazli net
// tahmini yapilmadigi burada aciktan yaziyor.
export default function HowItWorksScreen() {
  const C = useC();
  const navigation = useNavigation();

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openPrivacy = useCallback(() => navigation.navigate(SCREENS.PRIVACY), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.label, { color: C.text3, flex: 1 }]}>{T.eyebrow}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(520)}>
          <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>{T.title}</Text>
          <Text style={[TYPOGRAPHY.body, styles.lede, { color: C.text2 }]}>{T.lede}</Text>
        </Animated.View>

        <Text style={[TYPOGRAPHY.label, styles.sectionLabel, { color: C.text2 }]}>
          {T.sourcesLabel}
        </Text>
        {T.sources.map((src, i) => (
          <Animated.View key={src.key} entering={FadeInDown.delay(80 + i * 60).duration(520)}>
            <HowItWorksSource C={C} source={src} index={i + 1} />
          </Animated.View>
        ))}

        <Text style={[TYPOGRAPHY.label, styles.sectionLabel, { color: C.text2 }]}>
          {T.limitLabel}
        </Text>
        <Card tone="void" radius="sheet">
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{T.limitTitle}</Text>

          {T.weSay.map((line) => (
            <View key={line} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: C.up }]} />
              <Text style={[TYPOGRAPHY.meta, styles.bulletText, { color: C.text2 }]}>{line}</Text>
            </View>
          ))}

          <Text style={[TYPOGRAPHY.micro, styles.dontLabel, { color: C.text3 }]}>
            {T.weDontSayLabel}
          </Text>
          <View style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: C.down }]} />
            <Text style={[TYPOGRAPHY.meta, styles.bulletText, styles.struck, { color: C.text3 }]}>
              {T.weDontSay}
            </Text>
          </View>
        </Card>

        <Button variant="primary" size="lg" fullWidth onPress={goBack} style={styles.cta}>
          {T.primary}
        </Button>
        <Button variant="outline" size="md" fullWidth onPress={openPrivacy} style={styles.second}>
          {T.secondary}
        </Button>
      </ScrollView>
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
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: 60 },
  lede: { marginTop: STEP.s2, lineHeight: 23 },
  sectionLabel: { marginTop: STEP.s5, marginBottom: STEP.s2 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: STEP.s2 },
  bullet: { width: 6, height: 6, borderRadius: 1, marginTop: 6 },
  bulletText: { flex: 1, lineHeight: 20 },
  dontLabel: { marginTop: STEP.s3 },
  struck: { textDecorationLine: "line-through" },
  cta: { marginTop: STEP.s5 },
  second: { marginTop: STEP.s2 },
});
