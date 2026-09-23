import { Chart, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { containerBackground, font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — "Rota" (tasarim: Maraton Widget.dc.html, Widget 2).
//
// Tasarimin notu: "ekran goruntusu alinip paylasilan widget bu". Kahraman
// kalan gun, kanit rota egrisi, sagda son denemelerdeki artis.
//
// MUTLAK NET DEGIL, ARTIS
// Tasarim bilerek "+3,2 net" gosteriyor: ana ekran baskasinin da gordugu bir
// yer, ogrencinin ham neti orada durmamali. Artis gurur verir, net tesir eder.
//
// NE EKSIK
// Tasarimda olculmus hat DUZ, tahmin KESIKLI devam ediyor. SwiftUI Chart tek
// bir veri dizisi aliyor; iki farkli cizgi stili tek grafikte kurulamiyor.
// Simdilik olculmus hat ciziliyor, hedef kesikli referans cizgisi olarak
// duruyor. Tahmin kesigi ayri bir is.
//
// Renkler neden icerde: bkz. TodayWidget.

//
// CIHAZDA COZULEN COKME
// Widget galeride dogru ciziliyor ama ana ekrana yerlestirilince kirmizi bir
// yer tutucu oluyordu. Sebep: iOS 17+ agacinda hic `containerBackground`
// cagrilmayan widget'i DUSURUYOR ve yerine sistem yer tutucusunu koyuyor
// (expo/expo#49015). Kok VStack artik zemini kendisi bildiriyor.
const RouteWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const bg = "#1C1C23";
  const up = "#34D399";
  const text = "#F5F2EF";
  const text3 = "#9794A0";
  const text4 = "#6B6870";

  // Gun sayisi BURADA hesaplaniyor, uygulamadan hazir gelmiyor. Iki sebep:
  // uygulama acilirken sinav baglami henuz yuklenmemis olabiliyor (cihazda
  // "— gün" cikti), ve widget kendi zamanlamasiyla yenilendigi icin sayac
  // uygulama hic acilmasa da dogru kaliyor. environment.date o anki tarih.
  const examISO = props?.examISO || null;
  const now = environment?.date instanceof Date ? environment.date : new Date();
  let days = NaN;
  if (examISO) {
    const exam = new Date(examISO);
    if (!Number.isNaN(exam.getTime())) {
      const dayMs = 86400000;
      const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const b = Date.UTC(exam.getFullYear(), exam.getMonth(), exam.getDate());
      days = Math.max(0, Math.round((b - a) / dayMs));
    }
  }
  const delta = Number(props?.delta);
  const trialCount = Number(props?.trialCount) || 0;
  const target = Number(props?.target) || 0;
  const points = Array.isArray(props?.points) ? props.points : [];
  const compact = environment?.widgetFamily === "systemSmall";

  const hasLine = points.length >= 2;
  const hasDelta = Number.isFinite(delta) && trialCount > 0;
  const deltaText = hasDelta
    ? `${delta > 0 ? "+" : ""}${(Math.round(delta * 10) / 10).toString().replace(".", ",")} net`
    : null;

  const data = points.map((p, i) => ({ x: p.label || String(i), y: Number(p.net) || 0 }));

  return (
    <VStack modifiers={[containerBackground(bg, "widget"), padding({ all: compact ? 14 : 16 })]}>
      <HStack>
        <VStack>
          <HStack>
            <Text modifiers={[font({ size: 9.5, weight: "bold" }), foregroundStyle(accent)]}>
              SINAVA
            </Text>
            <Spacer />
          </HStack>
          <HStack>
            <Text modifiers={[font({ size: compact ? 44 : 40 }), foregroundStyle(text)]}>
              {Number.isFinite(days) ? String(Math.max(0, days)) : "—"}
            </Text>
            <Text modifiers={[font({ size: 13, weight: "semibold" }), foregroundStyle(text3)]}>
              {" gün"}
            </Text>
            <Spacer />
          </HStack>
        </VStack>

        {!compact && deltaText ? (
          <VStack>
            <HStack>
              <Spacer />
              <Text modifiers={[font({ size: 26 }), foregroundStyle(delta >= 0 ? up : text3)]}>
                {deltaText}
              </Text>
            </HStack>
            <HStack>
              <Spacer />
              <Text modifiers={[font({ size: 10.5, weight: "semibold" }), foregroundStyle(text3)]}>
                {`son ${trialCount} denemede`}
              </Text>
            </HStack>
          </VStack>
        ) : null}
      </HStack>

      <Spacer />

      {hasLine ? (
        <Chart
          data={data}
          type="line"
          showGrid={false}
          showLegend={false}
          animate={false}
          lineStyle={{ color: accent, width: 2.6, pointStyle: "circle", pointSize: 5 }}
          referenceLines={target > 0 ? [{ x: "", y: target }] : undefined}
          ruleStyle={{ color: text4, lineWidth: 1, dashArray: [3, 4] }}
        />
      ) : (
        // Tasarim: bos durum cagri gibi durur, kutu gibi degil.
        <HStack>
          <Text modifiers={[font({ size: 11.5, weight: "medium" }), foregroundStyle(text3)]}>
            Rotan ilk denemenle çizilir.
          </Text>
          <Spacer />
        </HStack>
      )}

      {compact && deltaText ? (
        <HStack>
          <Text modifiers={[font({ size: 17 }), foregroundStyle(delta >= 0 ? up : text3)]}>
            {deltaText}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 10.5, weight: "semibold" }), foregroundStyle(text3)]}>
            {`${trialCount} denemede`}
          </Text>
        </HStack>
      ) : null}
    </VStack>
  );
};

export default createWidget("MaratonRoute", RouteWidget);
