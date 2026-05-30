/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'tc:theme';

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
    return 'dark';
  });

  const resolved: 'dark' | 'light' = theme === 'system' ? getSystemTheme() : theme;

  // Brutalismo Elegante é o tema único da HomePage — aplica classe permanente.
  // Demais páginas herdam os tokens via .theme-brutal no root.
  useEffect(() => {
    document.documentElement.classList.add('theme-brutal');
    document.documentElement.classList.remove('theme-light');
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
