// Design System v2 — "Lavender Glass"
//
// Felsefe:
//   - Tek bir "amber accent" YOK. Her bölüm / ders kendi kimlik renginde.
//   - Surface'ler nötr-soft (krem-leylak veya gece-leylak), kenarsız, gölgeli.
//   - Hem light hem dark tam set; system theme respect.
//   - Glassmorphism kartlar için blur + soft border.
//
// Renk seçimleri:
//   light = "ferah kağıt + leylak nefes" — beyaz kart, krem zemin, lavanta tints
//   dark  = "gece çalışması + neon olmadan" — ink-purple zemin, ametist kartlar

export const COLORS = {
  light: {
    // Surface stack
    background:    "#F5F2FB",  // pale lavender wash
    surface:       "#FFFFFF",  // white card
    surface2:      "#EDE7F8",  // soft lavender chip
    surfaceLight:  "#FAF8FE",
    card:          "#FFFFFF",
    cardHover:     "#F6F2FC",

    // Borders & dividers — neredeyse görünmez
    border:        "rgba(60, 40, 110, 0.08)",
    borderSoft:    "rgba(60, 40, 110, 0.04)",
    borderLight:   "rgba(60, 40, 110, 0.12)",

    // Text stack
    textPrimary:   "#1B1530",  // ink-purple black
    textSecondary: "#5A5470",
    textMuted:     "#8E88A4",
    textInverse:   "#FFFFFF",

    // Semantic (vurgu için, accent değil)
    success:       "#22B47A",  // green
    successLight:  "rgba(34,180,122,0.12)",
    warning:       "#F0A038",  // amber (uyarı için)
    warningLight:  "rgba(240,160,56,0.14)",
    danger:        "#E84855",  // red (acil)
    dangerLight:   "rgba(232,72,85,0.12)",
    info:          "#4F8DF2",  // blue
    infoLight:     "rgba(79,141,242,0.12)",

    // Brand spotlight — accent rengini kaldırdık, ama tema kimliği için tek vurgu
    accent:        "#6B4FE0",  // violet
    accentLight:   "rgba(107,79,224,0.12)",
    accentDark:    "#4D38B8",

    // Generic palette (geri uyumlu — eski kodda C.amber vb. var)
    amber:         "#F0A038",
    green:         "#22B47A",
    yellow:        "#F0C648",
    red:           "#E84855",
    teal:          "#26B8A6",
    purple:        "#6B4FE0",
    blue:          "#4F8DF2",
    pink:          "#EC6FA0",
    coral:         "#F08568",
  },
  dark: {
    background:    "#0F0B22",  // ink purple night
    surface:       "#1A1538",  // amethyst card
    surface2:      "#241E48",
    surfaceLight:  "#1D1740",
    card:          "#1A1538",
    cardHover:     "#241E48",

    border:        "rgba(180, 165, 255, 0.10)",
    borderSoft:    "rgba(180, 165, 255, 0.05)",
    borderLight:   "rgba(180, 165, 255, 0.16)",

    textPrimary:   "#F2EEFF",
    textSecondary: "#A39BC4",
    textMuted:     "#736C8E",
    textInverse:   "#0F0B22",

    success:       "#5BD89F",
    successLight:  "rgba(91,216,159,0.16)",
    warning:       "#F5B05C",
    warningLight:  "rgba(245,176,92,0.18)",
    danger:        "#FF7686",
    dangerLight:   "rgba(255,118,134,0.16)",
    info:          "#7EB2FF",
    infoLight:     "rgba(126,178,255,0.16)",

    accent:        "#9D86FF",
    accentLight:   "rgba(157,134,255,0.18)",
    accentDark:    "#7B65E0",

    amber:         "#F5B05C",
    green:         "#5BD89F",
    yellow:        "#F8D274",
    red:           "#FF7686",
    teal:          "#5DD8C5",
    purple:        "#9D86FF",
    blue:          "#7EB2FF",
    pink:          "#FF94BC",
    coral:         "#FFA88F",
  },
};

