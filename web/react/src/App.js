import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import PeriodSelector from "./components/PeriodSelector";
import SettingsModal from "./components/SettingsModal";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { loadReportData, generateReport } from "./services/reportService";

function AppContent() {
  const { currentTheme } = useTheme();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    hourlyRate: 25,
    currency: "USD",
    taxRate: 0.2,
  });

  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    reportType: "tasks",
  });

  useEffect(() => {
    // Загружаем настройки из localStorage
    const savedSettings = localStorage.getItem("clickup-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleLoadReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await loadReportData(selectedPeriod);
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await generateReport(selectedPeriod);
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("clickup-settings", JSON.stringify(newSettings));
    setShowSettings(false);
  };

  return (
    <div className={`min-h-screen ${currentTheme.secondary}`}>
      <Header
        onGenerateReport={handleGenerateReport}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onLoadReport={handleLoadReport}
        />

        {loading && (
          <div className={`text-center py-12`}>
            <div
              className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600`}
            ></div>
            <p className={`mt-4 ${currentTheme.textSecondary}`}>
              Загрузка данных...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center mb-8">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Ошибка загрузки данных
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {reportData && !loading && (
          <Dashboard
            data={reportData}
            settings={settings}
            reportType={selectedPeriod.reportType}
          />
        )}

        {!reportData && !loading && !error && (
          <div className="text-center py-12">
            <i
              className={`fas fa-chart-bar text-gray-400 dark:text-gray-600 text-6xl mb-4`}
            ></i>
            <h3
              className={`text-xl font-medium ${currentTheme.textSecondary} mb-2`}
            >
              Нет данных для отображения
            </h3>
            <p className={`${currentTheme.textSecondary}`}>
              Выберите период и нажмите "Загрузить отчет" или "Генерировать
              отчет"
            </p>
          </div>
        )}
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
