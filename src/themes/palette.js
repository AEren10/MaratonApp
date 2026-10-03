import { mix, alpha, contrastRatio } from "./colorMix.js";
export { mix, alpha };

// Yeni tasarımın palet sistemi. Sabit renk listesi DEĞİL — üç tohumdan
// (accent / bg / text) türetiliyor. Tasarım dosyasındaki kök <section>
// bloğunun birebir karşılığı; oradaki color-mix(in oklab, ...) çağrıları
// colorMix.js ile hesaplanıyor (tarayıcının gerçek çıktısına karşı ±1
// doğrulandı).
//
// Kullanıcı vurgu rengini değiştirebildiği için ("hazır paletler") palet
// çalışma zamanında hesaplanmalı. Sonuç önbelleğe alınır: aynı tohumlarla
// ikinci kez hesaplanmaz.

export const SEEDS = {
  dark: {
    accent: "#E5343F",
    bg: "#1C1C23",
    canvas: "#1C1C23",
    text: "#ECE8E4",
    up: "#34D399",
  },
  light: {
    // Acik zeminde parlak kizil "alarm" gibi bagiriyordu: koyu sarap tonu.
    accent: "#C42633",
    bg: "#EDE7DF",      // Sicak editorial kagit zemini (Brief 22 / Kullanici karari)
    canvas: "#E4DDD5",
    text: "#16120F",
    up: "#10632E",      // AA: bg 6.01 / elev 7.38
  },
};

// Tohumdan türetilmeyen, şemaya sabit değerler.
const FIXED = {
  dark: {
    text2: "#B0ADB5",
    // AA: bg 6.59 / surface 5.70 / elev 4.74 — AA her yerde gecer.
    text3: "#A3A0AB",
    text4: "#827F88",
    text5: "#3B3941",
    accentInk: "#F7F2F0",
    accentBright: "#FF6A72",
    down: "#9A97A0",
    warn: "#E0A93F",
    danger: "#F0555F",
  },
  light: {
    // Kahverengimsi tonlar hissi camurlastiriyordu: notr sicak gri.
    // AA (bg / surface / elev): text2 8.07 / 9.91 · text3 5.44 / 6.68
    text2: "#47423F",
    text3: "#615B57",
    text4: "#9C9590",
    text5: "#C9C1BA",
    accentInk: "#FFFFFF",
    accentBright: "#A81C27", // AA: bg 5.98 / elev 7.34
    down: "#566B79",         // AA: bg 4.53 / elev 5.56 (kotu haber bagirmaz)
    warn: "#92400E",         // AA: bg 5.77 / elev 7.09
    danger: "#C4262F",       // AA: bg 4.66 / elev 5.73
  },
};

// Acik temada yuzey basamaklari: sicak kagit zemini (#EDE7DF) uzerinde beyaz
// kartlar (#FFFFFF), ince sicak kenarlik (#DCD2C5) ve cok hafif sicak kahve golgesi.
// Camurlu kum yuzeyi (#E6D6C1) kalkti; kartlar temiz beyaz, girintiler (void/track)
// zeminden bir kademe koyu kuyu.
const LIGHT_SURFACES = {
  surface: "#FFFFFF",
  elev: "#FFFFFF",
  border: "#D0C5B5",
  line: "#DCD2C5",
  track: "#DDD5CA",
  void: "#E4DDD5",
  sand: "#EADDCB",
};

// Tasarım dosyası 9 ders rengi tanımlıyor (--s-tur … --s-din). Müfredat ise
// bunlara ek olarak `edebiyat`, `ydt_ingilizce` ve LGS'ye özgü `fen`,
// `sosyal`, `inkilap`, `ingilizce` anahtarlarını kullanıyor.
// Bunlar haritada YOKSA getSubjectByKey null döner ve ders `accent`e düşer —
// LGS kullanıcısında TÜM dersler aynı kızıl renkte görünüyordu.
export const SUBJECT_COLORS = {
  dark: {
    turkce: "#74A9E8",
    matematik: "#E0A570",
    fizik: "#56C6D6",
    kimya: "#E8A0C4",
    biyoloji: "#7FCB7A",
    tarih: "#D6C25A",
    cografya: "#A27BF8",
    felsefe: "#A78BFA",
    din: "#C8B8A6",
    // Tasarım paletinde karşılığı olmayanlar — ayırt edilebilir tonlar.
    edebiyat: "#f0abfc",
    ingilizce: "#7dd3fc",
    ydt_ingilizce: "#7dd3fc",
    fen: "#2dd4bf",      // LGS Fen Bilimleri (fizik+kimya+biyoloji)
    sosyal: "#a78bfa",   // TYT Sosyal Bilimler
    inkilap: "#fda4af",  // LGS İnkılap Tarihi
  },
  light: {
    // Kum kart ustunde yazi olarak da okunur (AA 4.6+): ton ayni, koyuluk artti.
    // Tarih koyu temadaki gibi altin ailesinde; matematikle (yanik turuncu) karismasin.
    turkce: "#275BAB",
    matematik: "#944612",
    fizik: "#0C657D",
    kimya: "#A92A5E",
    biyoloji: "#126B33",
    tarih: "#6E5C0A",
    cografya: "#474CCA",
    felsefe: "#7A36C8",
    din: "#436709",
    edebiyat: "#923398",
    ingilizce: "#0C657D",
    ydt_ingilizce: "#0C657D",
    fen: "#09675F",
    sosyal: "#6B3DCF",
    inkilap: "#9F3948",
  },
};

