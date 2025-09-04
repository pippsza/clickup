import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

const ChartsSection = ({ data, settings, reportType }) => {
  const calculateEarnings = (timeInMs) => {
    const hours = timeInMs / (1000 * 60 * 60);
    return hours * settings.hourlyRate;
  };

  // Данные для круговой диаграммы по задачам
  const tasksChartData = {
    labels:
      data.tasks
        ?.slice(0, 10)
        .map((task) =>
          task.name.length > 30 ? task.name.substring(0, 30) + "..." : task.name
        ) || [],
    datasets: [
      {
        data:
          data.tasks
            ?.slice(0, 10)
            .map((task) => task.totalTime / (1000 * 60 * 60)) || [],
        backgroundColor: [
          "#3B82F6",
          "#8B5CF6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#6366F1",
          "#EC4899",
          "#14B8A6",
          "#F97316",
          "#84CC16",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Данные для линейного графика по дням
  const dailyChartData = {
    labels:
      data.days?.map((day) => {
        const date = new Date(day.date);
        return date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        });
      }) || [],
    datasets: [
      {
        label: "Часы в день",
        data: data.days?.map((day) => day.totalTime / (1000 * 60 * 60)) || [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Данные для графика заработка
  const earningsChartData = {
    labels:
      data.days?.map((day) => {
        const date = new Date(day.date);
        return date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        });
      }) || [],
    datasets: [
      {
        label: `Заработок (${settings.currency})`,
        data: data.days?.map((day) => calculateEarnings(day.totalTime)) || [],
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        borderColor: "#8B5CF6",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Часы",
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: settings.currency,
        },
      },
    },
  };

  return (
    <div className="space-y-8 mb-8">
      {/* Основные графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* График по задачам */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <i className="fas fa-chart-pie mr-2 text-blue-600"></i>
            Время по задачам (топ 10)
          </h3>
          <div style={{ height: "300px" }}>
            <Pie data={tasksChartData} options={chartOptions} />
          </div>
        </div>

        {/* График по дням */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <i className="fas fa-chart-line mr-2 text-green-600"></i>
            Время по дням
          </h3>
          <div style={{ height: "300px" }}>
            <Line data={dailyChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* График заработка */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="fas fa-chart-bar mr-2 text-purple-600"></i>
          Заработок по дням
        </h3>
        <div style={{ height: "300px" }}>
          <Bar data={earningsChartData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
