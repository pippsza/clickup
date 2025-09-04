import React from "react";
import { useSettings } from "../hooks/useSettings";
import {
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const MetricsCards = ({ data }) => {
  const { calculateEarnings, formatCurrency } = useSettings();

  if (!data) return null;

  const earnings = calculateEarnings(data.summary.totalTime);

  const metrics = [
    {
      title: "Общее время",
      value: data.summary.totalTimeFormatted,
      icon: ClockIcon,
      colors: {
        bg: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        iconBg: "#6366f1",
        shadow: "rgba(99, 102, 241, 0.25)",
      },
    },
    {
      title: "Количество задач",
      value: data.summary.totalTasks,
      icon: CheckCircleIcon,
      colors: {
        bg: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
        iconBg: "#ec4899",
        shadow: "rgba(236, 72, 153, 0.25)",
      },
    },
    {
      title: "Рабочих дней",
      value: data.statistics.workingDays,
      icon: CalendarIcon,
      colors: {
        bg: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        iconBg: "#3b82f6",
        shadow: "rgba(59, 130, 246, 0.25)",
      },
    },
    {
      title: "Заработано",
      value: formatCurrency(earnings.net),
      icon: CurrencyDollarIcon,
      colors: {
        bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        iconBg: "#10b981",
        shadow: "rgba(16, 185, 129, 0.25)",
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div
            key={index}
            className="scale-in rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group"
            style={{
              background: metric.colors.bg,
              boxShadow: `0 10px 25px -5px ${metric.colors.shadow}, 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
            }}
          >
            {/* Декоративные элементы */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 bg-white transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-10 bg-white transform -translate-x-6 translate-y-6"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-xl shadow-lg"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="w-8 h-1 bg-white opacity-30 rounded-full mb-1"></div>
                  <div className="w-12 h-1 bg-white opacity-20 rounded-full"></div>
                </div>
              </div>

              <div>
                <p className="text-white text-sm font-medium opacity-90 mb-1">
                  {metric.title}
                </p>
                <p className="text-white text-3xl font-bold tracking-tight">
                  {metric.value}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                  <span className="text-white text-xs opacity-80">
                    За выбранный период
                  </span>
                </div>
                <div className="text-white opacity-60">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
