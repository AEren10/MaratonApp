import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { StatBlock } from "../../../../components/design/StatBlock";
import { useC } from "../../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { firstDayHero } from "../../../../domain/route/firstDayHero";
import { HomeCTAButton } from "../HomeCTAButton";
import { FirstDayRouteLine } from "./FirstDayRouteLine";
import { FirstDayStop } from "./FirstDayStop";

// İLK GÜN ANA SAYFASI
//
// Kahraman sayi eskiden "0" idi: ekranin en pahali tipografisi (96px
// Bricolage) kullanici hakkinda en anlamsiz seyi soyluyordu, ustelik hayalet
// renkte. Yaninda kullanicinin KENDI girdigi hedef 26px dipnottu. Artik hero
// kullanicinin beyanindan turuyor (fark -> hedef -> durak -> gun).
//
// Silinen tek sey uygulamanin BOS OLDUGU ICIN OZUR DILEDIGI kesik cerceveli
// kutuydu ("Deneme girdikce burada ne gorunur?"). Bir ara ekran uc bloga
// indirilmisti ve alt yarisi komple bos kaldi -- sadelestirme adina icerik
// silinmis oldu. Durak karti ve rota cumlesi geri geldi: onlar ozur degil,
// kullaniciya bugun ne yapacagini soyleyen seyler.

function routeSentence(daysUntilExam, totalStops, tempo) {
  const tail = "Bugün ilk durakla başlıyoruz; her durak geçtiğinde bu çizgi biraz daha uzuyor.";
  const days = daysUntilExam == null ? null : Math.max(0, daysUntilExam);
  if (days != null && totalStops && tempo) {
    return `YKS'ye ${days} gün, rotanda ${totalStops} durak var — ${tempo}. ${tail}`;
  }
  if (days != null && totalStops) return `YKS'ye ${days} gün, rotanda ${totalStops} durak var. ${tail}`;
  if (days != null) return `YKS'ye ${days} gün. ${tail}`;
  if (totalStops) return `Rotanda ${totalStops} durak var. ${tail}`;
  return tail;
}

export function HomeFirstDay({ dailyGoal, hero, onStartTask, onViewRoute, onSetGoal, onSeeHome }) {
  const C = useC();
  const { daysUntilExam, stopCounts, nextTask, declared, ctaSubtitle } = hero;
  const stat = firstDayHero({ declared, stopCount: stopCounts?.total, daysUntilExam });
  const enter = (i) => FadeInDown.delay(i * 90).duration(520);

  const meta = [
    daysUntilExam != null ? `YKS'ye ${Math.max(0, daysUntilExam)} gün` : null,
    `bugün ${0}/${dailyGoal} soru`,
  ].filter(Boolean).join(" · ");

  return (
    <View>
      <Animated.View entering={enter(0)} style={s.top}>
        {stat ? (
          <StatBlock label={stat.label} value={stat.value} unit={stat.unit} size="hero">
            <Text style={[TYPOGRAPHY.body, s.meta, { color: C.text3 }]}>{meta}</Text>
          </StatBlock>
        ) : null}

        {/* Hedef yoksa ekran susmaz, ISTER. 30 saniyelik bir is ve ertesi gun
            butun ekranlari dolduruyor. */}
        {stat?.invite ? (
          <Pressable
            onPress={onSetGoal}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [s.invite, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[TYPOGRAPHY.captionMedium, s.inviteText, { color: C.accentBright }]}>
              {stat.invite}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>

      <FirstDayRouteLine
        declared={declared}
        stopCount={stopCounts?.total}
        onPress={onViewRoute}
      />

      {/* Uc bloga indirmek ekranin alt yarisini komple bos birakti. Silinmesi
          gereken sey uygulamanin ozur dilemesiydi, kullaniciya ne oldugunu
          anlatan icerik degil. */}
      <Animated.View entering={enter(1)}>
        <Text style={[TYPOGRAPHY.body, s.summary, { color: C.text2 }]}>
          {routeSentence(daysUntilExam, stopCounts?.total, declared?.tempo)}
        </Text>
        <FirstDayStop task={nextTask} />
      </Animated.View>

      <Animated.View entering={enter(2)} style={s.actions}>
        <HomeCTAButton
          title={nextTask ? "İlk durağa başla" : "İlk durağını ekle"}
          subtitle={ctaSubtitle}
          onPress={() => onStartTask?.(nextTask)}
        />

        {/* Bu hero normal Ana Sayfa'nin YERINE geciyor. Ilk duragi
            tamamlamadan asil ekrani gormenin yolu yoktu. */}
        <Pressable
          onPress={onSeeHome}
          accessibilityRole="button"
          accessibilityLabel="Ana sayfayı göster"
          hitSlop={8}
          style={({ pressed }) => [s.seeHome, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[TYPOGRAPHY.captionMedium, s.seeHomeText, { color: C.text2 }]}>
            Ana sayfayı göster
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingTop: STEP.s4 },
  meta: { marginTop: STEP.s2 + 2 },
  invite: { marginTop: STEP.s2, minHeight: 44, justifyContent: "center" },
  inviteText: { textDecorationLine: "underline" },
  summary: { marginTop: STEP.s3 },
  actions: { marginTop: STEP.s4 - 4 },
  seeHome: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: STEP.s2 },
  seeHomeText: { textDecorationLine: "underline" },
});
