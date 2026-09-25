import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  background, containerBackground, font, foregroundStyle, frame, padding, strikethrough, cornerRadius,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — "Bugünün İşleri".
//
// NEDEN SAYI DEGIL LISTE
// Onceki surum gunun soru sayisini buyutup altina bir ilerleme cubugu
// koyuyordu; ayni bilgi Hafta widget'inda zaten var. Bu widget'in isi
// "simdi ne yapayim" sorusuna cevap vermek. O yuzden kahraman oge
// SIRADAKI IS, sayi ona destek.
//
// KUCUK BOY KIRMIZI ZEMINLI: ana ekranda bir cagri gibi durur, digerlerinden
// ayrilir. Genis boy koyu zeminli, cunku listeyi tasiyor ve kirmizi zemin
// uzerinde dort satir okunmuyor.
//
// NEDEN ISLER TIKLENEMIYOR
// Tasarim widget icinde kutucuk isaretlemeyi oneriyor; bunun icin App Intents
// gerekiyor ve expo-widgets bunu disari vermiyor. Satirlar simdilik salt
// okunur; dokunulunca uygulama aciliyor.
//
// NEDEN HOOK YOK, ASYNC YOK
// Widget AYRI bir JS calisma zamaninda: uygulama state'ine, Redux'a,
// Supabase'e erisemez. Gordugu her sey props'tan gelir, uygulama bunu
// updateSnapshot ile yazar (bkz. src/lib/widgetSync.ios.js).
//
// NEDEN RENKLER FONKSIYONUN ICINDE, TOKENDAN IMPORT DEGIL
// 'widget' direktifi bu fonksiyonu ayri bir pakete cikarip dis kapsamla
// bagini kesiyor; disaridan okunan sabit cihazda "Can't find variable" ile
// patliyor. tests/widgets/widgetPalette.test.mjs degerleri paletle
// karsilastiriyor.
//
// CIHAZDA COZULEN COKME
// iOS 17+ agacinda hic containerBackground cagrilmayan widget'i DUSURUYOR ve
// yerine kirmizi sistem yer tutucusunu koyuyor (expo/expo#49015).
const TodayWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const accentInk = "#F7F2F0";
  const bg = "#1C1C23";
  const up = "#34D399";
  const text = "#F5F2EF";
  const text2 = "#A3A0A8";
  const text3 = "#9794A0";
  const text4 = "#6B6870";
  const track = "#33333A";

  const tasks = Array.isArray(props?.tasks) ? props.tasks : [];
  const dayMinutes = Array.isArray(props?.dayMinutes) ? props.dayMinutes : [];
  const weekMinutes = Number(props?.weekMinutes) || 0;
  const weekGoal = Number(props?.weeklyMinutesGoal) || 0;
  const compact = environment?.widgetFamily === "systemSmall";

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t?.done).length;
  const next = tasks.find((t) => !t?.done) || null;

  const asHours = (m) => {
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h <= 0) return `${r} dk`;
    return r > 0 ? `${h} sa ${r} dk` : `${h} sa`;
  };

  // ---- KUCUK BOY: kirmizi zemin, tek is ----
  if (compact) {
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[containerBackground(next ? accent : bg, "widget"), padding({ all: 13 })]}
      >
        <HStack spacing={2}>
          <Text modifiers={[font({ size: 34 }), foregroundStyle(next ? accentInk : text)]}>
            {String(doneCount)}
          </Text>
          <Text modifiers={[font({ size: 13 }), foregroundStyle(next ? accentInk : text3)]}>
            {`/${total || 0}`}
          </Text>
          <Spacer />
        </HStack>

        <Spacer />

        <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(next ? accentInk : text4)]}>
          {next ? "SIRADAKİ İŞ" : "BUGÜN"}
        </Text>
        <Text modifiers={[font({ size: 14, weight: "semibold" }), foregroundStyle(next ? accentInk : text)]}>
          {next ? next.label : (total > 0 ? "Günün işleri bitti" : "Bugün iş yok")}
        </Text>
        {next && next.minutes > 0 ? (
          <Text modifiers={[font({ size: 11 }), foregroundStyle(next ? accentInk : text3)]}>
            {`${next.minutes} dakika sürer`}
          </Text>
        ) : null}
      </VStack>
    );
  }

  // ---- GENIS BOY: liste + haftanin seridi ----
  const rows = tasks.map((t, i) => (
    <HStack key={`t${i}`} spacing={8}>
      <VStack
        modifiers={[
          frame({ width: 13, height: 13 }),
          background(t.done ? up : track), cornerRadius(3),
        ]}
      >
        <Spacer />
      </VStack>
      <Text
        modifiers={[
          font({ size: 12.5, weight: t.done ? "regular" : "semibold" }),
          foregroundStyle(t.done ? text4 : text),
          ...(t.done ? [strikethrough({ isActive: true, pattern: "solid" })] : []),
        ]}
      >
        {t.label}
      </Text>
      <Spacer />
      <Text
        modifiers={[
          font({ size: 11, weight: "medium" }),
          foregroundStyle(t.done ? text4 : accent),
        ]}
      >
        {t.done ? "bitti" : (t.minutes > 0 ? `${t.minutes} dk` : "")}
      </Text>
    </HStack>
  ));

  // Haftanin yedi parcasi: dolu gun accent, bos gun track. Cubuk DEGIL --
  // sure karsilastirmasi Hafta widget'inin isi, burada yalnizca "kac gun
  // calistim" okunuyor.
  const strip = dayMinutes.map((m, i) => (
    <VStack
      key={`d${i}`}
      modifiers={[frame({ width: 26, height: 4 }), background(m > 0 ? accent : track), cornerRadius(2)]}
    >
      <Spacer />
    </VStack>
  ));

  return (
    <VStack
      alignment="leading"
      spacing={9}
      modifiers={[containerBackground(bg, "widget"), padding({ all: 14 })]}
    >
      <HStack>
        <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(accent)]}>
          BUGÜNÜN İŞLERİ
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 9.5, weight: "semibold" }), foregroundStyle(text4)]}>
          {`${doneCount}/${total || 0}`}
        </Text>
      </HStack>

      {rows.length ? (
        <VStack alignment="leading" spacing={7}>{rows}</VStack>
      ) : (
        <Text modifiers={[font({ size: 12.5, weight: "medium" }), foregroundStyle(text2)]}>
          Bugün için durak yok. Rotanı aç, bir tane ekle.
        </Text>
      )}

      <Spacer />

      <HStack>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(text2)]}>
          {`Bu hafta ${asHours(weekMinutes)}`}
        </Text>
        <Spacer />
        {weekGoal > 0 ? (
          <Text modifiers={[font({ size: 11 }), foregroundStyle(text4)]}>
            {`hedef ${asHours(weekGoal)}`}
          </Text>
        ) : null}
      </HStack>

      {strip.length ? <HStack spacing={4}>{strip}</HStack> : null}
    </VStack>
  );
};

export default createWidget("MaratonToday", TodayWidget);
