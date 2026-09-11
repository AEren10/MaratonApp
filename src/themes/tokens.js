import { buildPalette } from "./palette";

// Tasarim tokenlari.
//
// Renk paleti burada DEGIL: src/themes/palette.js icinde, uc tohumdan
// (accent / bg / text) turetiliyor. Eski mor COLORS blogu kaldirildi;
// calisma zamani paleti icin paletteFor() / C kullanilir.


// Ders renkleri ARTIK BURADA DEGIL: tek kaynak src/themes/palette.js
// icindeki SUBJECT_COLORS (turetilmis oklab paleti).
//
// Burada ayni haritanin eski palet degerleriyle ikinci bir kopyasi ve bir
// `getSubjectIdentity(scheme, key)` yardimcisi vardi. Hicbir yer import
// etmiyordu -- `useSubjectIdentity` ThemeContext'teki subjectIdentity()
// uzerinden palette.subjects'i okuyor. Iki harita zamanla ayrisabilecegi
// icin olu kopya silindi (yedek rengi de olu mor #9B7BFF idi).

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

// Palet artık themes/palette.js'ten geliyor — yeni tasarımın türetilmiş
// (oklab color-mix) sistemi. Eski legacyPaletteFromDesignTokens yolu
// kullanımdan kalktı; aradaki isim farklarını palette.js'teki köprü kapatıyor.
export function paletteFor(scheme) {
  return buildPalette(scheme === "light" ? "light" : "dark");
}

// LEGACY — yeni kod `useC()` kullanmalı.
// Bunu doğrudan import eden 4 dosya kaldı (ScreenErrorBoundary, aiSuggestions,
// smartNudge, screenOptions). React ağacının dışında çalıştıkları için
// context'e erişemiyorlar; bu yüzden modül seviyesinde bir kopya duruyor.
let _runtimeScheme = "dark";

export const C = { ...paletteFor("dark") };

export function setRuntimeScheme(scheme) {
  const next = scheme === "dark" ? "dark" : "light";
  if (next === _runtimeScheme) return;
  _runtimeScheme = next;
  Object.assign(C, paletteFor(next));
  Object.assign(SHADOWS, _buildShadows(next));
}

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


// Tasarimin kendi olcu kademeleri. Yeni ekranlar bunlari kullanir; yukaridaki
// SPACING/RADIUS eski ekranlar icin duruyor ve ekranlar tasindikca dusecek.
export const STEP = { s1: 8, s2: 12, s3: 20, s4: 34, s5: 52 };
export const GUTTER = 22;

export const SHAPE = {
  chip: 6,
  segment: 6,
  button: 12,
  iconBox: 12,
  card: 20,
  cardTight: 16,
  panel: 20,
  sheet: 24,
  phone: 42,
};

export const CONTROL = {
  buttonPrimary: 52,
  buttonSecondary: 52,
  buttonTertiary: 44,
  chip: 38,
  segment: 36,
  tapMin: 44,
};

