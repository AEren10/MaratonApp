// Design System v3 — "Ink & Volt"
//
// Felsefe:
//   - Jenerik mor-cam (glassmorphism + glow) dilini bıraktık. O görünüm "AI yapmış
//     gibi" duruyordu. Yerine editöryal / atletik bir dil: mürekkep + kağıt + tek imza.
//   - Renk = ANLAM + ENERJİ. Brand sinyali SUNSET CORAL (sıcak mercan) birincil aksiyon
//     ve hero'da. Kategori rengi ders kimliğinden gelir.
//   - CANLI: dolu/doygun sıcak renkler (mercan-turuncu-pembe-amber), sönük tint değil.
//     Hero kartlar dolu renk dolgusu + beyaz metin; 3'lü istatistik baloncukları solid.
//   - Güven; glow/blur'dan değil, boşluk ritmi + güçlü tipografi + nötr yüzeylerden.
//   - Hem light hem dark tam set; system theme respect.
//
// Renk seçimleri:
//   light = "sıcak kağıt + mürekkep" — beyaz kart, kağıt zemin, nötr ink metin
//   dark  = "gece antrenmanı" — sıcak-nötr mürekkep-siyahı zemin, mor YOK
//   signal = VOLT (elektrik-lime) — subject paletinde olmayan, mor olmayan tek vurgu

export const COLORS = {
  light: {
    // Surface stack
    background:    "#F4F1EA",  // warm paper
    surface:       "#FFFFFF",  // white card
    surface2:      "#ECE8DE",  // warm sand chip
    surfaceLight:  "#FAF8F3",
    card:          "#FFFFFF",
    cardHover:     "#F6F3EC",

    // Borders & dividers — nötr ink, neredeyse görünmez
    border:        "rgba(20, 18, 12, 0.09)",
    borderSoft:    "rgba(20, 18, 12, 0.05)",
    borderLight:   "rgba(20, 18, 12, 0.14)",

    // Text stack — nötr ink (mor değil)
    textPrimary:   "#15161A",  // near-black ink
    textSecondary: "#56585F",
    textMuted:     "#5C5E66",
    textInverse:   "#FFFFFF",  // sıcak dolgu üstünde beyaz okunur

    // Semantic (vurgu için, accent değil)
    success:       "#1FA567",  // green
    successLight:  "rgba(31,165,103,0.12)",
    warning:       "#E08A1E",  // amber (uyarı için)
    warningLight:  "rgba(224,138,30,0.14)",
    danger:        "#E23B43",  // red (acil)
    dangerLight:   "rgba(226,59,67,0.12)",
    info:          "#2D6FE0",  // blue
    infoLight:     "rgba(45,111,224,0.12)",

    // Brand — MOR primary, TURUNCU energy/streak
    accent:        "#8b5cf6",  // brand primary (mor)
    accentLight:   "rgba(139,92,246,0.14)",
    accentDark:    "#7c3aed",  // brand deep
    brandLight:    "#a78bfa",
    orange:        "#ff6b35",
    orangeLight:   "rgba(255,107,53,0.14)",

    // Generic palette (geri uyumlu — eski kodda C.amber vb. var)
    amber:         "#E8841A",
    green:         "#15A86A",
    yellow:        "#E0A81E",
    red:           "#E23B49",
    teal:          "#0FA595",
    purple:        "#6B4FE0",
    blue:          "#2E7DEB",
    pink:          "#E24F8C",
    coral:         "#E8612F",

    // Dormant — "henüz başlanmadı" durumu (kırmızı/danger DEĞİL)
    dormant:       "rgba(20, 18, 12, 0.25)",
    dormantBg:     "rgba(20, 18, 12, 0.05)",
  },
  dark: {
    background:    "#0C0D11",  // warm-neutral ink night
    surface:       "#15171C",  // charcoal card
    surface2:      "#1E2128",
    surfaceLight:  "#191B21",
    card:          "#15171C",
    cardHover:     "#1E2128",

    border:        "rgba(255, 255, 255, 0.08)",
    borderSoft:    "rgba(255, 255, 255, 0.04)",
    borderLight:   "rgba(255, 255, 255, 0.14)",

    textPrimary:   "#F4F5F7",
    textSecondary: "#9CA0AA",
    textMuted:     "#8E929B",
    textInverse:   "#0C0D11",

    success:       "#34d399",
    successLight:  "rgba(52,211,153,0.16)",
    warning:       "#fbbf24",
    warningLight:  "rgba(251,191,36,0.18)",
    danger:        "#f87171",
    dangerLight:   "rgba(248,113,113,0.16)",
    info:          "#60a5fa",
    infoLight:     "rgba(96,165,250,0.16)",

    // Brand — MOR primary, TURUNCU energy/streak
    accent:        "#8b5cf6",  // brand primary (mor) — CTA, başla, kaydet
    accentLight:   "rgba(139,92,246,0.16)",
    accentDark:    "#7c3aed",  // brand deep — pressed state
    brandLight:    "#a78bfa",  // link rengi, hover, secondary brand
    orange:        "#ff6b35",  // streak, FAB, finalize (bitir/çık)
    orangeLight:   "rgba(255,107,53,0.16)",

    amber:         "#fbbf24",
    green:         "#34d399",
    yellow:        "#fbbf24",
    red:           "#f87171",
    teal:          "#2dd4bf",
    purple:        "#8b5cf6",
    blue:          "#60a5fa",
    pink:          "#f472b6",
    coral:         "#ff6b35",

    dormant:       "rgba(255, 255, 255, 0.25)",
    dormantBg:     "rgba(255, 255, 255, 0.05)",
  },
};

