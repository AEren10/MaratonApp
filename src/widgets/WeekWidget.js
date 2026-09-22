import { Chart, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — haftanin emegi.
//
// NEDEN BU GRAFIK
// Rota egrisi widget'a girmez: ayda bir kipirdar, ana ekranda olu durur.
// Haftalik cubuklar her gun degisiyor ve tek bakista okunuyor.
//
// NEDEN HOOK YOK, ASYNC YOK
// Widget AYRI bir JS calisma zamaninda: uygulama state'ine, Redux'a,
// Supabase'e erisemez. Gordugu her sey props'tan gelir, uygulama bunu
// `updateSnapshot` ile yazar (bkz. src/lib/widgetSync.ios.js).
//
// NEDEN RENKLER FONKSIYONUN ICINDE, TOKENDAN IMPORT DEGIL
// `'widget'` direktifi bu fonksiyonu ayri bir pakete cikariyor ve DIS
// KAPSAMLA bagini kopariyor. Modul govdesinde `const C = buildPalette(...)`
// yazip iceride kullanmak cihazda "Can't find variable: C" ile patliyor --
// denendi. Degerler bu yuzden fonksiyonun icinde, duz sabit olarak duruyor.
// Elle senkron tutulmasinlar diye tests/widgets/weekWidgetPalette.test.mjs
// bunlari buildPalette("dark") ciktisiyla karsilastiriyor; palet degisir de
// burasi degismezse test kirilir.

const WeekWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
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

  // Hedefi tutturan gun yesil, tutturamayan kizil, calisilmamis gun soluk iz.
  // Uygulamadaki grafikle ayni kural; iki yerde farkli konusmasinlar.
  // BOS HAFTA KUTU GIBI DURMAZ
  // Hic soru cozulmemisken Chart'in cizecegi bir sey yok: kesikli hedef
  // cizgisiyle bos bir kutu kaliyor ve widget bozuk gibi gorunuyor.
  // Tasarimin kurali bos durumun cagri gibi durmasi.
  const worked = days.some((day) => Number(day.questions) > 0);

  const data = days.map((day) => ({
    x: day.label,
    y: day.questions > 0 ? day.questions : 0,
    color: day.questions <= 0 ? track : (goal > 0 && day.questions >= goal ? up : accent),
  }));

  return (
    <VStack modifiers={[padding({ all: compact ? 10 : 14 })]}>
      <HStack>
        <Text modifiers={[font({ size: 10, weight: "semibold" }), foregroundStyle(text2)]}>
          BU HAFTA
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 10, weight: "semibold" }), foregroundStyle(text3)]}>
          {goal > 0 ? `HEDEF ${goal}` : ""}
        </Text>
      </HStack>

      <HStack>
        <Text modifiers={[font({ size: compact ? 30 : 38 }), foregroundStyle(text)]}>
          {String(solved)}
        </Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(text3)]}>
          {goal > 0 ? ` /${goal}` : " soru"}
        </Text>
        <Spacer />
      </HStack>

      {worked ? (
      <Chart
        data={data}
        type="bar"
        showGrid={false}
        showLegend={false}
        animate={false}
        barStyle={{ cornerRadius: 3 }}
        referenceLines={goal > 0 ? [{ x: "", y: goal }] : undefined}
        ruleStyle={{ color: text4, lineWidth: 1, dashArray: [4, 6] }}
      />
      ) : (
        <HStack>
          <Text modifiers={[font({ size: 11.5, weight: "medium" }), foregroundStyle(text2)]}>
            Bu haftanın ilk sorusunu çöz.
          </Text>
          <Spacer />
        </HStack>
      )}
    </VStack>
  );
};

export default createWidget("MaratonWeek", WeekWidget);