export const TYPOGRAPHY = {
  // Display — Bricolage Grotesque, tasarimda display'in tamami 400 agirlik
  display:       { fontFamily: "Bricolage_400", fontSize: 34,  lineHeight: 40, letterSpacing: -1.0 },
  heading:       { fontFamily: "Bricolage_400", fontSize: 28,  lineHeight: 34, letterSpacing: -0.8 },
  subheading:    { fontFamily: "Bricolage_400", fontSize: 22,  lineHeight: 28, letterSpacing: -0.5 },

  // Govde — Archivo, line-height 1.55-1.65
  body:          { fontFamily: "Archivo_400", fontSize: 14, lineHeight: 22 },
  bodyMedium:    { fontFamily: "Archivo_500", fontSize: 14, lineHeight: 22 },
  bodySemiBold:  { fontFamily: "Archivo_600", fontSize: 14, lineHeight: 22 },

  caption:       { fontFamily: "Archivo_400", fontSize: 13,   lineHeight: 20 },
  captionMedium: { fontFamily: "Archivo_500", fontSize: 13,   lineHeight: 20 },
  meta:          { fontFamily: "Archivo_500", fontSize: 12.5, lineHeight: 18 },
  micro:         { fontFamily: "Archivo_500", fontSize: 11.5, lineHeight: 16 },
  metaSemiBold:  { fontFamily: "Archivo_600", fontSize: 12.5, lineHeight: 18 },
  // Tablo/liste sayisi — tasarimda 13.5px Archivo, tabular
  tableValue:    { fontFamily: "Archivo_500", fontSize: 13.5, lineHeight: 20, fontVariant: ["tabular-nums"] },
  tableName:     { fontFamily: "Archivo_500", fontSize: 13.5, lineHeight: 20 },
  tableHead:     { fontFamily: "Archivo_600", fontSize: 11,   lineHeight: 15, letterSpacing: 1.32 },

  // Sayilar — Bricolage 400, tabular
  statHero:      { fontFamily: "Bricolage_400", fontSize: 96, lineHeight: 96, letterSpacing: -3.84, fontVariant: ["tabular-nums"] },
  stat:          { fontFamily: "Bricolage_400", fontSize: 46, lineHeight: 50, letterSpacing: -1.4,  fontVariant: ["tabular-nums"] },
  statLarge:     { fontFamily: "Bricolage_400", fontSize: 56, lineHeight: 60, letterSpacing: -2.0,  fontVariant: ["tabular-nums"] },
  statPair:      { fontFamily: "Bricolage_400", fontSize: 40, lineHeight: 36, letterSpacing: -1.6,  fontVariant: ["tabular-nums"] },
  statSmall:     { fontFamily: "Bricolage_400", fontSize: 26, lineHeight: 32, letterSpacing: -0.6,  fontVariant: ["tabular-nums"] },
  statMedium:    { fontFamily: "Bricolage_400", fontSize: 22, lineHeight: 28, letterSpacing: -0.4,  fontVariant: ["tabular-nums"] },

  // Konu adi — Bricolage, govde olcusunde
  topicName:     { fontFamily: "Bricolage_400", fontSize: 16, lineHeight: 22 },

  button:        { fontFamily: "Archivo_700", fontSize: 16, lineHeight: 20 },
  label: {
    fontFamily: "Archivo_600",
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 1.84,
    textTransform: "uppercase",
  },
};

// Animation tokens — tüm Reanimated/Animated konfigleri tek yerden
export const ANIMATION = {
  duration: {
    instant: 100,
    fast:    200,
    normal:  300,
    slow:    450,
    enter:   350,
    exit:    250,
  },
  // Bezier kontrol noktaları — CSS string DEĞİL, React Native'de kullanılabilir olsun diye.
  // Kullanım: Easing.bezier(...ANIMATION.easing.easeOut)
  easing: {
    easeOut:    [0.16, 1, 0.3, 1],
    easeIn:     [0.55, 0, 1, 0.45],
    easeInOut:  [0.45, 0, 0.55, 1],
    spring:     [0.34, 1.56, 0.64, 1],
  },
  spring: {
    gentle:  { damping: 20, stiffness: 200 },
    default: { damping: 18, stiffness: 320 },
    snappy:  { damping: 15, stiffness: 400 },
    bouncy:  { damping: 12, stiffness: 280 },
  },
};

function _buildShadows(scheme) {
  const e = scheme === "dark" ? ELEVATION.dark : ELEVATION.light;
  return {
    sm:     e.sm,
    card:   e.md,
    lg:     e.lg,
    xl:     e.xl,
    amber:  { ...e.md, shadowColor: "#FF9F2E", shadowOpacity: 0.30 },
    accent: { ...e.md, shadowColor: "#E5343F", shadowOpacity: 0.30 },
    orange: { ...e.md, shadowColor: "#E5343F", shadowOpacity: 0.30 },
    fab:    { ...e.lg, shadowColor: "#E5343F", shadowOpacity: 0.35 },
    green:  { ...e.md, shadowColor: "#34d399", shadowOpacity: 0.30 },
  };
}
export const SHADOWS = _buildShadows(_runtimeScheme);