// Subject identity palette — her ders kendi rengi.
// Light + dark için ayrı: hem solid (ikon/buton) hem tint (background wash).
export const SUBJECT_COLORS = {
  light: {
    turkce:       { solid: "#4F8DF2", tint: "#E6F0FF", soft: "#C8DCFA" }, // mavi
    matematik:    { solid: "#F0A038", tint: "#FFEFD9", soft: "#FAD9A8" }, // amber/turuncu
    fen:          { solid: "#22B47A", tint: "#D6F4E5", soft: "#A8E5C6" }, // mint
    sosyal:       { solid: "#6B4FE0", tint: "#E4DEFA", soft: "#C6B9F2" }, // violet
    fizik:        { solid: "#4F8DF2", tint: "#E6F0FF", soft: "#C8DCFA" },
    kimya:        { solid: "#26B8A6", tint: "#D6F2EE", soft: "#A8E0D6" }, // teal
    biyoloji:     { solid: "#22B47A", tint: "#D6F4E5", soft: "#A8E5C6" },
    tarih:        { solid: "#E84855", tint: "#FCDBDE", soft: "#F2A8AE" }, // kırmızı
    cografya:     { solid: "#F08568", tint: "#FCE0D6", soft: "#F5BBA8" }, // coral
    felsefe:      { solid: "#6B4FE0", tint: "#E4DEFA", soft: "#C6B9F2" },
    din:          { solid: "#F0C648", tint: "#FCF1CC", soft: "#F5DD8A" }, // sarı
    edebiyat:     { solid: "#EC6FA0", tint: "#FBDCE8", soft: "#F5AEC9" }, // pembe
    ydt_ingilizce:{ solid: "#9D86FF", tint: "#EAE4FC", soft: "#C8B9F5" },
  },
  dark: {
    turkce:       { solid: "#7EB2FF", tint: "rgba(126,178,255,0.16)",  soft: "rgba(126,178,255,0.32)" },
    matematik:    { solid: "#F5B05C", tint: "rgba(245,176,92,0.16)",   soft: "rgba(245,176,92,0.32)" },
    fen:          { solid: "#5BD89F", tint: "rgba(91,216,159,0.16)",   soft: "rgba(91,216,159,0.32)" },
    sosyal:       { solid: "#9D86FF", tint: "rgba(157,134,255,0.16)",  soft: "rgba(157,134,255,0.32)" },
    fizik:        { solid: "#7EB2FF", tint: "rgba(126,178,255,0.16)",  soft: "rgba(126,178,255,0.32)" },
    kimya:        { solid: "#5DD8C5", tint: "rgba(93,216,197,0.16)",   soft: "rgba(93,216,197,0.32)" },
    biyoloji:     { solid: "#5BD89F", tint: "rgba(91,216,159,0.16)",   soft: "rgba(91,216,159,0.32)" },
    tarih:        { solid: "#FF7686", tint: "rgba(255,118,134,0.16)",  soft: "rgba(255,118,134,0.32)" },
    cografya:     { solid: "#FFA88F", tint: "rgba(255,168,143,0.16)",  soft: "rgba(255,168,143,0.32)" },
    felsefe:      { solid: "#9D86FF", tint: "rgba(157,134,255,0.16)",  soft: "rgba(157,134,255,0.32)" },
    din:          { solid: "#F8D274", tint: "rgba(248,210,116,0.16)",  soft: "rgba(248,210,116,0.32)" },
    edebiyat:     { solid: "#FF94BC", tint: "rgba(255,148,188,0.16)",  soft: "rgba(255,148,188,0.32)" },
    ydt_ingilizce:{ solid: "#C5B0FF", tint: "rgba(197,176,255,0.16)",  soft: "rgba(197,176,255,0.32)" },
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
  return map[norm] || map[key] || { solid: "#9D86FF", tint: "rgba(157,134,255,0.16)", soft: "rgba(157,134,255,0.32)" };
}

// Surface elevation (gölge) — light için belirgin, dark için minimal
export const ELEVATION = {
  light: {
    sm: { shadowColor: "#1B1530", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,  elevation: 2 },
    md: { shadowColor: "#1B1530", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 4 },
    lg: { shadowColor: "#1B1530", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 8 },
    xl: { shadowColor: "#1B1530", shadowOffset: { width: 0, height: 14}, shadowOpacity: 0.10, shadowRadius: 40, elevation: 12 },
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
    text:       src.textPrimary,
    sec:        src.textSecondary,
    muted:      src.textMuted,
    cream:      "#FBF1DC",
  };
}

// LEGACY default export — yeni kod `useTheme().palette` kullanmalı.
// Eski tüm dosyalar `import { C }` ile çağırıyor; default light verir, ThemeContext gerçek değeri override eder.
export const C = paletteFor("light");

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

// Eski kod SHADOWS bekliyor — light teması için ELEVATION'ı bağla.
export const SHADOWS = {
  card:  ELEVATION.light.md,
  amber: { ...ELEVATION.light.md, shadowColor: "#F0A038", shadowOpacity: 0.30 },
  fab:   { ...ELEVATION.light.lg, shadowColor: "#6B4FE0", shadowOpacity: 0.35 },
};
