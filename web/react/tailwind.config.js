/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class", // Включаем поддержку темной темы
  theme: {
    extend: {
      colors: {
        // Кастомные цвета для темы
        primary: {
          light: "#3b82f6",
          dark: "#1d4ed8",
        },
        secondary: {
          light: "#f8fafc",
          dark: "#1e293b",
        },
      },
    },
  },
  plugins: [],
};