const _cache = new Map();

/**
 * Şema + kullanıcı tercihinden tam paleti üretir.
 *
 *   buildPalette("dark")
 *   buildPalette("dark", { accent: "#3B82F6" })   // kullanıcı vurgu rengi
 */
export function buildPalette(scheme = "dark", overrides = {}) {
  const key = scheme + "|" + JSON.stringify(overrides);
  const hit = _cache.get(key);
  if (hit) return hit;

  const isDark = scheme !== "light";
  const base = SEEDS[isDark ? "dark" : "light"];
  const fixed = FIXED[isDark ? "dark" : "light"];

  const accent = overrides.accent || base.accent;
  const bg = overrides.bg || base.bg;
  const text = overrides.text || base.text;
  const up = overrides.up || base.up;
  const canvas = overrides.canvas || base.canvas;
  const down = fixed.down;

  const surfaces = isDark
    ? {
        surface: mix(bg, 93, text),
        elev: mix(bg, 86, text),
        border: overrides.border || "#5A5961",
        line: overrides.line || "#3A3A42",
        track: mix(bg, 87, text),
        void: mix(bg, 97, text),
      }
    : LIGHT_SURFACES;

  const p = {
    scheme: isDark ? "dark" : "light",

    // Tohumlar
    accent,
    bg,
    canvas,
    text,
    up,
    down,

    ...surfaces,
    ...fixed,

    // Marka türevleri
    brandFill: overrides.brandFill || (isDark ? "#CF2833" : "#B8212C"),
    brandFillPress: isDark ? "#A81C26" : "#951A23",
    brandPress: isDark ? "#A81C26" : "#951A23",
    accentText: overrides.accentText || (isDark ? "#FF6A72" : "#A81C27"),
    accentDeep: isDark ? "#A81C26" : mix(accent, 70, "#000000"),
    brandTint: mix(accent, isDark ? 13 : 12, bg),
    accentPress: isDark ? "#C22730" : mix(accent, 86, "#000000"),
    accentGlow: alpha(accent, isDark ? 30 : 26),

    // Secili durum (cip, sekme, secenek, radyo). Kizil yalniz birincil
    // butonda ve rota cizgisinde: secim yuzey tonu + metin rengiyle anlatilir
    // (2026-10 denetimi: kizil her yerde kullaniliyor, vurgu kayboluyordu).
    selBorder: fixed.text2,
    selFill: surfaces.elev,
    selText: text,

    // Seri alevi: turuncu. Kizil ana buton + rota cizgisine ait; seri
    // (alev, takvimde calisilan gun, seri noktalari) kendi sicak tonunda.
    // Acik temada koyulastirildi: zemin ustunde AA (>= 4.5).
    flame: isDark ? "#FF8A3D" : "#9E3206",
    flameInk: isDark ? "#241307" : "#FFFFFF",
    flameDeep: isDark ? "#6B3416" : "#EBC2A6",

    // Rota / grafik türevleri
    proj: mix(accent, isDark ? 52 : 62, bg),
    projNode: mix(accent, isDark ? 44 : 60, fixed.text2),
    stop: mix(accent, isDark ? 44 : 58, bg),
    past: isDark ? "#D9D5D0" : mix(text, 80, bg),
    bandEdge: mix(accent, isDark ? 32 : 30, bg),
    targetLine: mix(accent, isDark ? 22 : 26, bg),
    targetLabel: mix(accent, isDark ? 28 : 34, fixed.text2),
    barIdle: mix(accent, isDark ? 22 : 20, bg),

    // Isı haritası basamakları — nötr basamaklar
    heat1: isDark ? "#45444F" : mix(text, 25, bg),
    heat2: isDark ? "#6B6870" : mix(text, 45, bg),
    heat3: isDark ? "#A3A0AB" : mix(text, 65, bg),
    heat4: isDark ? "#ECE8E4" : mix(text, 85, bg),

    // Modal zemini ve gorsel ustu karartma. Satir ici rgba() yerine tek
    // kaynak: acik temada da dogru koyulukta kaliyor.
    scrim: alpha("#000000", isDark ? 74 : 52),
    scrimSoft: alpha("#000000", isDark ? 45 : 32),

    alpha: (color, percent) => alpha(color, percent),

    subjects: SUBJECT_COLORS[isDark ? "dark" : "light"],
  };

  // KULLANICI ANA RENGI: varsayilan kizil disinda bir renk secildiyse
  // butun marka tonlari (buton dolgusu, basili ton, kizil yazi/vurgu) o
  // renkten turetilir. Eskiden bunlar sabit kizildi: mor secince grafik
  // mor, "Deneme gir" ve "Tekrara basla" kizil kaliyordu (kullanici, 3 Ekim).
  const custom = overrides.accent && overrides.accent.toUpperCase() !== base.accent.toUpperCase();
  if (custom) Object.assign(p, accentFamily(accent, isDark));

  Object.assign(p, legacyAliases(p));
  if (custom) {
    p.textOnFill = p.accentInk;
    p.textOnBrand = p.accentInk;
    p.textOnAccent = p.accentInk;
    p.textInverse = p.accentInk;
  }

  _cache.set(key, p);
  return p;
}

