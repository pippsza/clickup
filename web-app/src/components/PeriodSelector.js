import React from 'react';

const PeriodSelector = ({ selectedPeriod, onPeriodChange, onLoadReport, loading }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Январь' },
    { value: 2, label: 'Февраль' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Август' },
    { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' },
    { value: 11, label: 'Ноябрь' },
    { value: 12, label: 'Декабрь' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Месяц
          </label>
          <select
            value={selectedPeriod.month}
            onChange={(e) => onPeriodChange({
              ...selectedPeriod,
              month: parseInt(e.target.value)
            })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Год
          </label>
          <select
            value={selectedPeriod.year}
            onChange={(e) => onPeriodChange({
              ...selectedPeriod,
              year: parseInt(e.target.value)
            })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex justify-end">
          <button
            onClick={onLoadReport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Загрузка...
              </>
            ) : (
              <>
                <i className="fas fa-download mr-2"></i>
                Загрузить отчет
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeriodSelector;
