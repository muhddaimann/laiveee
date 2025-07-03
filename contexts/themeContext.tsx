import { CustomDarkTheme, CustomLightTheme } from "../constants/theme";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const THEME_KEY = "app_theme_darkMode";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof CustomLightTheme;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: CustomLightTheme,
});

export const useToggle = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved !== null) {
        setIsDarkMode(saved === "true");
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isDarkMode.toString());
    } catch {}
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const theme = useMemo(
    () => (isDarkMode ? CustomDarkTheme : CustomLightTheme),
    [isDarkMode]
  );

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
