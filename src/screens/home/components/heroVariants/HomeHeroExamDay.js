import { View, Text, Share, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { Button } from "../../../../components/design/Button";
import { useC } from "../../../../contexts/ThemeContext";
import { useAuth } from "../../../../contexts/AuthContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { buildExamRecap } from "../../../../domain/exam/examRecap";
import { TR_MONTHS } from "../../../../domain/exam/examDayPlan";
import { useExamDayBag } from "../../../../hooks/useExamDayBag";
import { ExamCheckRow } from "../../../exam/components/ExamCheckRow";
import { HomeHeroEyebrow } from "./HomeHeroEyebrow";
import { HomeHeroExamDayVenue } from "./HomeHeroExamDayVenue";

// Tasarim AKIS 14 · "Sınav Günü": bugün sayı yok, istatistik yok. Canta ve
// sinav yeri kullanicinin Sınav günü planından; plan yoksa hicbir kalem
// isaretli gelmez ve yer karti cizilmez. Rota cizgisi olcek tasimayan bir
// imza: son duragin varildigini gosterir, sayi iddia etmez.
const FADE = (delay) => FadeInDown.delay(delay).duration(350);

function dateLabel(examDate) {
  const d = examDate instanceof Date ? examDate : new Date(examDate);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`.toLocaleUpperCase("tr-TR");
}

export function HomeHeroExamDay({ examDate }) {
  const C = useC();
  const { user } = useAuth();
  const bag = useExamDayBag();
  const label = examDate ? dateLabel(examDate) : null;
  const { days } = buildExamRecap({ startedAt: user?.created_at, examDate });
  const body = days != null && days > 1
    ? `Bugün sayı yok, istatistik yok. ${days} gün önce çizmeye başladığın rota tamamlandı.`
    : "Bugün sayı yok, istatistik yok. Çizmeye başladığın rota tamamlandı.";

  const handleShare = () => {
    Share.share({ message: "Rotam tamam. Bugün sınav günü." }).catch(() => {});
  };

  return (
    <View>
      <Animated.View entering={FADE(0)}>
        <HomeHeroEyebrow label={label ? `${label} · SINAV GÜNÜ` : "SINAV GÜNÜ"} />
        <Text style={[s.title, { color: C.text }]}>Yolun sonundasın.</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s2 }]}>{body}</Text>
      </Animated.View>

      <Animated.View entering={FADE(100)} style={s.route}>
        <Svg viewBox="0 0 390 150" style={s.svg}>
          <Path d="M 26 126 C 92 118 128 100 176 82 C 240 58 300 40 356 28" fill="none" stroke={C.accent} strokeWidth={4.8} strokeLinecap="round" />
          {[[26, 126], [110, 112], [176, 82], [262, 52]].map(([cx, cy]) => (
            <Circle key={cx} cx={cx} cy={cy} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
          ))}
          <Circle cx={356} cy={28} r={16} fill={C.accent} fillOpacity={0.16} />
          <Circle cx={356} cy={28} r={9} fill={C.accent} />
        </Svg>
        <Text style={[TYPOGRAPHY.label, s.stop, { color: C.accentBright }]}>SON DURAK</Text>
      </Animated.View>

      <Animated.View entering={FADE(180)} style={s.bag}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ÇANTANDA OLMASI GEREKENLER</Text>
        <View style={s.list}>
          {bag.items.map((item) => <ExamCheckRow key={item.key} item={item} onToggle={bag.toggle} />)}
        </View>
      </Animated.View>

      {bag.venue ? (
        <Animated.View entering={FADE(240)} style={s.block}>
          <HomeHeroExamDayVenue venue={bag.venue} place={bag.place} />
        </Animated.View>
      ) : null}

      <Animated.View entering={FADE(300)} style={s.block}>
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
  title: { ...TYPOGRAPHY.display, fontSize: 44, lineHeight: 48, marginTop: STEP.s3 },
  route: { marginTop: STEP.s4 },
  svg: { width: "100%", aspectRatio: 390 / 150 },
  stop: { position: "absolute", right: "5%", top: "6%" },
  bag: { marginTop: STEP.s3 - 2 },
  list: { marginTop: STEP.s1 },
  block: { marginTop: STEP.s3 + 6 },
});
