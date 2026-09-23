import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { containerBackground, font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — "Tekrar" (tasarim: Maraton Widget.dc.html, Widget 3).
//
// NEDEN BU WIDGET ONEMLI
// Aralikli tekrar bu uygulamanin net kazandiran tek mekanizmasi ve tamamen
// sessiz calisiyordu: sorular birikiyor, ogrenci Deftere girmedikce haberi
// olmuyordu. Ana ekrandaki kart bunu icerde cozdu; bu widget uygulamayi hic
// acmadan cozuyor.
//
// Renkler neden icerde: bkz. TodayWidget.

//
// CIHAZDA COZULEN COKME
// Widget galeride dogru ciziliyor ama ana ekrana yerlestirilince kirmizi bir
// yer tutucu oluyordu. Sebep: iOS 17+ agacinda hic `containerBackground`
// cagrilmayan widget'i DUSURUYOR ve yerine sistem yer tutucusunu koyuyor
// (expo/expo#49015). Kok VStack artik zemini kendisi bildiriyor.
const ReviewWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const bg = "#1C1C23";
  const text = "#F5F2EF";
  const text2 = "#A3A0A8";
  const text3 = "#9794A0";

  const due = Number(props?.due) || 0;
  const subjects = Number(props?.subjects) || 0;
  const compact = environment?.widgetFamily === "systemSmall";

  return (
    <VStack modifiers={[containerBackground(bg, "widget"), padding({ all: compact ? 14 : 16 })]}>
      <HStack>
        <Text modifiers={[font({ size: 9.5, weight: "bold" }), foregroundStyle(accent)]}>
          TEKRAR
        </Text>
        <Spacer />
      </HStack>

      <Spacer />

      {due > 0 ? (
        <VStack>
          <HStack>
            <Text modifiers={[font({ size: compact ? 50 : 44 }), foregroundStyle(text)]}>
              {String(due)}
            </Text>
            <Text modifiers={[font({ size: 13, weight: "semibold" }), foregroundStyle(text3)]}>
              {" soru bekliyor"}
            </Text>
            <Spacer />
          </HStack>
          <HStack>
            <Text modifiers={[font({ size: 11.5, weight: "medium" }), foregroundStyle(text2)]}>
              {subjects > 1 ? `${subjects} ders · dokun ve başla` : "Dokun ve başla"}
            </Text>
            <Spacer />
          </HStack>
        </VStack>
      ) : (
        // Tasarim: bos durum kutu gibi degil cagri gibi durur.
        <VStack>
          <HStack>
            <Text modifiers={[font({ size: compact ? 24 : 26 }), foregroundStyle(text)]}>
              Tekrar bekleyen yok
            </Text>
            <Spacer />
          </HStack>
          <HStack>
            <Text modifiers={[font({ size: 11, weight: "medium" }), foregroundStyle(text3)]}>
              Yanlışını ekle, zamanı gelince hatırlatayım.
            </Text>
            <Spacer />
          </HStack>
        </VStack>
      )}

      <Spacer />
    </VStack>
  );
};

export default createWidget("MaratonReview", ReviewWidget);
