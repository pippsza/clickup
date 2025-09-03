/**
 * Конфигурация ClickUp Time Tracker
 * 
 * Этот файл содержит настройки по умолчанию для скрипта.
 * Основные настройки лучше указывать в .env файле.
 */

module.exports = {
    // Настройки API
    api: {
        baseURL: 'https://api.clickup.com/api/v2',
        timeout: 30000, // 30 секунд
        retries: 3      // количество повторных попыток при ошибке
    },

    // Финансовые настройки
    billing: {
        hourlyRate: 25,         // почасовая ставка в долларах/рублях
        currency: 'USD',        // валюта: USD, RUB, EUR
        taxRate: 0.2,           // налоговая ставка (20%)
        showCost: true,         // показывать стоимость в отчетах
        roundToMinutes: 15      // округлять время до минут (15, 30, 60)
    },

    // Настройки отчетов
    reports: {
        directory: 'reports',
        formats: ['json', 'csv'],
        includeTaskDetails: true,
        includeTimeEntries: true,
        sortBy: 'time_desc', // time_desc, time_asc, name_asc, name_desc, cost_desc
        showTimeEntries: true,   // показывать отдельные записи времени
        showDailyBreakdown: false, // показывать разбивку по дням
        groupBy: 'tasks'         // tasks, days, projects
    },

    // Настройки вывода
    output: {
        colors: true,
        verbose: false,
        showProgress: true,
        showTimeEntries: true,      // показывать каждую запись времени
        showDays: false,            // показывать работу по дням
        showTasks: true,            // показывать задачи
        showCost: true,             // показывать стоимость
        showStatistics: true        // показывать статистику
    },

    // Фильтры времени (в миллисекундах)
    filters: {
        minDuration: 60000,      // минимум 1 минута
        maxDuration: 86400000,   // максимум 24 часа
        excludeWeekends: false,  // исключать выходные
        excludeHolidays: false   // исключать праздники
    },

    // Форматирование времени
    timeFormat: {
        displayFormat: 'hours_minutes', // hours_minutes, decimal_hours, minutes
        precision: 2,                   // знаков после запятой для decimal_hours
        locale: 'ru'                   // локаль для форматирования
    },

    // Настройки интерактивного режима
    interactive: {
        showAdvancedOptions: true,
        saveUserPreferences: true,
        preferencesFile: '.user-preferences.json'
    }
};
