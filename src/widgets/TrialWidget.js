import { HStack, Spacer, Text, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  background, containerBackground, cornerRadius, font, foregroundStyle, frame, offset, padding,
  rotationEffect, strokeBorder, widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";

// ANA EKRAN WIDGET'I — DENEME (tasarim 3c).
//
// Cizgi ELLE: @expo/ui Chart'inda y ekseni araligi verilemiyor, eksen 0'dan
// basladigi icin 60-70 net arasi gezen cizgi dumduz cikiyordu. Burada her
// parca dondurulmus ince bir dikdortgen, noktalar kucuk kareler, son nokta
// halka. Kesikli cizgi onceki en iyi deneme: son nokta onu asarsa rekor.
//
// Dusus KIRMIZI DEGIL (down): kotu haber bagirmaz. Renkler fonksiyonun
// ICINDE; paletle esitligini tests/widgets/widgetPalette.test.mjs denetler.
const TrialWidget = (props, environment) => {
  "widget";

  const accent = "#E5343F";
  const bg = "#1C1C23";
  const accentDeep = "#A81C26";
  const up = "#34D399";
  const down = "#9A97A0";
  const text = "#ECE8E4";
  const text2 = "#B0ADB5";
  const text3 = "#A3A0AB";
  const text4 = "#827F88";
  const line = "#3A3A42";

  const points = (Array.isArray(props?.points) ? props.points : []).map((p) => Number(p?.net) || 0);
  const subjects = Array.isArray(props?.subjects) ? props.subjects : [];
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
  const fmt = (n) => String(Math.round(Number(n) * 10) / 10).replace(".", ",");
  const signed = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n))}`;
  const tone = (n) => (n > 0 ? up : n < 0 ? down : text3);

  if (!points.length) {
    return (
      <VStack alignment="leading" spacing={4}
        modifiers={[containerBackground(glowBg, "widget"), padding({ all: 14 }), widgetURL("maraton://analiz")]}>
        <Text modifiers={[font({ size: 11, weight: "bold" }), foregroundStyle(accent)]}>DENEME</Text>
        <Spacer />
        <Text modifiers={[font({ size: 15, weight: "semibold" }), foregroundStyle(text)]}>İlk denemeni gir.</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(text3)]}>Netlerin burada çizilir.</Text>
      </VStack>
    );
  }

  const last = points[points.length - 1];
  const prev = points.length > 1 ? points[points.length - 2] : null;
  const deltaPrev = prev == null ? null : last - prev;
  const deltaFirst = points.length > 1 ? last - points[0] : null;
  const worst = subjects.length ? subjects[subjects.length - 1] : null;
  const worstDown = worst && Number(worst.delta) < 0 ? worst : null;

  // ---- cizgi ----
  const W = compact ? 128 : 160;
  const H = compact ? 44 : 58;
  const R = 5; // halka yaricapi kadar ic bosluk: uc noktalar kirpilmasin
  const prevBest = points.length > 1 ? Math.max(...points.slice(0, -1)) : null;
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const span = Math.max(hi - lo, 4);
  const mid = (hi + lo) / 2;
  const xOf = (i) => (points.length === 1 ? W / 2 : R + (i / (points.length - 1)) * (W - 2 * R));
  const yOf = (v) => R + (1 - ((v - (mid - span / 2)) / span)) * (H - 2 * R);
  const pts = points.map((v, i) => ({ x: xOf(i), y: yOf(v) }));

  const segments = pts.slice(1).map((b, i) => {
    const a = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return (
      <VStack key={`s${i}`} modifiers={[frame({ width: len, height: 2.5 }), background(accent), cornerRadius(1.25),
        rotationEffect(deg), offset({ x: (a.x + b.x) / 2 - len / 2, y: (a.y + b.y) / 2 - 1.25 })]}>
        <Spacer />
      </VStack>
    );
  });
  const dots = pts.map((p, i) => {
    const isLast = i === pts.length - 1;
    const d = isLast ? 11 : 6;
    return (
      <VStack key={`p${i}`} modifiers={[frame({ width: d, height: d }), background(isLast ? bg : accent), cornerRadius(d / 2),
        ...(isLast ? [strokeBorder({ content: accent, style: { lineWidth: 2.4 }, shape: "circle" })] : []),
        offset({ x: p.x - d / 2, y: p.y - d / 2 })]}>
        <Spacer />
      </VStack>
    );
  });
  const bestY = prevBest != null ? yOf(prevBest) : null;
  const dashes = bestY != null ? Array.from({ length: Math.floor(W / 6) }, (_, i) => (
    <VStack key={`d${i}`} modifiers={[frame({ width: 3, height: 1 }), background(text4), offset({ x: i * 6, y: bestY })]}>
      <Spacer />
    </VStack>
  )) : [];

  const chart = (
    <ZStack alignment="topLeading" modifiers={[frame({ width: W, height: H, alignment: "topLeading" })]}>
      {dashes}
      {segments}
      {dots}
    </ZStack>
  );

  if (compact) {
    return (
      <VStack alignment="leading" spacing={6}
        modifiers={[containerBackground(glowBg, "widget"), padding({ all: 13 }), widgetURL("maraton://analiz")]}>
        <HStack alignment="firstTextBaseline">
          <Text modifiers={[font({ size: 36 }), foregroundStyle(text)]}>{fmt(last)}</Text>
          <Spacer />
          {deltaPrev != null ? (
            <Text modifiers={[font({ size: 14, weight: "semibold" }), foregroundStyle(tone(deltaPrev))]}>{signed(deltaPrev)}</Text>
          ) : null}
        </HStack>
        <Spacer />
        {chart}
        <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(text)]}>
          {worstDown ? `${worstDown.label} ${fmt(Math.abs(worstDown.delta))} net düştü` : `Son ${points.length} deneme`}
        </Text>
      </VStack>
    );
  }

  const rows = subjects.slice(-4).map((s, i, arr) => {
    const d = Number(s.delta) || 0;
    const isWorst = worstDown && i === arr.length - 1;
    return (
      <HStack key={`r${i}`}>
        <Text modifiers={[font({ size: 12, weight: isWorst ? "bold" : "regular" }), foregroundStyle(isWorst ? text : text2)]}>
          {s.label}
        </Text>
        <Spacer />
        <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(tone(d))]}>{signed(d)}</Text>
      </HStack>
    );
  });

  return (
    <HStack spacing={12} modifiers={[containerBackground(glowBg, "widget"), padding({ all: 14 }), widgetURL("maraton://analiz")]}>
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ size: 11, weight: "bold" }), foregroundStyle(accent)]}>{`${Number(props?.total) || points.length}. ${props?.exam ? `${props.exam} ` : ""}DENEME`}</Text>
        <HStack alignment="lastTextBaseline" spacing={3}>
          <Text modifiers={[font({ size: 32, weight: "semibold" }), foregroundStyle(text)]}>{fmt(last)}</Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(text3)]}>net</Text>
        </HStack>
        {deltaFirst != null ? (
          <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(tone(deltaFirst))]}>{`${signed(deltaFirst)} ilk denemeden`}</Text>
        ) : null}
        <Spacer />
        {chart}
      </VStack>
      {rows.length ? (
        <VStack modifiers={[frame({ width: 1 }), background(line)]}><Spacer /></VStack>
      ) : null}
      {rows.length ? (
        <VStack alignment="leading" spacing={4}>
          {rows}
          <Spacer />
          {worstDown ? (
            <Text modifiers={[font({ size: 12, weight: "bold" }), foregroundStyle(text)]}>{`${worstDown.label} netine bak ›`}</Text>
          ) : null}
        </VStack>
      ) : <Spacer />}
    </HStack>
  );
};

export default createWidget("MaratonTrial", TrialWidget);
