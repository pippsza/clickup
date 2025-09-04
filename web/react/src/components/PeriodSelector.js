import React from "react";

const PeriodSelector = ({ selectedPeriod, onPeriodChange, onLoadReport }) => {
  const months = [
    { value: 1, label: "Январь" },
    { value: 2, label: "Февраль" },
    { value: 3, label: "Март" },
    { value: 4, label: "Апрель" },
    { value: 5, label: "Май" },
    { value: 6, label: "Июнь" },
    { value: 7, label: "Июль" },
    { value: 8, label: "Август" },
    { value: 9, label: "Сентябрь" },
    { value: 10, label: "Октябрь" },
    { value: 11, label: "Ноябрь" },
    { value: 12, label: "Декабрь" },
  ];

  const years = [2023, 2024, 2025];

  const reportTypes = [
    { value: "tasks", label: "По задачам" },
    { value: "daily", label: "По дням" },
    { value: "both", label: "Комбинированный" },
  ];

  const handleChange = (field, value) => {
    onPeriodChange({
      ...selectedPeriod,
      [field]: field === "month" || field === "year" ? parseInt(value) : value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Месяц
          </label>
          <select
            value={selectedPeriod.month}
            onChange={(e) => handleChange("month", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Год
          </label>
          <select
            value={selectedPeriod.year}
            onChange={(e) => handleChange("year", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Тип отчета
          </label>
          <select
            value={selectedPeriod.reportType}
            onChange={(e) => handleChange("reportType", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1"></div>

        <button
          onClick={onLoadReport}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <i className="fas fa-download mr-2"></i>
          Загрузить отчет
        </button>
      </div>
    </div>
  );
};

export default PeriodSelector;