// Secilen ana renkten marka ailesi. Dolgu ustundeki yazi rengi kontrasta
// gore secilir (amber/yesil gibi acik renklerde koyu yazi).
function accentFamily(accent, isDark) {
  const fill = mix(accent, isDark ? 90 : 92, "#000000");
  const press = mix(accent, isDark ? 72 : 76, "#000000");
  const textTone = isDark ? mix(accent, 72, "#FFFFFF") : mix(accent, 78, "#000000");
  const ink = contrastRatio("#FFFFFF", fill) >= contrastRatio("#1C1C23", fill) ? "#FFFFFF" : "#1C1C23";
  return {
    brandFill: fill,
    brandFillPress: press,
    brandPress: press,
    accentDeep: mix(accent, 70, "#000000"),
    accentText: textTone,
    accentBright: textTone,
    accentInk: ink,
  };
}

/**
 * GEÇİŞ KÖPRÜSÜ — kalıcı değil.
 *
 * Mevcut kod tabanında ~2500 yerde eski palet anahtarları okunuyor
 * (C.muted 384×, C.sec 185×, C.green 190× ...). Yeni tasarımın palet
 * isimleri farklı. Bu eşleme olmasaydı her ekran undefined renkle çizerdi.
 *
 * Ekranlar yeni tasarıma taşındıkça buradaki karşılıklar teker teker
 * düşürülmeli; hedef, bu fonksiyonun tamamen silinmesi.
 */
function legacyAliases(p) {
  const s = p.subjects;
  return {
    // Metin basamakları
    sec: p.text2,
    muted: p.text3,
    textMuted: p.text3,
    textPrimary: p.text,
    textSecondary: p.text2,

    // Yüzeyler
    surface2: p.elev,
    card: p.surface,
    borderSoft: p.line,
    surfacePressed: alpha(p.text, 6),

    // Dolgu üstü mürekkep
    textOnFill: "#FFFFFF",
    textOnBrand: "#FFFFFF",
    textOnAccent: "#FFFFFF",
    textInverse: p.accentInk,

    // Marka
    accentText: p.accentText,
    accentLight: p.brandTint,
    accentPressed: p.accentPress,
    accentDark: p.accentPress,
    brandLight: p.accentBright,

    // Eski "enerji" rengi turuncuydu; yeni tasarımda marka zaten sıcak kızıl.
    orange: p.accent,
    orangeLight: p.brandTint,
    orangePressed: p.accentPress,
    coral: p.accent,

    // Anlamsal
    success: p.up,
    green: p.up,
    warning: p.warn,
    amber: p.warn,
    yellow: p.warn,
    red: p.danger,
    info: s.turkce,

    // Eski genel palet — ders renklerinden karşılanıyor
    blue: s.turkce,
    purple: s.cografya,
    teal: s.fizik,
    pink: s.kimya,
  };
}

/** Ayarlarda gösterilecek hazır vurgu renkleri. */
export const ACCENT_PRESETS = [
  { key: "kirmizi", name: "Kızıl", dark: "#E5343F", light: "#DE2E39" },
  { key: "turuncu", name: "Turuncu", dark: "#F97316", light: "#EA6A0A" },
  { key: "amber", name: "Amber", dark: "#F59E0B", light: "#C97C06" },
  { key: "yesil", name: "Yeşil", dark: "#22C55E", light: "#15803D" },
  { key: "mavi", name: "Mavi", dark: "#3B82F6", light: "#1D4ED8" },
  { key: "mor", name: "Mor", dark: "#8B5CF6", light: "#6D28D9" },
];
