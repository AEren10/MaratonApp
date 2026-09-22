import { Chart, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

import { buildPalette } from "../themes/palette";

// ANA EKRAN WIDGET'I — haftanin emegi.
//
// NEDEN BU GRAFIK
// Rota egrisi widget'a girmez: ayda bir kipirdar, ana ekranda olu durur.
// Haftalik cubuklar her gun degisiyor ve tek bakista okunuyor -- widget'in
// istedigi tam olarak bu.
//
// NEDEN HOOK YOK, ASYNC YOK
// Widget AYRI bir JS calisma zamaninda yasiyor: uygulama state'ine,
// Redux'a, Supabase'e erisemez. Gordugu her sey props'tan gelir ve uygulama
// bunu `updateSnapshot` ile yazar (bkz. src/lib/widgetSync.js).
//
// Palet import EDILEBILIYOR cunku palette.js saf JS -- react-native
// import etmiyor. Renkleri elle yazmiyoruz, tek kaynak yine tokenlar.
const C = buildPalette("dark");

const WeekWidget = (props, environment) => {
  "widget";

  const days = Array.isArray(props?.days) ? props.days : [];
  const goal = Number(props?.goal) || 0;
  const solved = Number(props?.solved) || 0;
  const compact = environment?.widgetFamily === "systemSmall";

  // Hedefi tutturan gun yesil, tutturamayan kizil, calisilmamis gun soluk iz.
  // Uygulamadaki grafikle ayni kural; iki yerde farkli konusmasinlar.
  const data = days.map((day) => ({
    x: day.label,
    y: day.questions > 0 ? day.questions : 0,
    color: day.questions <= 0
      ? C.track
      : (goal > 0 && day.questions >= goal ? C.up : C.accent),
  }));

  const reference = goal > 0 ? [{ x: "", y: goal }] : undefined;

  return (
    <VStack modifiers={[padding({ all: compact ? 10 : 14 })]}>
      <HStack>
        <Text modifiers={[font({ size: 10, weight: "semibold" }), foregroundStyle(C.text2)]}>
          BU HAFTA
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 10, weight: "semibold" }), foregroundStyle(C.text3)]}>
          {goal > 0 ? `HEDEF ${goal}` : ""}
        </Text>
      </HStack>

      <HStack>
        <Text modifiers={[font({ size: compact ? 30 : 38, weight: "regular" }), foregroundStyle(C.text)]}>
          {String(solved)}
        </Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(C.text3)]}>
          {goal > 0 ? ` /${goal}` : " soru"}
        </Text>
        <Spacer />
      </HStack>

      <Chart
        data={data}
        type="bar"
        showGrid={false}
        showLegend={false}
        animate={false}
        barStyle={{ cornerRadius: 3 }}
        referenceLines={reference}
        ruleStyle={{ color: C.text4, lineWidth: 1, dashArray: [4, 6] }}
      />
    </VStack>
  );
};

export default createWidget("MaratonWeek", WeekWidget);
