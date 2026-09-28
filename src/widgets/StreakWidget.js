import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  background, containerBackground, cornerRadius, font, foregroundStyle, frame, padding, strokeBorder, widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — SERI (tasarim 3a).
//
// Izgara HAFTA GUNLERINE hizali: son satir bu hafta, sutunlar Pt..Pa.
// Suren serinin gunleri parlak kirmizi, seriden once calisilan gunler koyu
// kirmizi, calisilmayan gun yuzey; bu haftanin gelecek gunleri kesikli.
// Bugun bossa karesi kirmizi cerceveli: "burasi bu gece dolmali".
//
// days: son 28 gun, eskiden yeniye. 0 bos · 1 calisildi · 2 suren seride.
// Renkler fonksiyonun ICINDE; paletle esitligini widgetPalette testi denetler.
const StreakWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const accentBright = "#FF6A72";
  const accentDeep = "#A81C26";
  const bg = "#1C1C23";
  const text = "#ECE8E4";
  const text2 = "#B0ADB5";
  const text3 = "#A3A0AB";
  const text4 = "#827F88";
  const track = "#333239";

  const SHORT = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];
  const LONG = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const now = environment?.date instanceof Date ? environment.date : new Date();
  const todayIdx = (now.getDay() + 6) % 7;

  // Veri "asOf" gununde yazildi; timeline'in sonraki gunlerinde izgara o
  // kadar kayar (yeni gunler bos). Iki gun ve fazlasi: seri muhtemelen koptu.
  let shift = 0;
  if (props?.asOf) {
    const [y, m, d] = String(props.asOf).split("-").map(Number);
    const a = Date.UTC(y, m - 1, d);
    const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    shift = Math.max(0, Math.round((b - a) / 86400000));
  }
  let raw = Array.isArray(props?.days) ? props.days.slice(-28) : [];
  while (raw.length < 28) raw.unshift(0);
  if (shift > 0) raw = raw.slice(Math.min(shift, 28)).concat(Array(Math.min(shift, 28)).fill(0));
  const streak = shift >= 2 ? 0 : Number(props?.streak) || 0;
  const longest = Math.max(Number(props?.longest) || 0, streak);
  const todayDone = raw[27] > 0;
  const compact = environment?.widgetFamily === "systemSmall";

  // Rekoru gecme gunu: seri bugun surerse kac gun sonra rekor asilir.
  const gapToRecord = longest - streak;
  let sentence;
  if (streak === 0) sentence = todayDone ? "Seri başladı." : "İlk gününü başlat.";
  else if (!todayDone) sentence = "Seri bu gece 23:59'da biter";
  else if (streak > 0 && gapToRecord === 0) sentence = "Rekorun şu an kırılıyor.";
  else if (gapToRecord > 0) {
    const passDay = LONG[(todayIdx + gapToRecord + 1) % 7];
    sentence = compact || gapToRecord > 5
      ? `Rekora ${gapToRecord} gün var.`
      : `Rekora ${gapToRecord} gün var. ${passDay} geçersin.`;
  } else sentence = "İlk gününü başlat.";

  const cell = compact ? 12 : 21;
  const gap = 4;

  const rows = [0, 1, 2, 3].map((r) => (
    <HStack key={`r${r}`} spacing={gap}>
      {SHORT.map((_, c) => {
        const ago = (3 - r) * 7 + (todayIdx - c);
        const future = ago < 0;
        const v = !future && ago <= 27 ? raw[27 - ago] : 0;
        const isToday = ago === 0;
        const fill = future ? bg : isToday && !todayDone ? bg : v === 2 ? accent : v === 1 ? accentDeep : track;
        const ring = future
          ? [strokeBorder({ content: text4, style: { lineWidth: 1, dash: [2, 2] }, shape: "roundedRectangle", cornerRadius: 4 })]
          : isToday
            ? [strokeBorder({ content: todayDone ? text : accent, style: { lineWidth: 1.5 }, shape: "roundedRectangle", cornerRadius: 4 })]
            : [];
        return (
          <VStack key={`c${c}`} modifiers={[frame({ width: cell, height: cell }), background(isToday && todayDone ? accentBright : fill),
            cornerRadius(4), ...ring]}>
            <Spacer />
          </VStack>
        );
      })}
    </HStack>
  ));

  const grid = <VStack spacing={gap}>{rows}</VStack>;
  const url = widgetURL("maraton://home");

  if (compact) {
    return (
      <VStack alignment="leading" spacing={4} modifiers={[containerBackground(bg, "widget"), padding({ all: 13 }), url]}>
        <HStack alignment="lastTextBaseline" spacing={3}>
          <Text modifiers={[font({ size: 34 }), foregroundStyle(accentBright)]}>{String(streak)}</Text>
          <Text modifiers={[font({ size: 14 }), foregroundStyle(text3)]}>gün</Text>
        </HStack>
        <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(text)]}>{sentence}</Text>
        <Spacer />
        {grid}
      </VStack>
    );
  }

  const header = (
    <HStack spacing={gap}>
      {SHORT.map((d, i) => (
        <Text key={`h${i}`} modifiers={[frame({ width: cell }), font({ size: 11, weight: i === todayIdx ? "bold" : "medium" }),
          foregroundStyle(i === todayIdx ? text : text4)]}>
          {d}
        </Text>
      ))}
    </HStack>
  );

  return (
    <HStack spacing={10} modifiers={[containerBackground(bg, "widget"), padding({ all: 14 }), url]}>
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ size: 11, weight: "bold" }), foregroundStyle(accent)]}>SERİ</Text>
        <HStack alignment="lastTextBaseline" spacing={3}>
          <Text modifiers={[font({ size: 44 }), foregroundStyle(text)]}>{String(streak)}</Text>
          <Text modifiers={[font({ size: 15 }), foregroundStyle(text3)]}>gün</Text>
        </HStack>
        {longest > 0 ? (
          <Text modifiers={[font({ size: 12 }), foregroundStyle(text3)]}>{`en uzun ${longest}`}</Text>
        ) : null}
        <Spacer />
        <Text modifiers={[font({ size: 13, weight: "semibold" }), foregroundStyle(todayDone ? text : text2)]}>{sentence}</Text>
      </VStack>
      <Spacer />
      <VStack spacing={5}>
        {header}
        {grid}
      </VStack>
    </HStack>
  );
};

export default createWidget("MaratonStreak", StreakWidget);
