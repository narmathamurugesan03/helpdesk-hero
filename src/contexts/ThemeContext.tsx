// ============================================================
// ThemeContext — manages dynamic theme color + logo globally
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

function hexToHsl(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function adjustLightness(hsl: string, delta: number): string {
  const parts = hsl.split(" ");
  const l = parseInt(parts[2]);
  return `${parts[0]} ${parts[1]} ${Math.max(0, Math.min(100, l + delta))}%`;
}

interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
  logo: string | null;
  setLogo: (dataUrl: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColorState] = useState(() => localStorage.getItem("themeColor") || "#3b82f6");
  const [logo, setLogoState] = useState<string | null>(() => localStorage.getItem("appLogo"));

  const applyThemeColor = useCallback((hex: string) => {
    const hsl = hexToHsl(hex);
    const root = document.documentElement;
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--primary-dark", adjustLightness(hsl, -10));
    root.style.setProperty("--primary-light", adjustLightness(hsl, 42));
    root.style.setProperty("--accent", hsl);
    root.style.setProperty("--ring", hsl);
    root.style.setProperty("--sidebar-active-bg", hsl);
    root.style.setProperty("--sidebar-primary", hsl);
    root.style.setProperty("--sidebar-ring", hsl);
    root.style.setProperty("--status-inprogress", hsl);
    root.style.setProperty("--status-inprogress-bg", adjustLightness(hsl, 42));
  }, []);

  useEffect(() => {
    applyThemeColor(themeColor);
  }, [themeColor, applyThemeColor]);

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
    localStorage.setItem("themeColor", color);
  };

  const setLogo = (dataUrl: string | null) => {
    setLogoState(dataUrl);
    if (dataUrl) localStorage.setItem("appLogo", dataUrl);
    else localStorage.removeItem("appLogo");
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, logo, setLogo }}>
      {children}
    </ThemeContext.Provider>
  );
};
