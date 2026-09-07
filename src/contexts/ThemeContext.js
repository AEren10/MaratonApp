import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useColorScheme } from "react-native";

import { buildPalette, ACCENT_PRESETS } from "../themes/palette";
import { alpha } from "../themes/colorMix";
import { TYPE, FONTS, TRACKING } from "../themes/typography";
import { SPACING, RADIUS, ELEVATION, ANIMATION } from "../themes/tokens";
import { STORAGE_KEYS } from "../constants/storageKeys";
import * as appStorage from "../lib/storage/appStorage";

// Tema motoru.
//
// Eskiden burası koyu temaya KİLİTLİYDİ (`scheme = "dark"` sabit, setPref her
// zaman "dark" yazıyordu). Yeni tasarım hem açık hem koyu tam set içeriyor,
// ayrıca kullanıcının kendi vurgu rengini seçmesini ("hazır paletler")
// öngörüyor. Palet üç tohumdan türetildiği için (bkz. themes/palette.js)
// vurgu rengi değişince tüm palet yeniden hesaplanıyor.

const ThemeContext = createContext(null);

const PREF_KEY = STORAGE_KEYS.THEME_PREF;
const ACCENT_KEY = STORAGE_KEYS.THEME_ACCENT;

/** "system" | "light" | "dark" */
const VALID_PREFS = ["system", "light", "dark"];

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [pref, setPrefState] = useState("dark");
  const [accentKey, setAccentKeyState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      appStorage.getString(PREF_KEY).catch(() => null),
      appStorage.getString(ACCENT_KEY).catch(() => null),
    ])
      .then(([storedPref, storedAccent]) => {
        if (!active) return;
        if (VALID_PREFS.includes(storedPref)) setPrefState(storedPref);
        if (storedAccent) setAccentKeyState(storedAccent);
      })
      .catch(() => {})
      .finally(() => { if (active) setHydrated(true); });
    return () => { active = false; };
  }, []);

  const scheme = pref === "system" ? (systemScheme === "light" ? "light" : "dark") : pref;

  const setPref = useCallback((next) => {
    const value = VALID_PREFS.includes(next) ? next : "dark";
    setPrefState(value);
    appStorage.setString(PREF_KEY, value).catch(() => {});
  }, []);

  const setAccent = useCallback((key) => {
    setAccentKeyState(key || null);
    if (key) appStorage.setString(ACCENT_KEY, key).catch(() => {});
    else appStorage.remove(ACCENT_KEY).catch(() => {});
  }, []);

  const value = useMemo(() => {
    const preset = ACCENT_PRESETS.find((p) => p.key === accentKey);
    const overrides = preset ? { accent: scheme === "light" ? preset.light : preset.dark } : {};
    const palette = buildPalette(scheme, overrides);

    return {
      // Tema durumu
      pref,
      scheme,
      hydrated,
      isDark: scheme === "dark",
      setPref,

      // Kullanıcı vurgu rengi
      accentKey,
      setAccent,
      accentPresets: ACCENT_PRESETS,

      // Tasarım sistemi
      palette,
      C: palette,
      subjects: palette.subjects,
      subject: (key) => subjectIdentity(palette, key),
      type: TYPE,
      fonts: FONTS,
      tracking: TRACKING,
      spacing: SPACING,
      radius: RADIUS,
      elevation: scheme === "dark" ? ELEVATION.dark : ELEVATION.light,
      animation: ANIMATION,
    };
  }, [pref, scheme, hydrated, accentKey, setPref, setAccent]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};

export const useC = () => useTheme().palette;
export const useType = () => useTheme().type;
export const useElevation = () => useTheme().elevation;
export const useSubjectColor = (key) => {
  const { subjects, palette } = useTheme();
  return subjects[key] || palette.accent;
};

// 16 ekran bu API'yi { solid, tint, soft } bekleyerek kullanıyor — şekli koru.
export const useSubjectIdentity = (key) => useTheme().subject(key);

// Deneme anahtarlarını (tyt_*, ayt_*_ea vb.) müfredat anahtarına indirger.
function normalizeSubjectKey(key) {
  return key
    ?.replace(/^tyt_/, "")
    .replace(/^ayt_ea_/, "")
    .replace(/^ayt_say_/, "")
    .replace(/^ayt_sozel_/, "")
    .replace(/^ayt_/, "")
    // lgs_ ön eki SOYULMALIYDI — soyulmadığı için lgs_matematik, lgs_fen,
    // lgs_turkce gibi tüm LGS dersleri haritada bulunamıyor ve aynı vurgu
    // rengine düşüyordu. LGS kullanıcısı için ders ayrımı tamamen kayboluyordu.
    .replace(/^lgs_/, "")
    .replace(/_(ea|soz|say|sozel|sayisal)$/, "");
}

function subjectIdentity(palette, key) {
  const map = palette.subjects || {};
  const solid = map[normalizeSubjectKey(key)] || map[key] || palette.accent;
  return { solid, tint: alpha(solid, 16), soft: alpha(solid, 32) };
}
