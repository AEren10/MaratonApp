import { HStack, Spacer, Text, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  background, containerBackground, cornerRadius, font, foregroundStyle, frame, padding,
  strikethrough, strokeBorder, widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — BUGUNUN ISLERI (tasarim 3d).
//
// Kucuk boy kirmizi zeminli, setin en canli olani: kac is bitti ve siradaki
// isin ne kadar surecegi. Genis boy: bitenler ustu cizili, siradaki is bir
// yuzeyle one cikar; altta haftanin yedi parcali seridi.
// Widget icinden is isaretleme App Intents ister (expo-widgets vermiyor);
// dokunmak gunun planini acar.
//
// Renkler fonksiyonun ICINDE duz sabit ('widget' direktifi dis kapsami
// koparir). Paletle esitligini tests/widgets/widgetPalette.test.mjs denetler.
const TodayWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const accentBright = "#FF6A72";
  const accentDeep = "#A81C26";
  const accentInk = "#F7F2F0";
  const bg = "#1C1C23";
  const surface = "#28282E";
  const text = "#ECE8E4";
  const text2 = "#B0ADB5";
  const text3 = "#A3A0AB";
  const text4 = "#827F88";
  const track = "#333239";

  const tasks = Array.isArray(props?.tasks) ? props.tasks : [];
  const total = Number(props?.total) || tasks.length;
  const doneCount = Number(props?.doneCount) || tasks.filter((t) => t?.done).length;
  const dayMinutes = Array.isArray(props?.dayMinutes) ? props.dayMinutes : [];
  const weekMinutes = Number(props?.weekMinutes) || 0;
  const weekGoal = Number(props?.weeklyMinutesGoal) || 0;
  const compact = environment?.widgetFamily === "systemSmall";
  const next = tasks.find((t) => !t?.done) || null;
  const url = widgetURL("maraton://plan");

  const asHours = (m) => {
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h <= 0) return `${r} dk`;
    return r > 0 ? `${h} sa ${r} dk` : `${h} sa`;
  };

  // Kilit ekrani: tek renk, sistem boyar. Siradaki is ve kac is bitti.
  const family = environment?.widgetFamily;
  if (family === "accessoryInline") {
    return (
      <Text modifiers={[containerBackground(bg, "widget"), url]}>
        {next ? `Sıradaki: ${next.label}` : `Bugün ${doneCount}/${total} bitti`}
      </Text>
    );
  }
  if (family === "accessoryCircular") {
    return (
      <VStack spacing={0} modifiers={[containerBackground(bg, "widget"), url]}>
        <Text modifiers={[font({ size: 20, weight: "semibold" })]}>{`${doneCount}/${total}`}</Text>
        <Text modifiers={[font({ size: 11, weight: "medium" })]}>iş</Text>
      </VStack>
    );
  }
  if (family === "accessoryRectangular") {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[containerBackground(bg, "widget"), url]}>
        <Text modifiers={[font({ size: 12, weight: "bold" })]}>{`BUGÜN ${doneCount}/${total}`}</Text>
        <Text modifiers={[font({ size: 15, weight: "semibold" })]}>{next ? next.label : "Günün işleri bitti"}</Text>
        {next && next.minutes > 0 ? <Text modifiers={[font({ size: 12 })]}>{`${next.minutes} dakika sürer`}</Text> : null}
      </VStack>
    );
  }

  if (compact) {
    const onRed = Boolean(next);
    const ink = onRed ? accentInk : text;
    const pips = Array.from({ length: Math.min(total, 5) }, (_, i) => (
      <VStack key={`p${i}`} modifiers={[frame({ width: 9, height: 9 }), background(i < doneCount ? ink : (onRed ? accentDeep : track)),
        cornerRadius(4.5), ...(i < doneCount ? [] : [strokeBorder({ content: ink, style: { lineWidth: 1.5 }, shape: "circle" })])]}>
        <Spacer />
      </VStack>
    ));
    return (
      <VStack alignment="leading" spacing={3}
        modifiers={[containerBackground(onRed ? accentDeep : bg, "widget"), padding({ all: 14 }), url]}>
        <HStack alignment="top">
          <HStack alignment="lastTextBaseline" spacing={1}>
            <Text modifiers={[font({ size: 40 }), foregroundStyle(ink)]}>{String(doneCount)}</Text>
            <Text modifiers={[font({ size: 16 }), foregroundStyle(ink)]}>{`/${total}`}</Text>
          </HStack>
          <Spacer />
          <HStack spacing={3}>{pips}</HStack>
        </HStack>
        <Spacer />
        <Text modifiers={[font({ size: 11, weight: "bold" }), foregroundStyle(ink)]}>
          {next ? (total - doneCount === 1 ? "SON İŞ" : "SIRADAKİ İŞ") : "BUGÜN"}
        </Text>
        <Text modifiers={[font({ size: 17, weight: "semibold" }), foregroundStyle(ink)]}>
          {next ? next.label : (total > 0 ? "Günün işleri bitti" : "Bugün iş yok")}
        </Text>
        {next && next.minutes > 0 ? (
          <Text modifiers={[font({ size: 12, weight: "medium" }), foregroundStyle(ink)]}>{`${next.minutes} dakika sürer`}</Text>
        ) : null}
      </VStack>
    );
  }

  const rows = tasks.map((t, i) => {
    const isNext = next && t === next;
    const box = t.done ? (
      <ZStack modifiers={[frame({ width: 16, height: 16 }), background(accentDeep), cornerRadius(4)]}>
        <Text modifiers={[font({ size: 11, weight: "bold" }), foregroundStyle(accentInk)]}>✓</Text>
      </ZStack>
    ) : (
      <VStack modifiers={[frame({ width: 16, height: 16 }),
        strokeBorder({ content: isNext ? accentBright : text4, style: { lineWidth: 1.5 }, shape: "roundedRectangle", cornerRadius: 4 })]}>
        <Spacer />
      </VStack>
    );
    return (
      <HStack key={`t${i}`} spacing={9}
        modifiers={isNext ? [padding({ horizontal: 8, vertical: 6 }), background(surface), cornerRadius(9)] : [padding({ horizontal: 8 })]}>
        {box}
        <Text modifiers={[font({ size: 13, weight: t.done ? "regular" : "semibold" }), foregroundStyle(t.done ? text4 : text),
          ...(t.done ? [strikethrough({ isActive: true, pattern: "solid" })] : [])]}>
          {t.label}
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(t.done ? text4 : accentBright)]}>
          {t.done ? "bitti" : (t.minutes > 0 ? `${t.minutes} dk ›` : "›")}
        </Text>
      </HStack>
    );
  });

  const strip = Array.from({ length: 7 }, (_, i) => (
    <VStack key={`d${i}`} modifiers={[frame({ maxWidth: 999, minHeight: 5, maxHeight: 5 }), background((Number(dayMinutes[i]) || 0) > 0 ? accent : track), cornerRadius(2.5)]}>
      <Spacer />
    </VStack>
  ));

  return (
    <VStack alignment="leading" spacing={6} modifiers={[containerBackground(bg, "widget"), padding({ all: 12 }), url]}>
      {rows.length ? (
        <VStack alignment="leading" spacing={4}>{rows}</VStack>
      ) : (
        <Text modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(text2)]}>
          Bugün için durak yok. Programından bir tane ekle.
        </Text>
      )}
      <Spacer />
      <HStack modifiers={[padding({ horizontal: 8 })]}>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(text3)]}>Bu hafta </Text>
        <Text modifiers={[font({ size: 12, weight: "bold" }), foregroundStyle(text)]}>{asHours(weekMinutes)}</Text>
        <Spacer />
        {weekGoal > 0 ? (
          <Text modifiers={[font({ size: 12 }), foregroundStyle(text3)]}>{`hedef ${asHours(weekGoal)}`}</Text>
        ) : null}
      </HStack>
      <HStack spacing={4} modifiers={[padding({ horizontal: 8 })]}>{strip}</HStack>
    </VStack>
  );
};

export default createWidget("MaratonToday", TodayWidget);
