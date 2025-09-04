import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Получаем тему из localStorage или системных настроек
    const saved = localStorage.getItem("clickup-theme");
    if (saved) return saved;

    // Проверяем системную тему
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    // Сохраняем тему в localStorage
    localStorage.setItem("clickup-theme", theme);

    // Применяем тему к document
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const themes = {
    light: {
      name: "Светлая",
      primary: "bg-white",
      secondary: "bg-gray-50",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
      accent: "bg-blue-500",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
    },
    dark: {
      name: "Темная",
      primary: "bg-gray-900",
      secondary: "bg-gray-800",
      text: "text-white",
      textSecondary: "text-gray-300",
      border: "border-gray-700",
      accent: "bg-blue-600",
      success: "bg-green-600",
      warning: "bg-yellow-600",
      error: "bg-red-600",
    },
  };

  const currentTheme = themes[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        themes,
        currentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
