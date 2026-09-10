import { View, Text, Share, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../../../components/design/Icon";
import { Button } from "../../../../components/design/Button";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { HomeHeroEyebrow } from "./HomeHeroEyebrow";

const CHECKLIST = [
  { text: "Kimlik", meta: "zorunlu", done: true },
  { text: "Kurşun kalem, silgi, kalemtıraş", done: true },
  { text: "Analog saat", done: false },
  { text: "Şeffaf pet su", done: false },
];

function formatExamDate(examDate) {
  if (!examDate) return null;
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" })
      .format(examDate)
      .toUpperCase();
  } catch {
    return null;
  }
}

// Tasarim AKIS 14 · "Sınav Günü": bugün sayı yok, istatistik yok. Hero'nun
// dev sayısı ve grafiği burada BİLEREK yok — o gün ölçüm değil, teslimat var.
// Sınav yeri/saat bilgisi kaynağı yok, o blok DOĞRULANMADI: render edilmiyor.
export function HomeHeroExamDay({ examDate }) {
  const C = useC();
  const dateLabel = formatExamDate(examDate);

  const handleShare = () => {
    Share.share({ message: "Rotam tamam. Bugün sınav günü." }).catch(() => {});
  };

  return (
    <View>
      <Animated.View entering={FadeInDown.duration(480).springify().damping(18)}>
        <HomeHeroEyebrow label={dateLabel ? `${dateLabel} · SINAV GÜNÜ` : "SINAV GÜNÜ"} />
        <Text style={[s.title, { color: C.text }]}>Yolun sonundasın.</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s2 }]}>
          Bugün sayı yok, istatistik yok. Çizmeye başladığın rota tamamlandı.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(480).springify().damping(18)} style={s.block}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, letterSpacing: 1.8 }]}>
          ÇANTANDA OLMASI GEREKENLER
        </Text>
        {CHECKLIST.map((item, i) => (
          <View key={item.text} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
            <View
              style={[
                s.box,
                item.done
                  ? { backgroundColor: C.accent, borderColor: C.accent }
                  : { borderColor: C.border, borderWidth: 1.8 },
              ]}
            >
              {item.done ? <Icon name="check" size={12} color={C.textOnBrand} sw={2.2} /> : null}
            </View>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: item.done ? C.text : C.text2, flex: 1 }]}>
              {item.text}
            </Text>
            {item.meta ? (
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{item.meta}</Text>
            ) : null}
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(480).springify().damping(18)} style={s.block}>
        <Button variant="primary" size="lg" fullWidth onPress={handleShare}>
          Rotamı paylaş
        </Button>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s2, textAlign: "center" }]}>
          Sınavdan sonra görüşürüz. Netini girmek için acele etme.
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  title: {
    fontFamily: "Bricolage_400",
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    marginTop: STEP.s3,
  },
  block: { marginTop: STEP.s4 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2 },
  box: { width: 22, height: 22, borderRadius: 4, alignItems: "center", justifyContent: "center" },
});
