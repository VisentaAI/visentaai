import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved as Theme;
    }
    
    // Detect system preference on first visit
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-update if user hasn't manually set a preference
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setTimeout(() => setIsAnimating(false), 600);
  };

  const setThemeWithAnimation = (newTheme: Theme) => {
    if (newTheme !== theme) {
      setIsAnimating(true);
      setTheme(newTheme);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeWithAnimation }}>
      {children}
      {isAnimating && (
        <div 
          className="fixed inset-0 pointer-events-none z-[9999] theme-flash"
          style={{
            background: theme === 'dark' 
              ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, transparent 70%)',
          }}
        />
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
