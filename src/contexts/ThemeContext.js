import { createContext, useContext } from "react";
import { COLORS } from "../themes/tokens";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const theme = COLORS.dark;

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};
