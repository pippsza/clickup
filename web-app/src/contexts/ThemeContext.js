import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('clickup-theme');
    if (saved) return saved;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const darkMode = theme === 'dark';
  const toggleDarkMode = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('clickup-theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#0f0f0f');
      root.style.setProperty('--bg-secondary', '#1a1a1a');
      root.style.setProperty('--bg-tertiary', '#2d2d2d');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a3a3a3');
      root.style.setProperty('--border-color', '#404040');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
    }

    root.style.setProperty('--primary-500', '#3b82f6');
    root.style.setProperty('--emerald-500', '#10b981');
    root.style.setProperty('--amber-500', '#f59e0b');
    root.style.setProperty('--rose-500', '#ef4444');
    root.style.setProperty('--purple-500', '#8b5cf6');
    root.style.setProperty('--cyan-500', '#06b6d4');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      darkMode,
      toggleDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
