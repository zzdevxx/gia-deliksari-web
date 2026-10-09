'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  /** False during SSR + first client render; true once the DOM theme is known. */
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
});

const STORAGE_KEY = 'gia_theme';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  // `data-theme` lets CSS-only selectors (and future CSS-only theme switching)
  // key off the resolved theme without depending on the `.dark` class alone.
  root.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Read back what the pre-paint script in layout.tsx already resolved, so the
  // first client render matches the DOM instead of flashing the wrong theme.
  useEffect(() => {
    const root = document.documentElement;
    const resolved: Theme = root.classList.contains('dark') ? 'dark' : 'light';
    setThemeState(resolved);
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      /* storage unavailable (private mode) — theme still applies for this session */
    }
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
