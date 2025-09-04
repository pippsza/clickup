import React from "react";
import { formatCurrency, formatTime } from "../utils/formatters";

const MetricsCards = ({ data, settings }) => {
  const calculateEarnings = (timeInMs) => {
    const hours = timeInMs / (1000 * 60 * 60);
    return hours * settings.hourlyRate;
  };

  const totalEarnings = calculateEarnings(data.summary?.totalTime || 0);
  const netEarnings = totalEarnings * (1 - settings.taxRate);

  const metrics = [
    {
      title: "Общее время",
      value: formatTime(data.summary?.totalTime || 0),
      icon: "fas fa-clock",
      color: "from-blue-500 to-purple-600",
    },
    {
      title: "Заработано",
      value: formatCurrency(totalEarnings, settings.currency),
      icon: "fas fa-dollar-sign",
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Задач",
      value: data.summary?.totalTasks || 0,
      icon: "fas fa-tasks",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Рабочих дней",
      value: data.statistics?.workingDays || 0,
      icon: "fas fa-calendar",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${metric.color} text-white rounded-lg p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium opacity-80">
                {metric.title}
              </p>
              <p className="text-3xl font-bold">{metric.value}</p>
              {metric.title === "Заработано" && (
                <p className="text-sm opacity-75">
                  Чистыми: {formatCurrency(netEarnings, settings.currency)}
                </p>
              )}
            </div>
            <i className={`${metric.icon} text-4xl opacity-60`}></i>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
