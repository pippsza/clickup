import React, { useState } from "react";
import { formatCurrency, formatTime } from "../utils/formatters";

const TasksTable = ({ data, settings }) => {
  const [expandedTask, setExpandedTask] = useState(null);

  const calculateEarnings = (timeInMs) => {
    const hours = timeInMs / (1000 * 60 * 60);
    return hours * settings.hourlyRate;
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  if (!data.tasks || data.tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="fas fa-list mr-2 text-blue-600"></i>
          Детализация по задачам
        </h3>
        <p className="text-gray-500 text-center py-8">Нет данных по задачам</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        <i className="fas fa-list mr-2 text-blue-600"></i>
        Детализация по задачам
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Задача
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Время
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Стоимость
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Записей
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.tasks.map((task) => (
              <React.Fragment key={task.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.name}
                    </div>
                    <div className="text-sm text-gray-500">ID: {task.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        task.status === "done"
                          ? "bg-green-100 text-green-800"
                          : task.status === "testing"
                          ? "bg-yellow-100 text-yellow-800"
                          : task.status === "review"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(task.totalTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(
                      calculateEarnings(task.totalTime),
                      settings.currency
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.entriesCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => toggleTaskExpansion(task.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {expandedTask === task.id ? (
                        <i className="fas fa-chevron-up"></i>
                      ) : (
                        <i className="fas fa-chevron-down"></i>
                      )}
                    </button>
                    {task.url && (
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 text-blue-600 hover:text-blue-900"
                      >
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                  </td>
                </tr>

                {expandedTask === task.id && task.entries && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 bg-gray-50">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Записи времени:
                        </h4>
                        {task.entries.map((entry, index) => (
                          <div
                            key={entry.id || index}
                            className="flex justify-between items-center py-2 px-4 bg-white rounded border"
                          >
                            <div className="flex-1">
                              <div className="text-sm text-gray-900">
                                {entry.description || "Без описания"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {entry.start} - {entry.end}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {formatTime(entry.duration)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(
                                  calculateEarnings(entry.duration),
                                  settings.currency
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksTable;
