import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartsSection = ({ data }) => {
  const { darkMode } = useContext(ThemeContext);
  
  if (!data || !data.days || !data.tasks) return null;

  const colors = {
    gradients: [
      'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
      'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    ],
    solid: {
      purple: '#6366f1',
      pink: '#ec4899', 
      blue: '#3b82f6',
      green: '#10b981',
      coral: '#f56565',
      mint: '#22c55e',
      violet: '#8b5cf6',
      amber: '#fbbf24'
    },
    primary: '#667eea',
    emerald: '#43e97b',
    amber: '#fee140',
    rose: '#f5576c',
    purple: '#764ba2',
    cyan: '#00f2fe'
  };

  // Данные для графика по дням
  const dayChartData = {
    labels: data.days.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: 'Часы в день',
        data: data.days.map(day => day.totalTime / (1000 * 60 * 60)),
        backgroundColor: data.days.map((_, index) => colors.solid.purple + '80'),
        borderColor: data.days.map((_, index) => colors.solid.purple),
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        tension: 0.4,
        pointBackgroundColor: colors.solid.purple,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: colors.solid.pink,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  // Данные для круговой диаграммы по задачам
  const taskChartData = {
    labels: data.tasks.slice(0, 8).map(task => task.name.substring(0, 25) + '...'),
    datasets: [
      {
        data: data.tasks.slice(0, 8).map(task => task.totalTime / (1000 * 60 * 60)),
        backgroundColor: [
          colors.solid.purple,
          colors.solid.pink,
          colors.solid.blue,
          colors.solid.green,
          colors.solid.coral,
          colors.solid.mint,
          colors.solid.rose,
          colors.solid.peach,
        ],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverBorderWidth: 6,
        hoverOffset: 15,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#ffffff' : '#374151',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        titleColor: darkMode ? '#ffffff' : '#374151',
        bodyColor: darkMode ? '#ffffff' : '#374151',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          font: {
            size: 11
          }
        }
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: darkMode ? '#ffffff' : '#374151',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        titleColor: darkMode ? '#ffffff' : '#374151',
        bodyColor: darkMode ? '#ffffff' : '#374151',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div 
        className="scale-in rounded-xl p-6 transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-center mb-4">
          <div 
            className="p-2 rounded-lg mr-3"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <ChartBarIcon 
              className="w-5 h-5" 
              style={{ color: colors.primary }}
            />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Время по дням
          </h3>
        </div>
        <Bar data={dayChartData} options={chartOptions} />
      </div>

      <div 
        className="scale-in rounded-xl p-6 transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-center mb-4">
          <div 
            className="p-2 rounded-lg mr-3"
            style={{ backgroundColor: colors.emerald + '20' }}
          >
            <ChartPieIcon 
              className="w-5 h-5" 
              style={{ color: colors.emerald }}
            />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Время по задачам
          </h3>
        </div>
        <Doughnut data={taskChartData} options={doughnutOptions} />
      </div>
    </div>
  );
};

export default ChartsSection;
