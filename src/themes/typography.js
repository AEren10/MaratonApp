// Yeni tasarımın tipografi sistemi.
//
// İki aile, net iş bölümü:
//   Archivo (400/500/600/700) — arayüz: etiket, gövde, buton, tablo
//   Bricolage Grotesque (400) — editöryal: başlık ve kahraman sayılar
//
// Tasarım dosyasında 41 farklı px değeri geçiyor; bunların çoğu aynı rolün
// birkaç yarım piksel farklı tekrarı. Burada ROL bazlı sabitlenmiş bir ölçek
// var — ekranlarda ham sayı yazılmasın diye. Yarım pikseller korundu, çünkü
// tasarımın sıkı etiket ritmi onlara dayanıyor (RN kesirli fontSize destekler).
//
// ERİŞİLEBİLİRLİK NOTU: labelMicro (9px) ve labelSmall (9.5px) çok küçük.
// Tasarımda büyük harf + geniş harf aralığıyla kullanılıyorlar; yine de uzun
// metin için ASLA kullanılmamalı, yalnızca kısa bölüm etiketleri için.

export const FONTS = {
  // Arayüz
  regular: "Archivo_400Regular",
  medium: "Archivo_500Medium",
  semibold: "Archivo_600SemiBold",
  bold: "Archivo_700Bold",
  // Editöryal
  display: "BricolageGrotesque_400Regular",
};

// Tasarımda 73× .2em, 71× .16em, 45× .14em, 38× .18em kullanılmış.
// Küçük büyük-harfli etiketlerin okunabilirliği buna bağlı.
export const TRACKING = {
  tightest: -0.03,
  tight: -0.01,
  normal: 0,
  wide: 0.1,
  wider: 0.14,
  widest: 0.16,
  ultra: 0.2,
  extreme: 0.22,
};

/** em cinsinden harf aralığını px'e çevirir (RN letterSpacing px ister). */
export function trackPx(fontSize, em) {
  return Math.round(fontSize * em * 100) / 100;
}

function ui(size, weight, { lh, track } = {}) {
  const family =
    weight >= 700 ? FONTS.bold
    : weight >= 600 ? FONTS.semibold
    : weight >= 500 ? FONTS.medium
    : FONTS.regular;
  const style = { fontFamily: family, fontSize: size };
  if (lh) style.lineHeight = Math.round(size * lh * 10) / 10;
  if (track) style.letterSpacing = trackPx(size, track);
  return style;
}

function editorial(size, { lh } = {}) {
  const style = { fontFamily: FONTS.display, fontSize: size };
  if (lh) style.lineHeight = Math.round(size * lh * 10) / 10;
  return style;
}

export const TYPE = {
  // --- Bölüm etiketleri: büyük harf + geniş aralık ---
  labelMicro: ui(9, 700, { track: TRACKING.widest }),
  labelSmall: ui(9.5, 700, { track: TRACKING.widest }),
  label: ui(10.5, 600, { track: TRACKING.wider }),
  labelLoose: ui(10.5, 600, { track: TRACKING.ultra }),

  // --- Arayüz metni ---
  caption: ui(11, 500),
  captionStrong: ui(11, 600),
  footnote: ui(11.5, 500),
  footnoteStrong: ui(11.5, 600),
  small: ui(12, 500),
  smallStrong: ui(12.5, 600),
  body: ui(13, 500),
  bodyStrong: ui(13, 600),
  bodyRelaxed: ui(12, 400, { lh: 1.65 }),
  bodyLarge: ui(14, 500),
  button: ui(12.5, 600),
  titleUi: ui(16, 700),

  // --- Editöryal (Bricolage) ---
  titleSm: editorial(17),
  title: editorial(20),
  titleLg: editorial(22),
  headline: editorial(25),
  headlineLg: editorial(30),
  display: editorial(34),

  // Kahraman sayılar
  statSm: editorial(40),
  stat: editorial(56),
  statLg: editorial(92),
  statHero: editorial(150),
};

// App.js'te useFonts'a verilecek eşleme. Font dosyaları assets/fonts/ altına
// eklenmeli — Archivo ve Bricolage Grotesque henüz projede YOK.
export const FONT_ASSETS = {
  Archivo_400Regular: "Archivo_400Regular.ttf",
  Archivo_500Medium: "Archivo_500Medium.ttf",
  Archivo_600SemiBold: "Archivo_600SemiBold.ttf",
  Archivo_700Bold: "Archivo_700Bold.ttf",
  BricolageGrotesque_400Regular: "BricolageGrotesque_400Regular.ttf",
};
