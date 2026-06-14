import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, paletteFor } from "../themes/tokens";

const ThemeContext = createContext(null);
const STORAGE_KEY = "@maraton:themePref";

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setPrefState(raw);
      })
      .catch(() => {});
  }, []);

  const scheme = pref === "system" ? (system || "dark") : pref;

  const setPref = useCallback((next) => {
    setPrefState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(() => ({
    pref,
    scheme,
    setPref,
    palette: paletteFor(scheme),
    colors: scheme === "light" ? COLORS.light : COLORS.dark,
  }), [pref, scheme, setPref]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};
