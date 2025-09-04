import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const SettingsModal = ({ show, settings, onSave, onClose }) => {
  const { theme, setTheme, currentTheme, themes } = useTheme();
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${currentTheme.primary} rounded-lg p-6 w-full max-w-md mx-4 shadow-xl`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${currentTheme.text}`}>
            Настройки
          </h2>
          <button
            onClick={onClose}
            className={`${currentTheme.textSecondary} hover:${currentTheme.text} transition-colors`}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Выбор темы */}
          <div>
            <label
              className={`block text-sm font-medium ${currentTheme.text} mb-2`}
            >
              <i className="fas fa-palette mr-2"></i>Тема приложения
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(themes).map(([key, themeData]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme === key
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : `border-gray-200 dark:border-gray-700 ${currentTheme.secondary}`
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <i
                      className={`fas ${
                        key === "light" ? "fa-sun" : "fa-moon"
                      } text-2xl ${
                        theme === key
                          ? "text-blue-500"
                          : currentTheme.textSecondary
                      }`}
                    ></i>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      theme === key
                        ? "text-blue-600 dark:text-blue-400"
                        : currentTheme.text
                    }`}
                  >
                    {themeData.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Почасовая ставка */}
          <div>
            <label
              className={`block text-sm font-medium ${currentTheme.text} mb-2`}
            >
              <i className="fas fa-dollar-sign mr-2"></i>Почасовая ставка
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) =>
                handleInputChange("hourlyRate", parseFloat(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 border ${currentTheme.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.primary} ${currentTheme.text}`}
              min="0"
              step="0.01"
            />
          </div>

          {/* Валюта */}
          <div>
            <label
              className={`block text-sm font-medium ${currentTheme.text} mb-2`}
            >
              <i className="fas fa-coins mr-2"></i>Валюта
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className={`w-full px-3 py-2 border ${currentTheme.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.primary} ${currentTheme.text}`}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="UAH">UAH (₴)</option>
              <option value="RUB">RUB (₽)</option>
            </select>
          </div>

          {/* Налоговая ставка */}
          <div>
            <label
              className={`block text-sm font-medium ${currentTheme.text} mb-2`}
            >
              <i className="fas fa-percentage mr-2"></i>Налоговая ставка (%)
            </label>
            <input
              type="number"
              value={formData.taxRate * 100}
              onChange={(e) =>
                handleInputChange(
                  "taxRate",
                  (parseFloat(e.target.value) || 0) / 100
                )
              }
              className={`w-full px-3 py-2 border ${currentTheme.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.primary} ${currentTheme.text}`}
              min="0"
              max="100"
              step="0.1"
            />
            <p className={`text-xs ${currentTheme.textSecondary} mt-1`}>
              К получению после налогов:{" "}
              {((1 - formData.taxRate) * 100).toFixed(1)}%
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-save mr-2"></i>Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 ${currentTheme.secondary} ${currentTheme.text} border ${currentTheme.border} py-2 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              <i className="fas fa-times mr-2"></i>Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
