import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "../../../../components/design/Button";
import { Card } from "../../../../components/design/Card";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { useStudyRoute } from "../../../../hooks/useStudyRoute";
import { HomeHeroEyebrow } from "./HomeHeroEyebrow";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../../../constants/screens";
import * as H from "../../../../lib/haptics";

// Tasarim AKIS 2 · "Rota Donduruldu": tasarimin kendi notu bu ekranin
// dondurulmus halde uygulama acilinca Ana Sayfa'nin YERINE geldigini
// soyluyor - burada Ana Sayfa'nin bir hero modu olarak uyguluyoruz.
// Kural: tek birincil aksiyon geri donus, suclayan tek kelime yok. "Kac
// gundur duruyor" bilgisini tutan bir alan yok (routeState.paused_at
// disariya sizmiyor) - bu yuzden gun sayisi UYDURULMADI, cumle sayisiz
// yazildi.
export function HomeHeroFrozen({ daysUntilExam, frozenAtStop, frozenDays }) {
  const C = useC();
  const { resume } = useStudyRoute();
  const navigation = useNavigation();

  const stopLine = frozenAtStop
    ? `${frozenAtStop.number}. durakta bıraktın.`
    : "Rotanı bıraktığın yerde duruyor.";
  const examLine = Number.isFinite(daysUntilExam)
    ? `Sınava ${daysUntilExam} gün var — geri döndüğünde rotayı kalan güne göre yeniden çizeriz.`
    : "Geri döndüğünde rotayı kalan güne göre yeniden çizeriz.";

  return (
    <View>
      <Animated.View entering={FadeInDown.duration(480).springify().damping(18)}>
        <HomeHeroEyebrow label="ROTA DONDU" />
        <Text style={[s.title, { color: C.text }]}>
          {frozenDays != null
            ? `Rotan ${frozenDays} gündür duruyor.`
            : "Rotan duruyor."}
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s2 }]}>
          {stopLine} {examLine}
        </Text>
      </Animated.View>

      {frozenAtStop?.subjectLabel ? (
        <Animated.View entering={FadeInDown.delay(80).duration(480).springify().damping(18)} style={s.block}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, letterSpacing: 1.8 }]}>
            BURADA DURDU
          </Text>
          <Card tone="surface" style={s.stopCard}>
            <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>
              {frozenAtStop.subjectLabel}
            </Text>
            {frozenAtStop.topic ? (
              <Text style={[TYPOGRAPHY.caption, { color: C.text2, marginTop: 4 }]}>
                {frozenAtStop.topic}
              </Text>
            ) : null}
          </Card>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(160).duration(480).springify().damping(18)} style={s.block}>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
          Bildirim göndermiyoruz. Rotan olduğu gibi yerinde duruyor.
        </Text>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          style={{ marginTop: STEP.s3 }}
          onPress={() => { H.select(); resume?.(); }}
          accessibilityLabel="Rotaya geri dön"
        >
          Rotaya geri dön
        </Button>
      </Animated.View>
      <Pressable
        onPress={() => navigation.navigate(SCREENS.SETTINGS)}
        hitSlop={10}
        accessibilityRole="button"
        style={s.secondary}
      >
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>
          Hesabımı ve verilerimi indir
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  secondary: { alignItems: "center", marginTop: STEP.s3, minHeight: 44, justifyContent: "center" },
  title: {
    fontFamily: "Bricolage_400",
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -0.6,
    marginTop: STEP.s3,
  },
  block: { marginTop: STEP.s3 },
  stopCard: { marginTop: STEP.s2 },
});
