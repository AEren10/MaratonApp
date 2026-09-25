import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  background, containerBackground, font, foregroundStyle, frame, padding, shapes, strokeBorder,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — seri.
//
// NEDEN IZGARA
// Seri tek bir sayidan ibaret degil: kullanici "kac gun kacirdim, nerede
// kirildi" diye bakiyor. 4x7'lik izgara son dort haftayi tek bakista veriyor,
// sayinin kendisi de ustte duruyor.
//
// NEDEN CHART DEGIL
// Bu bir grafik degil, bir takvim. <Chart> kare izgara cizemiyor;
// VStack + HStack + RoundedRectangle tam istenen seyi veriyor.
//
// NEDEN HOOK YOK, ASYNC YOK
// Widget AYRI bir JS calisma zamaninda: uygulama state'ine, Redux'a,
// Supabase'e erisemez. Gordugu her sey props'tan gelir, uygulama bunu
// updateSnapshot ile yazar (bkz. src/lib/widgetSync.ios.js).
//
// NEDEN RENKLER FONKSIYONUN ICINDE, TOKENDAN IMPORT DEGIL
// 'widget' direktifi bu fonksiyonu ayri bir pakete cikariyor ve DIS KAPSAMLA
// bagini kopariyor; disaridan okunan sabit cihazda "Can't find variable" ile
// patliyor. tests/widgets/widgetPalette.test.mjs degerleri paletle
// karsilastiriyor.
//
// containerBackground SART: iOS 17+ onu cagirmayan widget'i dusurup yerine
// kirmizi sistem yer tutucusu koyuyor (expo/expo#49015).
const StreakWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const accentBright = "#FF4D57";
  const bg = "#1C1C23";
  const text = "#F5F2EF";
  const text2 = "#A3A0A8";
  const text3 = "#9794A0";
  const text4 = "#6B6870";
  const accentDeep = "#A81C26";
  const track = "#33333A";

  // days: eskiden yeniye 28 gun. 0 = calisilmadi, 1 = calisildi,
  // 2 = calisildi VE suren serinin icinde.
  const raw = Array.isArray(props?.days) ? props.days : [];
  const days = raw.slice(-28);
  while (days.length < 28) days.unshift(0);

  const streak = Number(props?.streak) || 0;
  const longest = Number(props?.longest) || 0;
  const todayDone = days[days.length - 1] > 0;
  const compact = environment?.widgetFamily === "systemSmall";

  const cell = compact ? 11 : 14;
  const gapCell = compact ? 3 : 4;
  const R = shapes.roundedRectangle({ cornerRadius: 3 });

  // Rekora yaklasmak seriyi surdurmenin en iyi gerekcesi; yoksa bugunun
  // durumu soylenir. Kuru "13 gun" tek basina bir sey istemiyor.
  const toRecord = longest > streak ? longest - streak + 1 : 0;
  const sentence = !todayDone
    ? "Seri bu gece 23:59'da biter."
    : toRecord > 0
      ? `Rekora ${toRecord} gün var.`
      : streak > 0
        ? "Rekorun şu an kırılıyor."
        : "İlk gününü başlat.";

  const rows = [0, 1, 2, 3].map((r) => (
    <HStack key={`r${r}`} spacing={gapCell}>
      {[0, 1, 2, 3, 4, 5, 6].map((c) => {
        const i = r * 7 + c;
        const v = days[i];
        const isToday = i === 27;
        // Seri ICI accent, seri disi calisilan gun koyu accent, calisilmayan
        // gun track. Bos gun kirmizi DEGIL: accent "olan sey" demek.
        const fill = v === 2 ? accent : v === 1 ? accentDeep : track;
        return (
          <VStack
            key={`c${i}`}
            modifiers={[
              frame({ width: cell, height: cell }),
              background(isToday && !todayDone ? bg : fill, R),
              ...(isToday
                ? [strokeBorder({
                    content: todayDone ? accentBright : accent,
                    style: { lineWidth: 1.5 },
                    shape: "roundedRectangle",
                    cornerRadius: 3,
                  })]
                : []),
            ]}
          >
            <Spacer />
          </VStack>
        );
      })}
    </HStack>
  ));

  return (
    <VStack
      alignment="leading"
      spacing={compact ? 6 : 9}
      modifiers={[containerBackground(bg, "widget"), padding({ all: compact ? 11 : 14 })]}
    >
      <HStack>
        <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(accent)]}>
          SERİ
        </Text>
        <Spacer />
        {longest > 0 ? (
          <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(text4)]}>
            {`EN UZUN ${longest}`}
          </Text>
        ) : null}
      </HStack>

      <HStack spacing={3}>
        <Text modifiers={[font({ size: compact ? 30 : 38 }), foregroundStyle(text)]}>
          {String(streak)}
        </Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(text3)]}>gün</Text>
        <Spacer />
      </HStack>

      <VStack alignment="leading" spacing={gapCell}>{rows}</VStack>

      <HStack>
        <Text
          modifiers={[
            font({ size: compact ? 10.5 : 11.5, weight: "medium" }),
            foregroundStyle(todayDone ? text2 : accentBright),
          ]}
        >
          {sentence}
        </Text>
        <Spacer />
      </HStack>
    </VStack>
  );
};

export default createWidget("MaratonStreak", StreakWidget);