// Subject identity palette — her ders kendi rengi.
// Light + dark için ayrı: hem solid (ikon/buton) hem tint (background wash).
export const SUBJECT_COLORS = {
  light: {
    turkce:       { solid: "#3b82f6", tint: "#dbeafe", soft: "#93c5fd" }, // mavi
    matematik:    { solid: "#f97316", tint: "#ffedd5", soft: "#fdba74" }, // turuncu
    fen:          { solid: "#10b981", tint: "#d1fae5", soft: "#6ee7b7" }, // yeşil
    sosyal:       { solid: "#a855f7", tint: "#f3e8ff", soft: "#c4b5fd" }, // violet
    fizik:        { solid: "#06b6d4", tint: "#cffafe", soft: "#67e8f9" }, // cyan
    kimya:        { solid: "#ec4899", tint: "#fce7f3", soft: "#f9a8d4" }, // pembe
    biyoloji:     { solid: "#10b981", tint: "#d1fae5", soft: "#6ee7b7" },
    tarih:        { solid: "#eab308", tint: "#fef9c3", soft: "#fde047" }, // amber
    cografya:     { solid: "#14b8a6", tint: "#ccfbf1", soft: "#5eead4" }, // teal
    felsefe:      { solid: "#a855f7", tint: "#f3e8ff", soft: "#c4b5fd" },
    din:          { solid: "#84cc16", tint: "#ecfccb", soft: "#bef264" }, // lime
    edebiyat:     { solid: "#ec4899", tint: "#fce7f3", soft: "#f9a8d4" }, // pembe
    ydt_ingilizce:{ solid: "#8b5cf6", tint: "#ede9fe", soft: "#c4b5fd" },
  },
  dark: {
    turkce:       { solid: "#60a5fa", tint: "rgba(96,165,250,0.16)",   soft: "rgba(96,165,250,0.32)" },
    matematik:    { solid: "#fb923c", tint: "rgba(251,146,60,0.16)",   soft: "rgba(251,146,60,0.32)" },
    fen:          { solid: "#34d399", tint: "rgba(52,211,153,0.16)",   soft: "rgba(52,211,153,0.32)" },
    sosyal:       { solid: "#c084fc", tint: "rgba(192,132,252,0.16)",  soft: "rgba(192,132,252,0.32)" },
    fizik:        { solid: "#22d3ee", tint: "rgba(34,211,238,0.16)",   soft: "rgba(34,211,238,0.32)" },
    kimya:        { solid: "#f472b6", tint: "rgba(244,114,182,0.16)",  soft: "rgba(244,114,182,0.32)" },
    biyoloji:     { solid: "#34d399", tint: "rgba(52,211,153,0.16)",   soft: "rgba(52,211,153,0.32)" },
    tarih:        { solid: "#fbbf24", tint: "rgba(251,191,36,0.16)",   soft: "rgba(251,191,36,0.32)" },
    cografya:     { solid: "#2dd4bf", tint: "rgba(45,212,191,0.16)",   soft: "rgba(45,212,191,0.32)" },
    felsefe:      { solid: "#c084fc", tint: "rgba(192,132,252,0.16)",  soft: "rgba(192,132,252,0.32)" },
    din:          { solid: "#84cc16", tint: "rgba(132,204,22,0.16)",   soft: "rgba(132,204,22,0.32)" },
    edebiyat:     { solid: "#f472b6", tint: "rgba(244,114,182,0.16)",  soft: "rgba(244,114,182,0.32)" },
    ydt_ingilizce:{ solid: "#a78bfa", tint: "rgba(167,139,250,0.16)",  soft: "rgba(167,139,250,0.32)" },
  },
};

