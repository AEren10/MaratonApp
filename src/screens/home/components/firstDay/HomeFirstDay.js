import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { StatBlock } from "../../../../components/design/StatBlock";
import { useC } from "../../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { firstDayHero } from "../../../../domain/route/firstDayHero";
import { HomeCTAButton } from "../HomeCTAButton";
import { FirstDayRouteLine } from "./FirstDayRouteLine";

// İLK GÜN ANA SAYFASI — üç blok: sayı, hat, eylem.
//
// Eskiden yedi blok vardı ve en büyüğü "0" idi: ekranin en pahali tipografisi
// (96px Bricolage) kullanici hakkinda en anlamsiz seyi soyluyordu, ustelik
// hayalet renkte. Yaninda kullanicinin KENDI girdigi hedef 26px dipnottu.
// Yani ekran, ogrencinin kendi iddiasini uygulamanin muhasebesinden kucuk
// gosteriyordu.
//
// Silinenler ve sebepleri:
// - Kesik cerceveli "Deneme girdikce burada ne gorunur?" kutusu: uygulamanin
//   bos oldugu icin ozur dilemesi. Ayrica dashed kenarlik arayuzde "bu bozuk"
//   demektir.
// - "633 gun, 178 durak, haftada ~2 durak" cumlesi: uc sayi da artik hattin
//   kendisinde gorunuyor. Grafige altyazi yazmak grafige guvenmemektir.
// - Ikinci tam genislik buton: birincil olani zayiflatiyordu. Rotaya gecis
//   artik hattin kendisine basarak.
// - Ayri durak karti: ders ve konu CTA'nin alt satirina katlandi. Ilk 60
//   saniyede verilecek tek karar var, ne oldugu dugmenin ustunde yazmali.
export function HomeFirstDay({ dailyGoal, hero, onStartTask, onViewRoute, onSetGoal }) {
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

      <Animated.View entering={enter(1)} style={s.actions}>
        <HomeCTAButton
          title={nextTask ? "İlk durağa başla" : "İlk durağını ekle"}
          subtitle={ctaSubtitle}
          onPress={() => onStartTask?.(nextTask)}
        />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingTop: STEP.s4 },
  meta: { marginTop: STEP.s2 + 2 },
  invite: { marginTop: STEP.s2, minHeight: 44, justifyContent: "center" },
  inviteText: { textDecorationLine: "underline" },
  actions: { marginTop: STEP.s4 - 4 },
});
