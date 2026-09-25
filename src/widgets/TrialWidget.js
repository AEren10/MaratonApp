import { Chart, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { containerBackground, font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — deneme netleri.
//
// NEDEN AYRI BIR WIDGET
// Rota widget'i sinava kalan gunu ve rotanin egrisini tasiyor; ikisi de
// ayda bir kipirdar ama sayac her gun dogru kalmali. Deneme netleri bambaska
// bir ritim: iki haftada bir zipliyor ve ogrenci en cok ona bakiyor.
// Ikisini tek widget'a sikistirmak yerine ayri durak actik.
//
// NEDEN SON NOKTA AYRI STILDE DEGIL
// Tasarim son noktayi ayri bir PointMark olarak istiyor. @expo/ui'nin
// <Chart>'i tek mark tipi aliyor; iki mark'i ust uste koymanin yolu yok.
// Son deneme bunun yerine SAYIYLA one cikiyor: ustteki kahraman net zaten
// sonuncusu.
//
// NEDEN HOOK YOK, ASYNC YOK
// Widget AYRI bir JS calisma zamaninda: uygulama state'ine, Redux'a,
// Supabase'e erisemez. Gordugu her sey props'tan gelir, uygulama bunu
// updateSnapshot ile yazar (bkz. src/lib/widgetSync.ios.js).
//
// NEDEN RENKLER FONKSIYONUN ICINDE, TOKENDAN IMPORT DEGIL
// 'widget' direktifi fonksiyonu ayri bir pakete cikarip dis kapsamla bagini
// kesiyor; disaridan okunan sabit cihazda "Can't find variable" ile patliyor.
// tests/widgets/widgetPalette.test.mjs degerleri paletle karsilastiriyor.
//
// CIHAZDA COZULEN COKME
// iOS 17+ agacinda hic containerBackground cagrilmayan widget'i DUSURUYOR ve
// yerine kirmizi sistem yer tutucusunu koyuyor (expo/expo#49015).
const TrialWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const bg = "#1C1C23";
  const up = "#34D399";
  const down = "#8A8790";
  const text = "#F5F2EF";
  const text2 = "#A3A0A8";
  const text3 = "#9794A0";
  const text4 = "#6B6870";

  const points = Array.isArray(props?.points) ? props.points : [];
  const subjects = Array.isArray(props?.subjects) ? props.subjects : [];
  const compact = environment?.widgetFamily === "systemSmall";

  const last = points.length ? points[points.length - 1] : null;
  const prev = points.length > 1 ? points[points.length - 2] : null;
  const delta = last && prev ? Number((last.net - prev.net).toFixed(1)) : null;

  // Dusus KIRMIZI DEGIL: tasarimin kurali, kotu haber bagirmaz.
  const deltaColor = delta == null ? text3 : delta > 0 ? up : delta < 0 ? down : text3;
  const deltaLabel = delta == null ? "" : `${delta > 0 ? "+" : ""}${delta}`;

  const fmt = (n) => String(Number(n).toFixed(1)).replace(".", ",");

  // En cok dusen ders cumleye girer: ogrenci uygulamayi en cok onun icin
  // aciyor. Artis zaten ustteki sayida gorunuyor.
  const worst = subjects.length
    ? subjects.reduce((w, s) => (Number(s.delta) < Number(w.delta) ? s : w), subjects[0])
    : null;

  const chartData = points.map((p, i) => ({ x: String(i + 1), y: Number(p.net) || 0 }));

  if (!points.length) {
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[containerBackground(bg, "widget"), padding({ all: compact ? 13 : 15 })]}
      >
        <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(accent)]}>
          DENEME
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 14, weight: "semibold" }), foregroundStyle(text)]}>
          İlk denemeni gir.
        </Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(text3)]}>
          Netlerin buraya düşer.
        </Text>
      </VStack>
    );
  }

  return (
    <VStack
      alignment="leading"
      spacing={compact ? 5 : 8}
      modifiers={[containerBackground(bg, "widget"), padding({ all: compact ? 13 : 15 })]}
    >
      <HStack>
        <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(accent)]}>
          {compact ? "SON DENEME" : `${points.length}. DENEME`}
        </Text>
        <Spacer />
      </HStack>

      <HStack spacing={6}>
        <Text modifiers={[font({ size: compact ? 32 : 40 }), foregroundStyle(text)]}>
          {fmt(last.net)}
        </Text>
        {delta != null ? (
          <Text modifiers={[font({ size: 14, weight: "semibold" }), foregroundStyle(deltaColor)]}>
            {deltaLabel}
          </Text>
        ) : null}
        <Spacer />
      </HStack>

      {chartData.length > 1 ? (
        <Chart
          data={chartData}
          type="line"
          showGrid={false}
          showLegend={false}
          animate={false}
          lineStyle={{ color: accent, width: 2.4, pointStyle: "circle", pointSize: 5 }}
        />
      ) : null}

      {!compact && subjects.length ? (
        <VStack alignment="leading" spacing={3}>
          {subjects.slice(0, 4).map((s, i) => {
            const d = Number(s.delta) || 0;
            return (
              <HStack key={`s${i}`}>
                <Text modifiers={[font({ size: 11.5 }), foregroundStyle(text2)]}>{s.label}</Text>
                <Spacer />
                <Text
                  modifiers={[
                    font({ size: 11.5, weight: "semibold" }),
                    foregroundStyle(d > 0 ? up : d < 0 ? down : text4),
                  ]}
                >
                  {`${d > 0 ? "+" : ""}${fmt(d)}`}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      ) : null}

      {worst && Number(worst.delta) < 0 ? (
        <Text modifiers={[font({ size: 11, weight: "medium" }), foregroundStyle(text2)]}>
          {`${worst.label} ${fmt(Math.abs(worst.delta))} net düştü.`}
        </Text>
      ) : null}
    </VStack>
  );
};

export default createWidget("MaratonTrial", TrialWidget);