// Helper — şu anki temaya göre ders kimliğini ver
export function getSubjectIdentity(scheme, key) {
  const map = SUBJECT_COLORS[scheme] || SUBJECT_COLORS.light;
  // Trial keys (tyt_*, ayt_*) için curriculum key'e indir
  const norm = key
    ?.replace(/^tyt_/, "")
    .replace(/^ayt_/, "")
    .replace(/_(ea|soz|say|sozel|sayisal)$/, "")
    .replace(/^ayt_ea_/, "")
    .replace(/^ayt_say_/, "")
    .replace(/^ayt_sozel_/, "");
  return map[norm] || map[key] || { solid: "#9B7BFF", tint: "rgba(155,123,255,0.16)", soft: "rgba(155,123,255,0.32)" };
}

// Surface elevation (gölge) — light için belirgin, dark için minimal
export const ELEVATION = {
  light: {
    sm: { shadowColor: "#15161A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,  elevation: 2 },
    md: { shadowColor: "#15161A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 4 },
    lg: { shadowColor: "#15161A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.09, shadowRadius: 24, elevation: 8 },
    xl: { shadowColor: "#15161A", shadowOffset: { width: 0, height: 14}, shadowOpacity: 0.11, shadowRadius: 40, elevation: 12 },
  },
  dark: {
    sm: { shadowColor: "#000",    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.20, shadowRadius: 6,  elevation: 2 },
    md: { shadowColor: "#000",    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.26, shadowRadius: 14, elevation: 4 },
    lg: { shadowColor: "#000",    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.32, shadowRadius: 24, elevation: 8 },
    xl: { shadowColor: "#000",    shadowOffset: { width: 0, height: 14}, shadowOpacity: 0.38, shadowRadius: 40, elevation: 12 },
  },
};

// C-shaped palette döndür — eski kod C.bg / C.amber bekliyor.
export function paletteFor(scheme) {
  const src = scheme === "dark" ? COLORS.dark : COLORS.light;
  return {
    bg:         src.background,
    surface:    src.surface,
    surface2:   src.surface2,
    border:     src.border,
    borderSoft: src.borderSoft,
    amber:      src.amber,
    green:      src.green,
    yellow:     src.yellow,
    red:        src.red,
    teal:       src.teal,
    purple:     src.purple,
    blue:       src.blue,
    pink:       src.pink,
    coral:      src.coral,
    accent:     src.accent,
    accentLight:src.accentLight,
    accentDark: src.accentDark,
    brandLight: src.brandLight,
    orange:     src.orange,
    orangeLight:src.orangeLight,
    success:    src.success,
    danger:     src.danger,
    warning:    src.warning,
    info:       src.info,
    text:       src.textPrimary,
    sec:        src.textSecondary,
    muted:      src.textMuted,
    cream:      "#F4F1EA",
    dormant:    src.dormant,
    dormantBg:  src.dormantBg,
  };
}

// LEGACY — yeni kod `useC()` kullanmalı.
// Eski 70+ dosya `import { C }` ile çağırıyor. Object.assign ile in-place
// mutate: setRuntimeScheme() tüm key'leri güncel palette ile değiştirir.
let _runtimeScheme = "light";

export const C = paletteFor("light");

export function setRuntimeScheme(scheme) {
  const next = scheme === "dark" ? "dark" : "light";
  if (next === _runtimeScheme) return;
  _runtimeScheme = next;
  Object.assign(C, paletteFor(next));
  Object.assign(SHADOWS, _buildShadows(next));
}

// ===== Pastel chips (eski) =====
export const PASTEL = {
  peach:   { solid: "#F08568", tint: "rgba(240,133,104,0.14)" },
  coral:   { solid: "#F08568", tint: "rgba(240,133,104,0.14)" },
  blue:    { solid: "#4F8DF2", tint: "rgba(79,141,242,0.14)" },
  violet:  { solid: "#6B4FE0", tint: "rgba(107,79,224,0.14)" },
  mint:    { solid: "#22B47A", tint: "rgba(34,180,122,0.14)" },
  teal:    { solid: "#26B8A6", tint: "rgba(38,184,166,0.14)" },
  gold:    { solid: "#F0C648", tint: "rgba(240,198,72,0.14)" },
  rose:    { solid: "#EC6FA0", tint: "rgba(236,111,160,0.14)" },
  amber:   { solid: "#F0A038", tint: "rgba(240,160,56,0.14)" },
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl:32,
  huge:48,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  pill: 999,
  full: 999,
};

export const TYPOGRAPHY = {
  // Display (büyük başlık) — Space Grotesk
  display:       { fontFamily: "SpaceGrotesk_700Bold",   fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  heading:       { fontFamily: "SpaceGrotesk_700Bold",   fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  subheading:    { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 20, lineHeight: 26 },

  // Body — Inter
  body:          { fontFamily: "Inter_400Regular",       fontSize: 15, lineHeight: 22 },
  bodyMedium:    { fontFamily: "Inter_500Medium",        fontSize: 15, lineHeight: 22 },
  bodySemiBold:  { fontFamily: "Inter_600SemiBold",      fontSize: 15, lineHeight: 22 },

  caption:       { fontFamily: "Inter_400Regular",       fontSize: 13, lineHeight: 18 },
  captionMedium: { fontFamily: "Inter_500Medium",        fontSize: 13, lineHeight: 18 },
  micro:         { fontFamily: "Inter_500Medium",        fontSize: 11, lineHeight: 14 },

  // Stats — Space Grotesk bold, oversized
  stat:          { fontFamily: "SpaceGrotesk_700Bold",   fontSize: 46, lineHeight: 50, letterSpacing: -1 },
  statLarge:     { fontFamily: "SpaceGrotesk_700Bold",   fontSize: 56, lineHeight: 60, letterSpacing: -1.5 },
  statSmall:     { fontFamily: "SpaceGrotesk_700Bold",   fontSize: 26, lineHeight: 30, letterSpacing: -0.5 },

  button:        { fontFamily: "Inter_600SemiBold",      fontSize: 15, lineHeight: 20 },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
};

function _buildShadows(scheme) {
  const e = scheme === "dark" ? ELEVATION.dark : ELEVATION.light;
  return {
    sm:     e.sm,
    card:   e.md,
    lg:     e.lg,
    xl:     e.xl,
    amber:  { ...e.md, shadowColor: "#ff6b35", shadowOpacity: 0.30 },
    accent: { ...e.md, shadowColor: "#8b5cf6", shadowOpacity: 0.30 },
    orange: { ...e.md, shadowColor: "#ff6b35", shadowOpacity: 0.30 },
    fab:    { ...e.lg, shadowColor: "#ff6b35", shadowOpacity: 0.35 },
  };
}
export const SHADOWS = _buildShadows("light");
