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
    textMuted:     "#6E7078",
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

    // Brand spotlight — SUNSET CORAL (sıcak, canlı), CTA dolgusu beyaz metinle
    accent:        "#FF5A3C",  // sunset coral
    accentLight:   "rgba(255,90,60,0.14)",
    accentDark:    "#D23A18",  // accent-as-text için okunur koyu

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
    textMuted:     "#7A7E87",
    textInverse:   "#0C0D11",

    success:       "#46E0A0",
    successLight:  "rgba(70,224,160,0.16)",
    warning:       "#F5B24A",
    warningLight:  "rgba(245,178,74,0.18)",
    danger:        "#FF6470",
    dangerLight:   "rgba(255,100,112,0.16)",
    info:          "#5C9BFF",
    infoLight:     "rgba(92,155,255,0.16)",

    // Brand spotlight — SUNSET CORAL, mürekkep üstünde sıcak parlak
    accent:        "#FF5A3C",  // sunset coral
    accentLight:   "rgba(255,90,60,0.16)",
    accentDark:    "#E0431F",

    amber:         "#FF9F3D",
    green:         "#3DDB8E",
    yellow:        "#FFD24A",
    red:           "#FF5C6E",
    teal:          "#2ED9C6",
    purple:        "#9B7BFF",
    blue:          "#4D9BFF",
    pink:          "#FF6FA8",
    coral:         "#FF7A4D",
  },
};

// Subject identity palette — her ders kendi rengi.
// Light + dark için ayrı: hem solid (ikon/buton) hem tint (background wash).
export const SUBJECT_COLORS = {
  light: {
    turkce:       { solid: "#2E7DEB", tint: "#E4EEFF", soft: "#BBD4FB" }, // mavi
    matematik:    { solid: "#E8841A", tint: "#FCEDD7", soft: "#F7D3A3" }, // turuncu
    fen:          { solid: "#15A86A", tint: "#DAF4E7", soft: "#A8E5C7" }, // yeşil
    sosyal:       { solid: "#6B4FE0", tint: "#E7E0FB", soft: "#C7B9F4" }, // violet
    fizik:        { solid: "#2E7DEB", tint: "#E4EEFF", soft: "#BBD4FB" },
    kimya:        { solid: "#0FA595", tint: "#D6F2EE", soft: "#A3E0D7" }, // teal
    biyoloji:     { solid: "#15A86A", tint: "#DAF4E7", soft: "#A8E5C7" },
    tarih:        { solid: "#E23B49", tint: "#FCDEE1", soft: "#F5AEB4" }, // kırmızı
    cografya:     { solid: "#E8612F", tint: "#FCE2D8", soft: "#F7BCA6" }, // coral
    felsefe:      { solid: "#6B4FE0", tint: "#E7E0FB", soft: "#C7B9F4" },
    din:          { solid: "#E0A81E", tint: "#FBF0D2", soft: "#F2DC97" }, // sarı
    edebiyat:     { solid: "#E24F8C", tint: "#FCE0EB", soft: "#F7B6CF" }, // pembe
    ydt_ingilizce:{ solid: "#8A6BF0", tint: "#EAE2FC", soft: "#CDB9F7" },
  },
  dark: {
    turkce:       { solid: "#4D9BFF", tint: "rgba(77,155,255,0.16)",   soft: "rgba(77,155,255,0.32)" },
    matematik:    { solid: "#FF9F3D", tint: "rgba(255,159,61,0.16)",   soft: "rgba(255,159,61,0.32)" },
    fen:          { solid: "#3DDB8E", tint: "rgba(61,219,142,0.16)",   soft: "rgba(61,219,142,0.32)" },
    sosyal:       { solid: "#9B7BFF", tint: "rgba(155,123,255,0.16)",  soft: "rgba(155,123,255,0.32)" },
    fizik:        { solid: "#4D9BFF", tint: "rgba(77,155,255,0.16)",   soft: "rgba(77,155,255,0.32)" },
    kimya:        { solid: "#2ED9C6", tint: "rgba(46,217,198,0.16)",   soft: "rgba(46,217,198,0.32)" },
    biyoloji:     { solid: "#3DDB8E", tint: "rgba(61,219,142,0.16)",   soft: "rgba(61,219,142,0.32)" },
    tarih:        { solid: "#FF5C6E", tint: "rgba(255,92,110,0.16)",   soft: "rgba(255,92,110,0.32)" },
    cografya:     { solid: "#FF7A4D", tint: "rgba(255,122,77,0.16)",   soft: "rgba(255,122,77,0.32)" },
    felsefe:      { solid: "#9B7BFF", tint: "rgba(155,123,255,0.16)",  soft: "rgba(155,123,255,0.32)" },
    din:          { solid: "#FFD24A", tint: "rgba(255,210,74,0.16)",   soft: "rgba(255,210,74,0.32)" },
    edebiyat:     { solid: "#FF6FA8", tint: "rgba(255,111,168,0.16)",  soft: "rgba(255,111,168,0.32)" },
    ydt_ingilizce:{ solid: "#B79BFF", tint: "rgba(183,155,255,0.16)",  soft: "rgba(183,155,255,0.32)" },
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
    text:       src.textPrimary,
    sec:        src.textSecondary,
    muted:      src.textMuted,
    cream:      "#F4F1EA",
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
    card:  e.md,
    amber: { ...e.md, shadowColor: "#E08A1E", shadowOpacity: 0.30 },
    fab:   { ...e.lg, shadowColor: "#FF5A3C", shadowOpacity: 0.35 },
  };
}
export const SHADOWS = _buildShadows("light");
