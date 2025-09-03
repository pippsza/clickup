import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsModal = ({ show, settings, onSave, onClose }) => {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState(settings);
  const [tokenValue, setTokenValue] = useState('');

  useEffect(() => {
    setFormData(settings);
    // Проверяем есть ли токен в переменных окружения
    setTokenValue(process.env.REACT_APP_CLICKUP_TOKEN || '');
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Настройки</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Токен API */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-key mr-2"></i>ClickUp API Token
            </label>
            <input
              type="password"
              value={tokenValue}
              onChange={(e) => setTokenValue(e.target.value)}
              placeholder="Добавьте в .env файл как REACT_APP_CLICKUP_TOKEN"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {tokenValue ? 'Токен найден в переменных окружения' : 'Добавьте REACT_APP_CLICKUP_TOKEN в .env файл'}
            </p>
          </div>

          {/* Выбор темы */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-palette mr-2"></i>Тема приложения
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <i className={`fas fa-sun text-2xl ${
                    theme === 'light' ? 'text-blue-500' : 'text-gray-400'
                  }`}></i>
                </div>
                <div className={`text-sm font-medium ${
                  theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Светлая
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <i className={`fas fa-moon text-2xl ${
                    theme === 'dark' ? 'text-blue-500' : 'text-gray-400'
                  }`}></i>
                </div>
                <div className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Темная
                </div>
              </button>
            </div>
          </div>

          {/* Почасовая ставка */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-dollar-sign mr-2"></i>Почасовая ставка
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              min="0"
              step="0.01"
            />
          </div>

          {/* Валюта */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-coins mr-2"></i>Валюта
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="UAH">UAH (₴)</option>
              <option value="RUB">RUB (₽)</option>
            </select>
          </div>

          {/* Налоговая ставка */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <i className="fas fa-percentage mr-2"></i>Налоговая ставка (%)
            </label>
            <input
              type="number"
              value={formData.taxRate * 100}
              onChange={(e) => handleInputChange('taxRate', (parseFloat(e.target.value) || 0) / 100)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              min="0"
              max="100"
              step="0.1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              К получению после налогов: {((1 - formData.taxRate) * 100).toFixed(1)}%
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
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
