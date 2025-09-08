import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { useSettings } from "../hooks/useSettings";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { ChartBarIcon, ChartPieIcon } from "@heroicons/react/24/outline";

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
  const { calculateEarnings } = useSettings();

  if (!data || !data.days || !data.tasks) return null;

  // Расчет средних значений
  const totalDays = data.days.length;
  const totalHours = data.days.reduce((sum, day) => sum + (day.totalTime / (1000 * 60 * 60)), 0);
  const totalEarnings = data.days.reduce((sum, day) => sum + calculateEarnings(day.totalTime).net, 0);
  const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;
  const avgEarningsPerDay = totalDays > 0 ? totalEarnings / totalDays : 0;

  // Функция для копирования списка задач
  const copyTasksList = async () => {
    const tasksList = data.tasks.map(task => task.name).join(', ');
    try {
      await navigator.clipboard.writeText(tasksList);
      alert('Список задач скопирован в буфер обмена!');
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = tasksList;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Список задач скопирован в буфер обмена!');
    }
  };

  const colors = {
    gradients: [
      "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
      "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
      "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    ],
    solid: {
      purple: "#6366f1",
      pink: "#ec4899",
      blue: "#3b82f6",
      green: "#10b981",
      coral: "#f56565",
      mint: "#22c55e",
      violet: "#8b5cf6",
      amber: "#fbbf24",
    },
    primary: "#667eea",
    emerald: "#43e97b",
    amber: "#fee140",
    rose: "#f5576c",
    purple: "#764ba2",
    cyan: "#00f2fe",
  };

  // Данные для графика по дням
  const dayChartData = {
    labels: data.days.map((day) => {
      const date = new Date(day.date);
      return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Часы в день",
        data: data.days.map((day) => day.totalTime / (1000 * 60 * 60)),
        backgroundColor: data.days.map(
          (_, index) => colors.solid.purple + "80"
        ),
        borderColor: data.days.map((_, index) => colors.solid.purple),
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        tension: 0.4,
        pointBackgroundColor: colors.solid.purple,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: colors.solid.pink,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
      },
      {
        label: "Заработок ($)",
        data: data.days.map((day) => calculateEarnings(day.totalTime).net),
        backgroundColor: data.days.map(
          (_, index) => colors.solid.green + "80"
        ),
        borderColor: data.days.map((_, index) => colors.solid.green),
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        tension: 0.4,
        pointBackgroundColor: colors.solid.green,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: colors.solid.green,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
        yAxisID: 'y1',
      },
    ],
  };

  // Данные для круговой диаграммы по задачам
  const taskChartData = {
    labels: data.tasks
      .slice(0, 8)
      .map((task) => task.name.substring(0, 25) + "..."),
    datasets: [
      {
        data: data.tasks
          .slice(0, 8)
          .map((task) => task.totalTime / (1000 * 60 * 60)),
        backgroundColor: [
          colors.solid.purple,
          colors.solid.pink,
          colors.solid.blue,
          colors.solid.green,
          colors.solid.coral,
          colors.solid.mint,
          colors.solid.violet,
          colors.solid.amber,
        ],
        borderColor: "#ffffff",
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
        position: "top",
        labels: {
          color: darkMode ? "#ffffff" : "#374151",
          font: {
            size: 12,
            weight: "500",
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
        titleColor: darkMode ? "#ffffff" : "#374151",
        bodyColor: darkMode ? "#ffffff" : "#374151",
        borderColor: darkMode ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: darkMode ? "#374151" : "#e5e7eb",
          drawBorder: false,
        },
        ticks: {
          color: darkMode ? "#ffffff" : "#374151",
          font: {
            size: 11,
          },
          callback: function(value) {
            return value.toFixed(1) + ' ч';
          }
        },
        title: {
          display: true,
          text: 'Часы',
          color: darkMode ? "#ffffff" : "#374151",
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: darkMode ? "#ffffff" : "#374151",
          font: {
            size: 11,
          },
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        },
        title: {
          display: true,
          text: 'Заработок ($)',
          color: darkMode ? "#ffffff" : "#374151",
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? "#9ca3af" : "#6b7280",
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: darkMode ? "#ffffff" : "#374151",
          font: {
            size: 12,
            weight: "500",
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
        titleColor: darkMode ? "#ffffff" : "#374151",
        bodyColor: darkMode ? "#ffffff" : "#374151",
        borderColor: darkMode ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div
        className="scale-in rounded-xl p-6 transition-all duration-300"
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center mb-4">
          <div
            className="p-2 rounded-lg mr-3"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <ChartBarIcon
              className="w-5 h-5"
              style={{ color: colors.primary }}
            />
          </div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Время и заработок по дням
          </h3>
        </div>
        <Bar data={dayChartData} options={chartOptions} />
        
        {/* Средние значения */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="text-2xl font-bold" style={{ color: colors.solid.purple }}>
                {avgHoursPerDay.toFixed(1)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Среднее часов/день
              </div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="text-2xl font-bold" style={{ color: colors.solid.green }}>
                ${avgEarningsPerDay.toFixed(0)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Средний заработок/день
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="scale-in rounded-xl p-6 transition-all duration-300"
        style={{
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center mb-4">
          <div
            className="p-2 rounded-lg mr-3"
            style={{ backgroundColor: colors.emerald + "20" }}
          >
            <ChartPieIcon
              className="w-5 h-5"
              style={{ color: colors.emerald }}
            />
          </div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Время по задачам
          </h3>
        </div>
        <Doughnut data={taskChartData} options={doughnutOptions} />
      </div>
      </div>

      {/* Список всех задач */}
      <div 
        className="scale-in rounded-xl p-6 transition-all duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          📋 Все задачи за период ({data.tasks.length})
        </h3>
        <button
          onClick={copyTasksList}
          className="px-3 py-1 text-xs rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)'
          }}
          title="Скопировать список задач"
        >
          📋 Копировать
        </button>
      </div>
      <div 
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {data.tasks.map((task, index) => (
          <span key={task.id || index}>
            <span 
              className="hover:underline cursor-default"
              style={{ color: 'var(--text-primary)' }}
              title={`${(task.totalTime / (1000 * 60 * 60)).toFixed(2)} часов`}
            >
              {task.name}
            </span>
            {index < data.tasks.length - 1 && ', '}
          </span>
        ))}
      </div>
      <div 
        className="mt-3 text-xs"
        style={{ color: 'var(--text-secondary)' }}
      >
        💡 Наведите на задачу, чтобы увидеть количество часов
      </div>
    </div>
    </>
  );
};

export default ChartsSection;
