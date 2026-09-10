import { mix, alpha } from "./colorMix";

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
    text: "#F5F2EF",
    up: "#34D399",
  },
  light: {
    accent: "#DE2E39",
    bg: "#F4EFEC",
    canvas: "#E7DFDA",
    text: "#171110",
    up: "#17A34A",
  },
};

// Tohumdan türetilmeyen, şemaya sabit değerler.
const FIXED = {
  dark: {
    text2: "#A3A0A8",
    // AA: bg 5.92 / surface 5.11 / elev 4.26.
    // elev uzerinde 4.5 alti — text3 ucuncu seviye yuzeyde METIN olarak kullanilmaz.
    text3: "#9794A0",
    text4: "#6B6870",
    text5: "#3B3941",
    accentInk: "#F7F2F0",
    accentBright: "#FF4D57",
    down: "#8A8790",
    warn: "#E0A93F",
    danger: "#F0555F",
  },
  light: {
    text2: "#5F504B",
    text3: "#6E635C",
    text4: "#A69691",
    text5: "#B4A5A0",
    accentInk: "#FFFFFF",
    accentBright: "#FF4D57",
    down: "#6B7F8D",
    warn: "#A8761D",
    danger: "#C4262F",
  },
};

// Açık temada yüzey basamakları color-mix ile değil, elle seçilmiş.
const LIGHT_SURFACES = {
  surface: "#FFFFFF",
  elev: "#F2EAE5",
  border: "#E2D8D2",
  line: "#EEE6E1",
  track: "#EAE1DC",
  void: "#F6F1EE",
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
    fizik: "#6ECFC0",
    kimya: "#E8A0C4",
    biyoloji: "#86CE92",
    tarih: "#C9BE6A",
    cografya: "#8B5CF6",
    felsefe: "#A78BFA",
    din: "#B5D97A",
    // Tasarım paletinde karşılığı olmayanlar — ayırt edilebilir tonlar.
    edebiyat: "#f0abfc",
    ingilizce: "#7dd3fc",
    ydt_ingilizce: "#7dd3fc",
    fen: "#2dd4bf",      // LGS Fen Bilimleri (fizik+kimya+biyoloji)
    sosyal: "#a78bfa",   // TYT Sosyal Bilimler
    inkilap: "#fda4af",  // LGS İnkılap Tarihi
  },
  light: {
    turkce: "#2F6FD0",
    matematik: "#D1631A",
    fizik: "#0A91AB",
    kimya: "#D1477F",
    biyoloji: "#12996A",
    tarih: "#B07D0A",
    cografya: "#5B5FD0",
    felsefe: "#8B4FD0",
    din: "#5F8F0F",
    edebiyat: "#A83BAF",
    ingilizce: "#0E7490",
    ydt_ingilizce: "#0E7490",
    fen: "#0D9488",
    sosyal: "#6D3FD0",
    inkilap: "#BE4B5C",
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
        border: mix(bg, 77, text),
        line: mix(bg, 92, text),
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
    brandFill: accent,
    accentDeep: isDark ? "#A81C26" : mix(accent, 70, "#000000"),
    brandTint: mix(accent, isDark ? 13 : 12, bg),
    accentPress: mix(accent, 86, "#000000"),
    accentGlow: alpha(accent, isDark ? 30 : 26),

    // Rota / grafik türevleri
    proj: mix(accent, isDark ? 52 : 62, bg),
    projNode: mix(accent, isDark ? 44 : 60, fixed.text2),
    stop: mix(accent, isDark ? 44 : 58, bg),
    past: accent,
    bandEdge: mix(accent, isDark ? 32 : 30, bg),
    targetLine: mix(accent, isDark ? 22 : 26, bg),
    targetLabel: mix(accent, isDark ? 28 : 34, fixed.text2),
    barIdle: mix(accent, isDark ? 22 : 20, bg),

    // Isı haritası basamakları
    heat1: mix(accent, isDark ? 18 : 14, bg),
    heat2: mix(accent, isDark ? 40 : 32, bg),
    heat3: mix(accent, isDark ? 62 : 56, bg),
    heat4: mix(accent, isDark ? 82 : 80, bg),

    subjects: SUBJECT_COLORS[isDark ? "dark" : "light"],
  };

  Object.assign(p, legacyAliases(p));

  _cache.set(key, p);
  return p;
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
    textOnFill: p.accentInk,
    textOnBrand: p.accentInk,
    textOnAccent: p.accentInk,
    textInverse: p.accentInk,

    // Marka
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
