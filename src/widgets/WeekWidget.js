import { HStack, Spacer, Text, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  background, containerBackground, font, foregroundStyle, frame, padding, shapes, strokeBorder,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — haftanin emegi.
//
// NEDEN BU GRAFIK
// Rota egrisi widget'a girmez: ayda bir kipirdar, ana ekranda olu durur.
// Haftalik cubuklar her gun degisiyor ve tek bakista okunuyor.
//
// NEDEN <Chart> DEGIL, ELLE CIZIM
// @expo/ui'nin Chart'i bos gunu cizemiyor: calisilmamis gune %5'lik SAHTE bir
// cubuk koymak zorunda kaliyorduk, yoksa tuval bombos duruyordu. Ayrica tek
// Chart tek mark tipi aliyor; cubuk basina kesikli cerceve ya da deger
// etiketi vermiyor. ZStack + frame + background ile hepsi cikiyor ve
// uygulamadaki grafikle AYNI dili konusuyor: bos gun bir yuzey (dolacak yer),
// dolu gun accent.
//
// NEDEN HOOK YOK, ASYNC YOK
// Widget AYRI bir JS calisma zamaninda: uygulama state'ine, Redux'a,
// Supabase'e erisemez. Gordugu her sey props'tan gelir, uygulama bunu
// updateSnapshot ile yazar (bkz. src/lib/widgetSync.ios.js).
//
// NEDEN RENKLER FONKSIYONUN ICINDE, TOKENDAN IMPORT DEGIL
// 'widget' direktifi bu fonksiyonu ayri bir pakete cikariyor ve DIS KAPSAMLA
// bagini kopariyor. Modul govdesinde const C = buildPalette(...) yazip
// iceride kullanmak cihazda "Can't find variable: C" ile patliyor — denendi.
// Degerler bu yuzden fonksiyonun icinde, duz sabit olarak duruyor.
// tests/widgets/widgetPalette.test.mjs bunlari buildPalette("dark")
// ciktisiyla karsilastiriyor; palet degisir de burasi degismezse test kirilir.
//
// CIHAZDA COZULEN COKME
// iOS 17+ agacinda hic containerBackground cagrilmayan widget'i DUSURUYOR ve
// yerine kirmizi sistem yer tutucusunu koyuyor (expo/expo#49015). Kok VStack
// zemini kendisi bildiriyor.
const WeekWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const accentBright = "#FF4D57";
  const bg = "#1C1C23";
  const up = "#34D399";
  const text = "#F5F2EF";
  const text2 = "#A3A0A8";
  const text3 = "#9794A0";
  const text4 = "#6B6870";
  const track = "#33333A";

  const days = Array.isArray(props?.days) ? props.days : [];
  const goal = Number(props?.goal) || 0;
  const solved = Number(props?.solved) || 0;
  const compact = environment?.widgetFamily === "systemSmall";

  // Widget'ta olcum yok: yukseklikler sabit, oran elle hesaplanir.
  const plotH = compact ? 38 : 56;
  const barW = compact ? 10 : 13;

  const peak = days.reduce((max, d) => Math.max(max, Number(d.questions) || 0), 0);
  // Tavan uygulamadaki grafikle AYNI kuraldan (WeeklyEffortChart).
  const chartMax = Math.max(Math.round(peak * 1.15), Math.round(goal * 1.22), 10);
  const goalH = goal > 0 ? Math.min(plotH, (goal / chartMax) * plotH) : 0;

  const worked = peak > 0;
  const todayIndex = days.length - 1;

  // Cumle bugunu bir seye BAGLAR; kuru bir toplamdan cok daha ise yarar.
  let bestIndex = -1;
  days.forEach((d, i) => {
    if ((Number(d.questions) || 0) > (Number(days[bestIndex]?.questions) || 0)) bestIndex = i;
  });
  const best = bestIndex >= 0 ? days[bestIndex] : null;
  const remaining = goal > 0 ? Math.max(0, goal - solved) : 0;

  const sentence = !worked
    ? "Bu haftanın ilk sorusunu çöz."
    : remaining > 0
      ? `${remaining} soru daha.`
      : best && Number(best.questions) > 0
        ? `En iyi günün ${best.label}: ${best.questions}.`
        : "Bugünün hedefi tamam.";

  const R = shapes.roundedRectangle({ cornerRadius: 3 });
  const DASH = { lineWidth: 1, dash: [3, 3] };

  const bars = days.map((day, i) => {
    const q = Number(day.questions) || 0;
    const isToday = i === todayIndex;
    const h = q > 0 ? Math.max(3, Math.min(plotH, (q / chartMax) * plotH)) : 0;
    // Hedefi tutturan gun yesil, tutturamayan accent, bugun en acik ton.
    const fill = goal > 0 && q >= goal ? up : (isToday ? accentBright : accent);
    // Kap HEDEF boyunda: o gun doldurulabilecek alan bu kadar. Hedefi asan
    // gun kabin disina tasar, kirpilmaz.
    const capH = Math.max(goalH, h, 3);

    return (
      <VStack key={day.label || String(i)} spacing={3}>
        <ZStack alignment="bottom" modifiers={[frame({ width: barW, height: plotH, alignment: "bottom" })]}>
          {/* Bos yuva KIRMIZI DEGIL, bir yuzey: dolacak yer. Bugun kesikli
              cerceveyle isaretli — burasi henuz dolmadi demenin en sessiz hali. */}
          <VStack
            modifiers={[
              frame({ width: barW, height: capH }),
              background(track, R),
              ...(isToday
                ? [strokeBorder({ content: accent, style: DASH, shape: "roundedRectangle", cornerRadius: 3 })]
                : []),
            ]}
          >
            <Spacer />
          </VStack>
          {h > 0 ? (
            <VStack modifiers={[frame({ width: barW, height: h }), background(fill, R)]}>
              <Spacer />
            </VStack>
          ) : null}
        </ZStack>

        <Text
          modifiers={[
            font({ size: compact ? 8.5 : 9.5, weight: isToday ? "semibold" : "regular" }),
            foregroundStyle(isToday ? accentBright : text4),
          ]}
        >
          {String(day.label || "").slice(0, 2)}
        </Text>
      </VStack>
    );
  });

  return (
    <VStack
      alignment="leading"
      spacing={compact ? 6 : 8}
      modifiers={[containerBackground(bg, "widget"), padding({ all: compact ? 11 : 14 })]}
    >
      <HStack>
        <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(text2)]}>
          BU HAFTA
        </Text>
        <Spacer />
        {goal > 0 ? (
          <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(text4)]}>
            {`HEDEF ${goal}`}
          </Text>
        ) : null}
      </HStack>

      <HStack spacing={2}>
        <Text modifiers={[font({ size: compact ? 30 : 38 }), foregroundStyle(text)]}>
          {String(solved)}
        </Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(text3)]}>
          {goal > 0 ? `/${goal}` : " soru"}
        </Text>
        <Spacer />
      </HStack>

      {days.length ? <HStack spacing={compact ? 5 : 7}>{bars}</HStack> : null}

      <HStack>
        <Text
          modifiers={[
            font({ size: compact ? 10.5 : 11.5, weight: "medium" }),
            foregroundStyle(worked ? text2 : accentBright),
          ]}
        >
          {sentence}
        </Text>
        <Spacer />
      </HStack>
    </VStack>
  );
};

export default createWidget("MaratonWeek", WeekWidget);
