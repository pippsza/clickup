import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { 
  ClipboardDocumentListIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const TasksTable = ({ data }) => {
  const { calculateEarnings, formatCurrency } = useSettings();
  const [expandedTask, setExpandedTask] = useState(null);

  if (!data || !data.tasks) return null;

  const formatTime = (milliseconds) => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}ч ${minutes}м`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'to do': { bg: '#6b728020', text: '#6b7280', border: '#6b7280' },
      'in progress': { bg: '#3b82f620', text: '#3b82f6', border: '#3b82f6' },
      'done': { bg: '#10b98120', text: '#10b981', border: '#10b981' },
      'testing': { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b' },
      'review': { bg: '#8b5cf620', text: '#8b5cf6', border: '#8b5cf6' }
    };
    return colors[status] || colors['to do'];
  };

  return (
    <div 
      className="scale-in rounded-xl overflow-hidden"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div 
        className="px-6 py-4 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center">
          <div 
            className="p-2 rounded-lg mr-3"
            style={{ backgroundColor: '#3b82f620' }}
          >
            <ClipboardDocumentListIcon 
              className="w-5 h-5" 
              style={{ color: '#3b82f6' }}
            />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Детализация по задачам
          </h3>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                Задача
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                Время
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                Стоимость
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                Записей
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}>
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {data.tasks.map((task, index) => {
              const earnings = calculateEarnings(task.totalTime);
              const isExpanded = expandedTask === task.id;
              const statusColor = getStatusColor(task.status);
              
              return (
                <React.Fragment key={task.id || index}>
                  <tr 
                    className="transition-colors duration-200 hover:bg-opacity-50"
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {task.name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {task.list}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full border"
                        style={{ 
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderColor: statusColor.border
                        }}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatTime(task.totalTime)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(earnings.net)}
                    </td>
                    <td className="px-6 py-4">
                      <div 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: '#3b82f620',
                          color: '#3b82f6'
                        }}
                      >
                        {task.entries?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {task.entries && task.entries.length > 0 && (
                        <button
                          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                          className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200"
                          style={{ 
                            backgroundColor: isExpanded ? '#10b98120' : '#3b82f620',
                            color: isExpanded ? '#10b981' : '#3b82f6'
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {isExpanded ? 'Скрыть' : 'Показать'}
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                  
                  {isExpanded && task.entries && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
                            <ClockIcon className="w-4 h-4" />
                            <span>Записи времени:</span>
                          </h4>
                          <div className="grid gap-3">
                            {task.entries.map((entry, entryIndex) => (
                              <div 
                                key={entryIndex} 
                                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{ 
                                  backgroundColor: 'var(--bg-primary)',
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {entry.description || 'Без описания'}
                                  </div>
                                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(parseInt(entry.start)).toLocaleString('ru-RU')}
                                  </div>
                                </div>
                                <div 
                                  className="text-sm font-medium px-3 py-1 rounded-full"
                                  style={{ 
                                    backgroundColor: '#10b98120',
                                    color: '#10b981'
                                  }}
                                >
                                  {formatTime(parseInt(entry.duration))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksTable;
