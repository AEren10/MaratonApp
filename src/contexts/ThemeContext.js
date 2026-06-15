import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  COLORS,
  paletteFor,
  SUBJECT_COLORS,
  ELEVATION,
  getSubjectIdentity,
} from "../themes/tokens";

const ThemeContext = createContext(null);
const STORAGE_KEY = "@maraton:themePref";

// pref: "system" | "light" | "dark"
// scheme: actual resolved value (system follows OS)
//
// Default "light" — dark tema henüz tüm ekranlarda eşit kalitede değil,
// kullanıcı manuel "dark"a geçinceye kadar light kullanılır. System ile
// otomatik geçiş istenirse "system" seçilebilir.
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // null | "light" | "dark"
  const [pref, setPrefState] = useState("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw && (raw === "system" || raw === "light" || raw === "dark")) {
          setPrefState(raw);
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const scheme = pref === "system" ? (systemScheme || "light") : pref;

  const setPref = useCallback((next) => {
    setPrefState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(() => {
    const palette = paletteFor(scheme);
    const colors = scheme === "dark" ? COLORS.dark : COLORS.light;
    return {
      pref,
      scheme,
      hydrated,
      setPref,
      // Yeni API
      palette,
      C: palette, // alias — useC() döner
      colors,
      subjectColors: SUBJECT_COLORS[scheme],
      elevation: ELEVATION[scheme],
      // Helper
      subject: (key) => getSubjectIdentity(scheme, key),
    };
  }, [pref, scheme, hydrated, setPref]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};

// Lokal `C` aliası için kestirme — ekranda `const C = useC();` yaz, mevcut
// `C.bg`, `C.amber` vb. çağrıları aynen çalışır.
export const useC = () => useTheme().palette;
export const useSubjectIdentity = (key) => useTheme().subject(key);
export const useElevation = () => useTheme().elevation;
