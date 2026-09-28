import { HStack, Spacer, Text, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  background, containerBackground, cornerRadius, font, foregroundStyle, frame, offset, padding,
  rotationEffect, strokeBorder, widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN + KILIT EKRANI WIDGET'I — ROTA / SINAVA KALAN GUN.
//
// Gun sayisi BURADA hesaplaniyor (examISO): widget kendi saatiyle
// yenilenir, uygulama acilmasa da sayac dogru kalir.
//
// Cizgi ELLE: Chart'ta y ekseni araligi yok; eksen 0'dan basladigi ve hedef
// cizgisini de kapsadigi icin netler dumduz bir cizgiye eziliyordu. Burada
// aralik netlerin kendisinden, hedef kesikli ve yalniz aralik icindeyse.
//
// Kilit ekrani (accessory*) tek renkli cizilir; sistem rengi kendisi verir.
// Renkler fonksiyonun ICINDE; paletle esitligini widgetPalette testi denetler.
const RouteWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const bg = "#1C1C23";
  const up = "#34D399";
  const text = "#ECE8E4";
  const text3 = "#A3A0AB";
  const text4 = "#827F88";

  const family = environment?.widgetFamily;
  const now = environment?.date instanceof Date ? environment.date : new Date();
  let days = NaN;
  const exam = props?.examISO ? new Date(props.examISO) : null;
  if (exam && !Number.isNaN(exam.getTime())) {
    const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const b = Date.UTC(exam.getFullYear(), exam.getMonth(), exam.getDate());
    days = Math.max(0, Math.round((b - a) / 86400000));
  }
  const dayText = Number.isFinite(days) ? String(days) : "—";
  const points = (Array.isArray(props?.points) ? props.points : []).map((p) => Number(p?.net) || 0);
  const target = Number(props?.target) || 0;
  const delta = points.length > 1 ? points[points.length - 1] - points[0] : null;
  const fmt = (n) => String(Math.round(Math.abs(n) * 10) / 10).replace(".", ",");
  const deltaText = delta == null ? null : `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${fmt(delta)} net`;
  const url = widgetURL("maraton://rota");

  // ---- KILIT EKRANI ----
  if (family === "accessoryInline") {
    return <Text modifiers={[containerBackground(bg, "widget"), url]}>{`Sınava ${dayText} gün`}</Text>;
  }
  if (family === "accessoryCircular") {
    return (
      <VStack spacing={0} modifiers={[containerBackground(bg, "widget"), url]}>
        <Text modifiers={[font({ size: 20, weight: "semibold" })]}>{dayText}</Text>
        <Text modifiers={[font({ size: 11, weight: "medium" })]}>gün</Text>
      </VStack>
    );
  }
  if (family === "accessoryRectangular") {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[containerBackground(bg, "widget"), url]}>
        <Text modifiers={[font({ size: 12, weight: "bold" })]}>SINAVA</Text>
        <HStack alignment="lastTextBaseline" spacing={3}>
          <Text modifiers={[font({ size: 24, weight: "semibold" })]}>{dayText}</Text>
          <Text modifiers={[font({ size: 13, weight: "medium" })]}>gün</Text>
        </HStack>
        {deltaText ? <Text modifiers={[font({ size: 12 })]}>{`${deltaText} · ${points.length} deneme`}</Text> : null}
      </VStack>
    );
  }

  // ---- ANA EKRAN ----
  const compact = family === "systemSmall";
  const W = compact ? 130 : 306;
  const H = compact ? 34 : 44;
  const R = 5;
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const span = Math.max(hi - lo, 4);
  const base = (hi + lo) / 2 - span / 2;
  const xOf = (i) => R + (i / Math.max(1, points.length - 1)) * (W - 2 * R);
  const yOf = (v) => R + (1 - (v - base) / span) * (H - 2 * R);
  const pts = points.map((v, i) => ({ x: xOf(i), y: yOf(v) }));
  const showTarget = target > 0 && target >= base && target <= base + span;

  const segments = pts.slice(1).map((b, i) => {
    const a = pts[i];
    const len = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    return (
      <VStack key={`s${i}`} modifiers={[frame({ width: len, height: 2.5 }), background(accent), cornerRadius(1.25),
        rotationEffect(deg), offset({ x: (a.x + b.x) / 2 - len / 2, y: (a.y + b.y) / 2 - 1.25 })]}>
        <Spacer />
      </VStack>
    );
  });
  const dots = pts.map((p, i) => {
    const isLast = i === pts.length - 1;
    const d = isLast ? 10 : 5;
    return (
      <VStack key={`p${i}`} modifiers={[frame({ width: d, height: d }), background(isLast ? bg : accent), cornerRadius(d / 2),
        ...(isLast ? [strokeBorder({ content: accent, style: { lineWidth: 2.2 }, shape: "circle" })] : []),
        offset({ x: p.x - d / 2, y: p.y - d / 2 })]}>
        <Spacer />
      </VStack>
    );
  });
  const dashes = showTarget ? Array.from({ length: Math.floor(W / 7) }, (_, i) => (
    <VStack key={`d${i}`} modifiers={[frame({ width: 3, height: 1 }), background(text4), offset({ x: i * 7, y: yOf(target) })]}>
      <Spacer />
    </VStack>
  )) : [];

  const line = pts.length >= 2 ? (
    <ZStack alignment="topLeading" modifiers={[frame({ width: W, height: H, alignment: "topLeading" })]}>
      {dashes}
      {segments}
      {dots}
    </ZStack>
  ) : (
    <Text modifiers={[font({ size: 12, weight: "medium" }), foregroundStyle(text3)]}>Rotan ilk denemenle çizilir.</Text>
  );

  return (
    <VStack alignment="leading" spacing={compact ? 4 : 6}
      modifiers={[containerBackground(bg, "widget"), padding({ all: compact ? 13 : 15 }), url]}>
      <HStack alignment="top">
        <VStack alignment="leading" spacing={0}>
          <Text modifiers={[font({ size: 11, weight: "bold" }), foregroundStyle(accent)]}>SINAVA</Text>
          <HStack alignment="lastTextBaseline" spacing={4}>
            <Text modifiers={[font({ size: compact ? 40 : 44 }), foregroundStyle(text)]}>{dayText}</Text>
            <Text modifiers={[font({ size: 14, weight: "semibold" }), foregroundStyle(text3)]}>gün</Text>
          </HStack>
        </VStack>
        <Spacer />
        {!compact && deltaText ? (
          <VStack alignment="trailing" spacing={1}>
            <Text modifiers={[font({ size: 24 }), foregroundStyle(delta > 0 ? up : text3)]}>{deltaText}</Text>
            <Text modifiers={[font({ size: 12, weight: "medium" }), foregroundStyle(text3)]}>{`son ${points.length} denemede`}</Text>
          </VStack>
        ) : null}
      </HStack>
      <Spacer />
      {line}
      {compact && deltaText ? (
        <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(delta > 0 ? up : text3)]}>
          {`${deltaText} · ${points.length} deneme`}
        </Text>
      ) : null}
    </VStack>
  );
};

export default createWidget("MaratonRoute", RouteWidget);
