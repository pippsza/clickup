import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const Header = ({ onGenerateReport, onOpenSettings }) => {
  const { theme, toggleTheme, currentTheme } = useTheme();

  return (
    <header
      className={`${currentTheme.primary} shadow-sm ${currentTheme.border} border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <i className="fas fa-clock text-blue-600 text-2xl mr-3"></i>
            <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
              ClickUp Time Tracker
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Переключатель темы */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${currentTheme.secondary} ${currentTheme.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              title={`Переключить на ${
                theme === "light" ? "темную" : "светлую"
              } тему`}
            >
              <i
                className={`fas ${
                  theme === "light" ? "fa-moon" : "fa-sun"
                } text-lg`}
              ></i>
            </button>

            <button
              onClick={onGenerateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Генерировать отчет
            </button>

            <button
              onClick={onOpenSettings}
              className={`${currentTheme.secondary} ${currentTheme.text} border ${currentTheme.border} px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              <i className="fas fa-cog mr-2"></i>
              Настройки
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
