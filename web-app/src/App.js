import React, { useState, useContext } from 'react';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { useSettings } from './hooks/useSettings';
import Header from './components/Header';
import PeriodSelector from './components/PeriodSelector';
import MetricsCards from './components/MetricsCards';
import ChartsSection from './components/ChartsSection';
import TasksTable from './components/TasksTable';
import SettingsModal from './components/SettingsModal';
import ApiCapabilitiesDemo from './components/ApiCapabilitiesDemo';
import clickupService from './services/clickupService';
import { 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  InformationCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

function AppContent() {
  const { settings, updateSettings } = useSettings();
  const { darkMode } = useContext(ThemeContext);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const handleLoadReport = async () => {
    if (!process.env.REACT_APP_CLICKUP_TOKEN) {
      setError('ClickUp токен не найден. Добавьте REACT_APP_CLICKUP_TOKEN в .env файл');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await clickupService.generateMonthlyReport(
        selectedPeriod.year,
        selectedPeriod.month
      );
      setReportData(data);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка загрузки отчета:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (newSettings) => {
    updateSettings(newSettings);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen transition-colors duration-300" 
         style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Header onSettingsOpen={() => setShowSettings(true)} />
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              📊 Аналитика времени
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'api'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              🚀 Возможности API
            </button>
          </nav>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analytics' && (
          <>
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              onLoadReport={handleLoadReport}
              loading={loading}
            />

            {loading && (
              <div className="text-center py-12 fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                     style={{ backgroundColor: '#3b82f620' }}>
                  <ArrowPathIcon className="w-8 h-8 animate-spin" style={{ color: '#3b82f6' }} />
                </div>
                <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  Загрузка данных из ClickUp...
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Получаем записи времени и статистику
                </p>
              </div>
            )}

            {error && (
              <div className="scale-in rounded-xl p-6 text-center mb-8 border"
                   style={{ 
                     backgroundColor: darkMode ? '#7f1d1d20' : '#fef2f2',
                     borderColor: darkMode ? '#b91c1c' : '#fecaca'
                   }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                     style={{ backgroundColor: '#ef444420' }}>
                  <ExclamationTriangleIcon className="w-6 h-6" style={{ color: '#ef4444' }} />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: '#ef4444' }}>
                  Ошибка загрузки данных
                </h3>
                <p className="mb-4" style={{ color: 'var(--text-primary)' }}>{error}</p>
                {error.includes('токен') && (
                  <div className="text-left rounded-lg p-4 border"
                       style={{ 
                         backgroundColor: 'var(--bg-primary)',
                         borderColor: 'var(--border-color)'
                       }}>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Создайте файл <code className="px-2 py-1 rounded text-xs" 
                                         style={{ backgroundColor: 'var(--bg-tertiary)' }}>.env</code> в корне проекта и добавьте:
                    </p>
                    <code className="block text-sm p-3 rounded-lg font-mono"
                          style={{ 
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)'
                          }}>
                      REACT_APP_CLICKUP_TOKEN=your_token_here
                    </code>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                      Получить токен можно в{' '}
                      <a href="https://app.clickup.com/settings/apps" 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="font-medium hover:underline"
                         style={{ color: '#3b82f6' }}>
                        ClickUp Settings
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}

            {reportData && !loading && (
              <>
                <MetricsCards data={reportData} />
                <ChartsSection data={reportData} />
                <TasksTable data={reportData} />
              </>
            )}

            {!reportData && !loading && !error && (
              <div className="text-center py-12 fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                     style={{ backgroundColor: '#3b82f620' }}>
                  <ChartBarIcon className="w-10 h-10" style={{ color: '#3b82f6' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Добро пожаловать в ClickUp Analytics
                </h3>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Анализируйте свое время и повышайте продуктивность
                </p>
                
                <div className="max-w-lg mx-auto text-left rounded-xl p-6 border"
                     style={{ 
                       backgroundColor: 'var(--bg-primary)',
                       borderColor: '#3b82f6'
                     }}>
                  <div className="flex items-center mb-4">
                    <InformationCircleIcon className="w-5 h-5 mr-2" style={{ color: '#3b82f6' }} />
                    <h4 className="font-semibold" style={{ color: '#3b82f6' }}>
                      Первый запуск?
                    </h4>
                  </div>
                  <ol className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3"
                            style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>1</span>
                      <span>Получите API токен в ClickUp Settings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3"
                            style={{ backgroundColor: '#10b98120', color: '#10b981' }}>2</span>
                      <span>Добавьте его в .env файл как REACT_APP_CLICKUP_TOKEN</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3"
                            style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>3</span>
                      <span>Перезапустите приложение</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3"
                            style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>4</span>
                      <span>Выберите период и загрузите отчет</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'api' && <ApiCapabilitiesDemo />}
      </main>

      <SettingsModal
        show={showSettings}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
