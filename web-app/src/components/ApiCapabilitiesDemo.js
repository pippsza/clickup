import React, { useState, useEffect } from "react";
import clickupExtendedService from "../services/clickupExtendedService";
import {
  FolderIcon,
  TagIcon,
  ClockIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const ApiCapabilitiesDemo = () => {
  const [workspace, setWorkspace] = useState(null);
  const [capabilities, setCapabilities] = useState({
    timeTracking: null,
    members: [],
    goals: [],
    spaces: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadCapabilities();
  }, []);

  const loadCapabilities = async () => {
    setLoading(true);
    try {
      // Получаем базовую информацию
      const teams = await clickupExtendedService.getWorkspaces();

      if (teams.length > 0) {
        const teamId = teams[0].id;
        setWorkspace(teams[0]);

        // Загружаем дополнительные данные
        const [members, goals, spaces, currentTracking] = await Promise.all([
          clickupExtendedService.getWorkspaceMembers(teamId).catch(() => []),
          clickupExtendedService.getGoals(teamId).catch(() => []),
          clickupExtendedService.getSpaces(teamId).catch(() => []),
          clickupExtendedService
            .getCurrentTimeTracking(teamId)
            .catch(() => null),
        ]);

        setCapabilities({
          timeTracking: currentTracking,
          members,
          goals,
          spaces,
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки возможностей:", error);
    } finally {
      setLoading(false);
    }
  };

  const demoFunctions = [
    {
      title: "Управление задачами",
      icon: CheckIcon,
      description:
        "Создание, обновление, удаление задач с полным набором параметров",
      features: [
        "CRUD операции",
        "Подзадачи и зависимости",
        "Пользовательские поля",
        "Автоматизация",
      ],
    },
    {
      title: "Учет времени",
      icon: ClockIcon,
      description: "Продвинутое отслеживание времени и аналитика",
      features: [
        "Автоматический таймер",
        "Ручные записи",
        "Детальная аналитика",
        "Billable/Non-billable",
      ],
    },
    {
      title: "Структура проектов",
      icon: FolderIcon,
      description: "Полное управление иерархией workspace",
      features: [
        "Spaces и Folders",
        "Настройка прав доступа",
        "Шаблоны проектов",
        "Массовые операции",
      ],
    },
    {
      title: "Командная работа",
      icon: UsersIcon,
      description: "Управление участниками и коммуникацией",
      features: [
        "Приглашение участников",
        "Роли и права",
        "Комментарии и упоминания",
        "Уведомления",
      ],
    },
    {
      title: "Теги и категории",
      icon: TagIcon,
      description: "Система тегов для организации работы",
      features: [
        "Цветовая кодировка",
        "Фильтрация по тегам",
        "Автоматическое тегирование",
        "Иерархия категорий",
      ],
    },
    {
      title: "Интеграции",
      icon: ChatBubbleLeftIcon,
      description: "Webhooks и автоматизация",
      features: [
        "Webhook события",
        "Внешние интеграции",
        "Автоматические действия",
        "API для мобильных",
      ],
    },
  ];

  const tabs = [
    { id: "overview", name: "Обзор", icon: FolderIcon },
    { id: "analytics", name: "Аналитика", icon: ClockIcon },
    { id: "automation", name: "Автоматизация", icon: CheckIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Возможности ClickUp API
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Ваш токен предоставляет доступ к мощному API с множеством функций для
          автоматизации и интеграции
        </p>

        {workspace && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Подключен к: {workspace.name}
            </h3>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 dark:text-blue-400">
                  Участники:
                </span>
                <span className="ml-2 font-medium">
                  {capabilities.members.length}
                </span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400">
                  Пространства:
                </span>
                <span className="ml-2 font-medium">
                  {capabilities.spaces.length}
                </span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400">Цели:</span>
                <span className="ml-2 font-medium">
                  {capabilities.goals.length}
                </span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400">Время:</span>
                <span className="ml-2 font-medium">
                  {capabilities.timeTracking ? "Активно" : "Остановлено"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoFunctions.map((func, index) => {
                const Icon = func.icon;
                return (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {func.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          {func.description}
                        </p>
                        <ul className="space-y-1">
                          {func.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                            >
                              <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">
                    Отчеты по времени
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Детальная аналитика времени по пользователям, проектам и
                    задачам
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Продуктивность</h3>
                  <p className="text-green-100 text-sm">
                    Метрики производительности команды и трендовый анализ
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Дашборды</h3>
                  <p className="text-purple-100 text-sm">
                    Кастомные виджеты и автоматические отчеты
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Примеры аналитических возможностей
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Временная аналитика:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Время по пользователям и проектам</li>
                      <li>• Распределение по часам дня</li>
                      <li>• Тренды и сезонность</li>
                      <li>• Billable vs Non-billable время</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Проектная аналитика:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Прогресс по целям и задачам</li>
                      <li>• Загрузка участников</li>
                      <li>• Анализ бутылочных горлышек</li>
                      <li>• Прогнозирование сроков</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "automation" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Webhook интеграции
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-4">
                  Автоматические уведомления о событиях в ClickUp
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    taskCreated
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    taskUpdated
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    taskDeleted
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    commentPosted
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Автоматизация задач
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      Автоматическое создание подзадач
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      Назначение исполнителей по правилам
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      Изменение статусов по зависимостям
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      Автоматическое тегирование
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Интеграции
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      Slack уведомления
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      Email автоматизация
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      CRM синхронизация
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      Календарь интеграция
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">
          Готовы расширить функциональность?
        </h3>
        <p className="text-blue-100 mb-4">
          Мы можем добавить любую из этих функций в ваше приложение. Выберите
          что нужно, и мы интегрируем это прямо сейчас!
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            Webhooks
          </span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            Автоматизация
          </span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            Расширенная аналитика
          </span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            Управление проектами
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApiCapabilitiesDemo;
