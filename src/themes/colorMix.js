// CSS `color-mix(in oklab, A p%, B)` karşılığı — saf JS.
//
// Neden gerekli: yeni tasarımın paleti sabit renk listesi DEĞİL. Neredeyse her
// renk üç tohumdan (accent, bg, text) oklab uzayında karıştırılarak türetiliyor.
// Kullanıcının kendi vurgu rengini seçebilmesi ("hazır paletler") ve açık/koyu
// temanın aynı formüllerden çıkması buna dayanıyor. React Native'de ne
// color-mix ne de oklab var, bu yüzden burada kuruluyor.
//
// Referans: Björn Ottosson, "A perceptual color space for image processing".
// sRGB → linear → LMS → Oklab, karıştır, geri dön.

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v) {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, c)) * 255);
}

function linearToOklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinear(L, a, bb) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** "#RGB" | "#RRGGBB" | "#RRGGBBAA" | "rgba(...)" → { r,g,b,a } */
export function parseColor(input) {
  if (!input) return null;
  const c = String(input).trim();

  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split("").map((ch) => ch + ch).join("");
    }
    if (hex.length !== 6 && hex.length !== 8) return null;
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  const m = c.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i);
  if (m) {
    return {
      r: Math.round(+m[1]),
      g: Math.round(+m[2]),
      b: Math.round(+m[3]),
      a: m[4] === undefined ? 1 : +m[4],
    };
  }
  return null;
}

export function toHex({ r, g, b }) {
  const h = (n) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

/**
 * color-mix(in oklab, colorA percentA%, colorB)
 *
 *   mix("#E5343F", 87, "#2A0A0D")  →  accent'in %87'si + diğerinin %13'ü
 *
 * CSS ile aynı davranış: yüzde A rengine aittir, kalanı B'ye.
 * Alfa ayrıca doğrusal olarak karıştırılır (CSS de böyle yapar).
 */
export function mix(colorA, percentA, colorB) {
  const A = parseColor(colorA);
  const B = parseColor(colorB);
  if (!A || !B) return colorA;

  const t = Math.min(1, Math.max(0, percentA / 100));
  if (t === 1) return toHex(A);
  if (t === 0) return toHex(B);

  const la = linearToOklab(srgbToLinear(A.r), srgbToLinear(A.g), srgbToLinear(A.b));
  const lb = linearToOklab(srgbToLinear(B.r), srgbToLinear(B.g), srgbToLinear(B.b));

  const L = la[0] * t + lb[0] * (1 - t);
  const a = la[1] * t + lb[1] * (1 - t);
  const b = la[2] * t + lb[2] * (1 - t);

  const [lr, lg, lbl] = oklabToLinear(L, a, b);
  const alpha = A.a * t + B.a * (1 - t);
  const rgb = { r: linearToSrgb(lr), g: linearToSrgb(lg), b: linearToSrgb(lbl) };

  return alpha >= 1 ? toHex(rgb) : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${round3(alpha)})`;
}

/**
 * color-mix(in srgb, color X%, transparent) — tasarımda --accent-glow için
 * kullanılıyor. Şeffafa karıştırmak, pratikte alfa uygulamaktır.
 */
export function alpha(color, percent) {
  const c = parseColor(color);
  if (!c) return color;
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${round3((percent / 100) * c.a)})`;
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

/** WCAG bağıl parlaklık — kontrast denetimi için. */
export function luminance(color) {
  const c = parseColor(color);
  if (!c) return 0;
  const [r, g, b] = [c.r, c.g, c.b].map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** İki renk arasındaki WCAG kontrast oranı (1–21). */
export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}
