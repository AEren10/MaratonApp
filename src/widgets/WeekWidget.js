import { HStack, Spacer, Text, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  background, containerBackground, cornerRadius, font, foregroundStyle, frame, padding, strokeBorder, widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — HAFTA (tasarim 3b).
//
// Cubuklar ELLE ciziliyor: @expo/ui Chart bos gunu, deger etiketini ve
// cubuk basina kesikli kabi veremiyor. Hedefi gecen gun dolu accent,
// gecemeyen koyu accent, bugun en acik ton; bugunun cubugu HEDEF boyunda
// kesikli bir kap, ici doluyor. Hedef cizgisi kesikli.
//
// BUGUN WIDGET'IN KENDI SAATINDEN: eskiden dizinin son gunu (Pazar) bugun
// sayiliyordu; Pazartesi acilan widget Pazar'i isaretliyordu. Veri baska bir
// haftaya aitse (uygulama o hafta hic acilmadi) cubuklar bos cizilir, eski
// haftanin sayilari bu haftaymis gibi gosterilmez.
//
// Renkler fonksiyonun ICINDE duz sabit: 'widget' direktifi dis kapsami
// koparir (cihazda "Can't find variable" ile patladi). Paletle esitligini
// tests/widgets/widgetPalette.test.mjs denetler.
const WeekWidget = (props, environment) => {
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
  const LOC = ["'de", "'de", "'te", "'te", "'te", "'da", "'de"]; // 1'de 2'de 3'te 4'te 5'te 6'da 7'de

  const now = environment?.date instanceof Date ? environment.date : new Date();
  const todayIdx = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIdx);
  const mondayKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
  const sameWeek = !props?.weekStart || props.weekStart === mondayKey;

  const raw = Array.isArray(props?.days) ? props.days : [];
  const q = SHORT.map((_, i) => (sameWeek ? Number(raw[i]?.questions) || 0 : 0));
  const goal = Number(props?.goal) || 0;
  const solved = q[todayIdx];
  const compact = environment?.widgetFamily === "systemSmall";

  // Canli zemin: kosede koyu kizil isilti zemine iner. Ton paletten karisim
  // (widget kendi calisma zamaninda; token import edilemez).
  const mixHex = (a, b, t) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return `#${x.map((v, i) => Math.round(v * (1 - t) + y[i] * t).toString(16).padStart(2, "0")).join("")}`;
  };
  const glowBg = {
    type: "linearGradient",
    colors: [mixHex(accentDeep, bg, 0.55), bg, bg],
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 1 },
  };

  const plotH = compact ? 36 : 68;
  // Her gunun sutunu cubuktan genis: gun adi ve 3 haneli deger sigsin,
  // cubuk sutunun ortasinda durur.
  const barW = compact ? 13 : 16;
  const colW = compact ? 18 : 24;
  const plotW = colW * 7;
  const peak = Math.max(...q, goal, 1);
  const top = peak * 1.1;
  const hOf = (v) => (v > 0 ? Math.max(4, Math.min(plotH, (v / top) * plotH)) : 0);
  const goalH = goal > 0 ? hOf(goal) : 0;

  // Cumle: bugunu haftanin en iyi gunuyle ya da hedefle baglar.
  let best = -1;
  q.forEach((v, i) => { if (i !== todayIdx && v > 0 && (best < 0 || v > q[best])) best = i; });
  const remaining = goal > 0 ? Math.max(0, goal - solved) : 0;
  const metBefore = goal > 0 ? q.filter((v, i) => i < todayIdx && v >= goal).length : 0;
  const dayNo = todayIdx + 1;
  let sentence;
  if (solved === 0 && best < 0) sentence = "Haftanın ilk sorusunu çöz.";
  else if (compact && best >= 0 && q[best] > solved) sentence = `En iyin ${LONG[best]}: ${q[best]}`;
  else if (remaining > 0) sentence = `${remaining} soru daha, hafta ${dayNo}${LOC[todayIdx]} ${metBefore + 1} olur`;
  else sentence = `Hedef tamam. Hafta ${dayNo}${LOC[todayIdx]} ${metBefore + 1}.`;
  if (compact && remaining > 0 && (solved > 0 || best >= 0) && !(best >= 0 && q[best] > solved)) sentence = `${remaining} soru daha`;

  // Kesikli hedef cizgisi: kucuk parcalardan; Chart'in rule'u burada yok.
  const dashes = Array.from({ length: Math.floor(plotW / 6) }, (_, i) => (
    <VStack key={`g${i}`} modifiers={[frame({ width: 3, height: 1 }), background(text4)]}><Spacer /></VStack>
  ));

  const colH = plotH + (compact ? 0 : 16);
  const bars = q.map((v, i) => {
    const isToday = i === todayIdx;
    const future = i > todayIdx;
    const h = hOf(v);
    const fill = isToday ? accentBright : goal > 0 && v >= goal ? accent : accentDeep;
    const showValue = !compact && !future && (v > 0 || isToday);
    return (
      <VStack key={`b${i}`} spacing={2} modifiers={[frame({ width: colW, height: colH, alignment: "bottom" })]}>
        {showValue ? (
          <Text modifiers={[font({ size: 11, weight: "semibold" }), foregroundStyle(isToday ? accentBright : text3)]}>
            {String(v)}
          </Text>
        ) : null}
        <ZStack alignment="bottom">
          {isToday && goalH > h ? (
            <VStack modifiers={[frame({ width: barW, height: goalH }),
              strokeBorder({ content: accentBright, style: { lineWidth: 1, dash: [3, 3] }, shape: "roundedRectangle", cornerRadius: 4 })]}>
              <Spacer />
            </VStack>
          ) : null}
          <VStack modifiers={[frame({ width: barW, height: h > 0 ? h : 3 }), background(h > 0 ? fill : track), cornerRadius(h > 0 ? 4 : 1.5)]}>
            <Spacer />
          </VStack>
        </ZStack>
      </VStack>
    );
  });

  const labels = SHORT.map((d, i) => (
    <Text key={`l${i}`} modifiers={[frame({ width: colW }),
      font({ size: 11, weight: i === todayIdx ? "bold" : "medium" }), foregroundStyle(i === todayIdx ? accentBright : text4)]}>
      {d}
    </Text>
  ));

  const plot = (
    <VStack spacing={4}>
      <ZStack alignment="bottom">
        <HStack alignment="bottom" spacing={0}>{bars}</HStack>
        {goalH > 0 ? (
          <VStack spacing={0} modifiers={[frame({ width: plotW, height: colH, alignment: "bottom" })]}>
            <HStack spacing={3}>{dashes}</HStack>
            <VStack modifiers={[frame({ width: 1, height: goalH })]}><Spacer /></VStack>
          </VStack>
        ) : null}
      </ZStack>
      <HStack spacing={0}>{labels}</HStack>
    </VStack>
  );

  const hero = (size) => (
    <HStack alignment="lastTextBaseline" spacing={2}>
      <Text modifiers={[font({ size, weight: "regular" }), foregroundStyle(text)]}>{String(solved)}</Text>
      <Text modifiers={[font({ size: 15 }), foregroundStyle(text3)]}>{goal > 0 ? `/${goal}` : " soru"}</Text>
    </HStack>
  );

  if (compact) {
    return (
      <VStack alignment="leading" spacing={4}
        modifiers={[containerBackground(glowBg, "widget"), padding({ all: 12 }), widgetURL("maraton://home")]}>
        {hero(34)}
        <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(solved === 0 && best < 0 ? accentBright : text)]}>
          {sentence}
        </Text>
        <Spacer />
        {plot}
      </VStack>
    );
  }

  return (
    <HStack spacing={12} modifiers={[containerBackground(glowBg, "widget"), padding({ all: 14 }), widgetURL("maraton://home")]}>
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ size: 11, weight: "bold" }), foregroundStyle(accent)]}>BUGÜN</Text>
        {hero(46)}
        <Spacer />
        <Text modifiers={[font({ size: 13, weight: "semibold" }), foregroundStyle(text2)]}>{sentence}</Text>
      </VStack>
      <Spacer />
      {plot}
    </HStack>
  );
};

export default createWidget("MaratonWeek", WeekWidget);
