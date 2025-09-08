import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { useSettings } from '../hooks/useSettings';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { 
  ChartBarIcon, 
  PresentationChartLineIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AllTimeAnalytics = () => {
  const { darkMode } = useContext(ThemeContext);
  const { calculateEarnings, formatCurrency } = useSettings();
  
  const [rawTimeData, setRawTimeData] = useState(null); // Сырые данные времени
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Инициализация...');
  const isLoadingRef = useRef(false);
  const debounceTimeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    startYear: new Date().getFullYear() - 1,
    endYear: new Date().getFullYear(),
    minHours: 0,
    showTrend: true,
    timestamp: Date.now() // Добавляем timestamp для принудительного обновления
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Дебаунс для фильтров
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500мс задержка для дебаунса

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters]);

  const colors = {
    primary: '#6366f1',
    secondary: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    gradient: {
      purple: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      pink: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      blue: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    }
  };

  // Пересчитываем данные при изменении настроек
  const processedData = useMemo(() => {
    if (!rawTimeData) return null;
    
    const processMonthData = (timeEntries, year, month) => {
      const totalTime = timeEntries.reduce((sum, entry) => sum + parseInt(entry.duration), 0);
      const totalHours = totalTime / (1000 * 60 * 60);
      const earnings = calculateEarnings(totalTime);
      
      const taskStats = {};
      const daysWithEntries = new Set();
      
      timeEntries.forEach(entry => {
        const taskName = entry.task?.name || 'Без названия';
        if (!taskStats[taskName]) {
          taskStats[taskName] = 0;
        }
        taskStats[taskName] += parseInt(entry.duration);
        
        // Добавляем день в множество дней с записями
        const entryDate = new Date(parseInt(entry.start));
        const dayKey = entryDate.toDateString();
        daysWithEntries.add(dayKey);
      });

      const topTasks = Object.entries(taskStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, time]) => ({ name, time, hours: time / (1000 * 60 * 60) }));

      // Считаем средние часы в день только для дней с записями времени
      const daysWorked = daysWithEntries.size;
      const avgHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;

      return {
        year,
        month,
        monthName: new Date(year, month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
        totalTime,
        totalHours,
        earnings,
        tasksCount: Object.keys(taskStats).length,
        topTasks,
        avgHoursPerDay,
        daysWorked
      };
    };

    // Группируем данные по месяцам
    const monthlyDataMap = new Map();
    
    rawTimeData.forEach(entry => {
      const entryDate = new Date(parseInt(entry.start));
      const year = entryDate.getFullYear();
      const month = entryDate.getMonth();
      const monthKey = `${year}-${month}`;
      
      if (!monthlyDataMap.has(monthKey)) {
        monthlyDataMap.set(monthKey, []);
      }
      monthlyDataMap.get(monthKey).push(entry);
    });

    // Обрабатываем каждый месяц
    const monthlyData = [];
    monthlyDataMap.forEach((entries, monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthData = processMonthData(entries, year, month);
      
      // Применяем фильтр минимальных часов
      if (monthData.totalHours >= debouncedFilters.minHours) {
        monthlyData.push(monthData);
      }
    });

    // Сортируем по дате
    monthlyData.sort((a, b) => {
      const dateA = new Date(a.year, a.month);
      const dateB = new Date(b.year, b.month);
      return dateA - dateB;
    });

    return monthlyData;
  }, [rawTimeData, calculateEarnings, debouncedFilters.minHours]);

  useEffect(() => {
    const fetchAllTimeData = async () => {
      // Если уже загружается, не делаем повторный запрос
      if (isLoadingRef.current) {
        console.log('Данные уже загружаются, пропускаем запрос');
        return;
      }
      
      isLoadingRef.current = true;
      setLoading(true);
      setLoadingStep('Получение доступных команд...');
      console.log('Загружаем данные за все время одним запросом...');
      
      try {
        const token = process.env.REACT_APP_CLICKUP_TOKEN;
        if (!token) {
          throw new Error('ClickUp токен не найден');
        }

        // Сначала получаем список доступных команд (workspaces)
        console.log('Получаем список доступных команд...');
        setLoadingStep('Получение списка команд...');
        const teamsResponse = await fetch('https://api.clickup.com/api/v2/team', {
          headers: {
            'Authorization': token
          }
        });

        if (!teamsResponse.ok) {
          throw new Error(`Ошибка получения списка команд: ${teamsResponse.status}`);
        }

        const teamsData = await teamsResponse.json();
        console.log('Доступные команды:', teamsData);

        if (!teamsData.teams || teamsData.teams.length === 0) {
          throw new Error('Нет доступных команд для данного токена');
        }

        // Используем первую доступную команду
        const teamId = teamsData.teams[0].id;
        console.log(`Используем команду ID: ${teamId}`);

        // Определяем диапазон дат
        const startDate = new Date(debouncedFilters.startYear, 0, 1);
        const endDate = new Date(debouncedFilters.endYear, 11, 31);
        
        console.log(`Загружаем данные за период: ${startDate.toDateString()} - ${endDate.toDateString()}`);
        setLoadingStep('Загрузка данных времени...');

        // Делаем один запрос за весь период с правильным team ID
        const response = await fetch(
          `https://api.clickup.com/api/v2/team/${teamId}/time_entries?start_date=${startDate.getTime()}&end_date=${endDate.getTime()}`,
          {
            headers: {
              'Authorization': token
            }
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Ошибка API:', errorText);
          throw new Error(`API вернул ошибку: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`Получено ${data.data?.length || 0} записей времени`);
        setLoadingStep('Обработка данных...');

        if (data.data && data.data.length > 0) {
          console.log(`Обработано ${data.data.length} записей времени`);
          setRawTimeData(data.data);
        } else {
          console.log('Нет данных за указанный период');
          setRawTimeData([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных за все время:', error);
        setRawTimeData([]);
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    };

    // Загружаем данные только если есть токен
    const token = process.env.REACT_APP_CLICKUP_TOKEN;
    if (token) {
      fetchAllTimeData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters.startYear, debouncedFilters.endYear, debouncedFilters.minHours, debouncedFilters.timestamp]);  const handleApplyFilters = () => {
    // Принудительно перезагружаем данные изменив timestamp
    setFilters(prevFilters => ({
      ...prevFilters, 
      timestamp: Date.now()
    }));
  };

  const getChartData = () => {
    if (!processedData) return null;

    const labels = processedData.map(data => data.monthName);
    const hoursData = processedData.map(data => data.totalHours);
    const earningsData = processedData.map(data => data.earnings.net);

    return {
      labels,
      datasets: [
        {
          label: 'Часы',
          data: hoursData,
          backgroundColor: colors.primary + '80',
          borderColor: colors.primary,
          borderWidth: 3,
          borderRadius: 8,
          yAxisID: 'y'
        },
        {
          label: 'Заработок ($)',
          data: earningsData,
          backgroundColor: colors.success + '80',
          borderColor: colors.success,
          borderWidth: 3,
          borderRadius: 8,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const getLineChartData = () => {
    if (!processedData) return null;

    return {
      labels: processedData.map(data => data.monthName),
      datasets: [
        {
          label: 'Средние часы в день',
          data: processedData.map(data => data.avgHoursPerDay),
          borderColor: colors.secondary,
          backgroundColor: colors.secondary + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.secondary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#ffffff' : '#374151',
          font: { size: 12, weight: '500' },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        titleColor: darkMode ? '#ffffff' : '#374151',
        bodyColor: darkMode ? '#ffffff' : '#374151',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          color: darkMode ? '#ffffff' : '#374151',
          font: { size: 11 },
          callback: function(value) {
            return value.toFixed(0) + ' ч';
          }
        },
        title: {
          display: true,
          text: 'Часы',
          color: darkMode ? '#ffffff' : '#374151',
          font: { size: 12, weight: 'bold' }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: {
          color: darkMode ? '#ffffff' : '#374151',
          font: { size: 11 },
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        },
        title: {
          display: true,
          text: 'Заработок ($)',
          color: darkMode ? '#ffffff' : '#374151',
          font: { size: 12, weight: 'bold' }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          font: { size: 11 }
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          color: darkMode ? '#ffffff' : '#374151',
          font: { size: 11 },
          callback: function(value) {
            return value.toFixed(1) + ' ч/день';
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          font: { size: 11 }
        }
      }
    }
  };

  const getTotalStats = () => {
    if (!processedData) return null;

    const totalHours = processedData.reduce((sum, data) => sum + data.totalHours, 0);
    const totalEarnings = processedData.reduce((sum, data) => sum + data.earnings.net, 0);
    const totalTasks = processedData.reduce((sum, data) => sum + data.tasksCount, 0);
    const avgHoursPerMonth = totalHours / processedData.length;

    return { totalHours, totalEarnings, totalTasks, avgHoursPerMonth };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {loadingStep}
          </p>
          <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Период: {new Date(debouncedFilters.startYear, 0, 1).getFullYear()}-{new Date(debouncedFilters.endYear, 11, 31).getFullYear()}
          </div>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();
  const chartData = getChartData();
  const lineData = getLineChartData();

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div 
        className="scale-in rounded-xl p-6 transition-all duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-center mb-4">
          <FunnelIcon className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Фильтры
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Год начала
            </label>
            <input
              type="number"
              value={filters.startYear}
              onChange={(e) => setFilters({...filters, startYear: parseInt(e.target.value)})}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
              min="2020"
              max={new Date().getFullYear()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Год окончания
            </label>
            <input
              type="number"
              value={filters.endYear}
              onChange={(e) => setFilters({...filters, endYear: parseInt(e.target.value)})}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
              min="2020"
              max={new Date().getFullYear()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Мин. часов в месяц
            </label>
            <input
              type="number"
              value={filters.minHours}
              onChange={(e) => setFilters({...filters, minHours: parseInt(e.target.value)})}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: colors.primary,
                color: '#ffffff'
              }}
            >
              Применить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Общая статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div 
            className="scale-in rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group"
            style={{ 
              background: colors.gradient.purple,
              boxShadow: 'rgba(99, 102, 241, 0.25) 0px 10px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px'
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 bg-white transform translate-x-8 -translate-y-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-medium opacity-90 mb-1">Всего часов</p>
                <p className="text-white text-3xl font-bold tracking-tight">{stats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div 
            className="scale-in rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group"
            style={{ 
              background: colors.gradient.green,
              boxShadow: 'rgba(16, 185, 129, 0.25) 0px 10px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px'
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 bg-white transform translate-x-8 -translate-y-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-medium opacity-90 mb-1">Всего заработано</p>
                <p className="text-white text-3xl font-bold tracking-tight">{formatCurrency(stats.totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div 
            className="scale-in rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group"
            style={{ 
              background: colors.gradient.blue,
              boxShadow: 'rgba(59, 130, 246, 0.25) 0px 10px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px'
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 bg-white transform translate-x-8 -translate-y-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-medium opacity-90 mb-1">Средние часы/месяц</p>
                <p className="text-white text-3xl font-bold tracking-tight">{stats.avgHoursPerMonth.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div 
            className="scale-in rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group"
            style={{ 
              background: colors.gradient.pink,
              boxShadow: 'rgba(236, 72, 153, 0.25) 0px 10px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px'
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 bg-white transform translate-x-8 -translate-y-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                  <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-medium opacity-90 mb-1">Всего задач</p>
                <p className="text-white text-3xl font-bold tracking-tight">{stats.totalTasks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData && (
          <div
            className="scale-in rounded-xl p-6 transition-all duration-300"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center mb-4">
              <ChartBarIcon className="w-5 h-5 mr-3" style={{ color: colors.primary }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Часы и заработок по месяцам
              </h3>
            </div>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        {lineData && (
          <div
            className="scale-in rounded-xl p-6 transition-all duration-300"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center mb-4">
              <PresentationChartLineIcon className="w-5 h-5 mr-3" style={{ color: colors.secondary }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Динамика средних часов в день
              </h3>
            </div>
            <Line data={lineData} options={lineChartOptions} />
          </div>
        )}
      </div>

      {/* Детальная таблица по месяцам */}
      {processedData && processedData.length > 0 && (
        <div
          className="scale-in rounded-xl p-6 transition-all duration-300"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📊 Детальная статистика по месяцам
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Месяц</th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Часы</th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Заработок</th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Задач</th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Дней работы</th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Ср. ч/день</th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-primary)' }}>Топ задача</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((monthData, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {monthData.monthName}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {monthData.totalHours.toFixed(1)}ч
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(monthData.earnings.net)}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {monthData.tasksCount}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {monthData.daysWorked}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {monthData.avgHoursPerDay.toFixed(1)}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {monthData.topTasks[0]?.name.substring(0, 30) || '-'}
                      {monthData.topTasks[0]?.name.length > 30 ? '...' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTimeAnalytics;
