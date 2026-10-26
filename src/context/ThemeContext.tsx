import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      // Clear legacy dark cache if previously saved
      const legacy = localStorage.getItem('acuattend_theme');
      if (legacy === 'dark') {
        localStorage.removeItem('acuattend_theme');
      }
      const saved = localStorage.getItem('acuattend_theme_v2');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Fallback
    }
    // Force default to clean white light theme
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('acuattend_theme_v2', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Ensure 'dark' class is cleanly removed on initial render if light
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
