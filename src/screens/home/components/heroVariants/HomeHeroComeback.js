import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { HomeHeroEyebrow } from "./HomeHeroEyebrow";
import { HomeHeroComebackAction } from "./HomeHeroComebackAction";
import * as H from "../../../../lib/haptics";

// Tasarim AKIS 14 · "Geri Dönüş Modu": uzun aradan sonra ilk açılışta gelir.
// Borç sayısı, kaçan seri ve geçmiş burada gösterilmez — tek iş kullanıcıyı
// ilk oturuma ulaştırmak.
export function HomeHeroComeback({ nextTask, onStartTask, onDismiss, onViewRoute }) {
  const C = useC();

  return (
    <View>
      <Animated.View entering={FadeInDown.duration(480).springify().damping(18)}>
        <HomeHeroEyebrow label="GERİ DÖNÜŞ MODU" />
        <Text style={[s.title, { color: C.text }]}>Yeniden başlamak için rotayı hafifletelim.</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s2 }]}>
          Aradan sonra eski tempoya bir anda dönmek zorunda değilsin. Maraton ilk adımı senin
          için küçültür.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(480).springify().damping(18)} style={s.block}>
        <Pressable
          onPress={() => { H.select(); onStartTask?.(nextTask); }}
          style={[s.recCard, { backgroundColor: C.brandTint, borderColor: C.accent }]}
          accessibilityRole="button"
          accessibilityLabel="20 dakikalık dönüş durağı ile başla"
        >
          <View style={s.recHeader}>
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.accentBright, letterSpacing: 1.8 }]}>
              ÖNERİLEN
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[s.recNumber, { color: C.text }]} allowFontScaling={false}>20</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3, paddingBottom: 2 }]}> dk</Text>
          </View>
          <Text style={[s.recTitle, { color: C.text }]}>20 dakikalık dönüş durağı</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.text2, marginTop: 6 }]}>
            10 dakika konu tekrarı · 10 soru
          </Text>
        </Pressable>

        <HomeHeroComebackAction label="20 dakikayla başla" onPress={() => onStartTask?.(nextTask)} />
        <HomeHeroComebackAction label="Bugünkü plana dön" onPress={onDismiss} />
        <HomeHeroComebackAction label="Rotayı yeniden düzenle" onPress={onViewRoute} />

        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s2, textAlign: "center" }]}>
          Rotan olduğu gibi duruyor. İstediğin an tam plana dönebilirsin.
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  title: {
    fontFamily: "Bricolage_400",
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -0.6,
    marginTop: STEP.s3,
  },
  block: { marginTop: STEP.s3 },
  recCard: { padding: STEP.s3, borderRadius: 24, borderWidth: 1 },
  recHeader: { flexDirection: "row", alignItems: "baseline" },
  recNumber: { fontFamily: "Bricolage_400", fontSize: 28, lineHeight: 28, fontVariant: ["tabular-nums"] },
  recTitle: { fontFamily: "Bricolage_400", fontSize: 17, lineHeight: 22, marginTop: 14 },
});
