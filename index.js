require('dotenv').config();
const axios = require('axios');
const moment = require('moment');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const UserPreferences = require('./user-preferences');

class ClickUpTimeTracker {
    constructor() {
        this.token = process.env.CLICKUP_TOKEN;
        this.teamId = process.env.TEAM_ID;
        this.baseURL = 'https://api.clickup.com/api/v2';
        this.userPrefs = new UserPreferences();
        
        if (!this.token) {
            throw new Error('CLICKUP_TOKEN не найден в .env файле');
        }
        
        this.headers = {
            'Authorization': this.token,
            'Content-Type': 'application/json'
        };
        
        // Создаем папку для отчетов
        this.reportsDir = path.join(__dirname, 'reports');
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir);
        }
    }

    async getUserInfo() {
        try {
            const response = await axios.get(`${this.baseURL}/user`, {
                headers: this.headers
            });
            return response.data.user;
        } catch (error) {
            console.error('Ошибка получения информации о пользователе:', error.response?.data || error.message);
            throw error;
        }
    }

    async getTeams() {
        try {
            const response = await axios.get(`${this.baseURL}/team`, {
                headers: this.headers
            });
            return response.data.teams;
        } catch (error) {
            console.error('Ошибка получения команд:', error.response?.data || error.message);
            throw error;
        }
    }

    async getTimeEntries(userId, startDate, endDate) {
        try {
            const params = {
                start_date: startDate,
                end_date: endDate,
                assignee: userId
            };

            let url = `${this.baseURL}/team/${this.teamId}/time_entries`;
            if (!this.teamId) {
                // Если team_id не указан, пробуем получить все команды
                const teams = await this.getTeams();
                if (teams.length > 0) {
                    this.teamId = teams[0].id;
                    url = `${this.baseURL}/team/${this.teamId}/time_entries`;
                    console.log(`Используется команда: ${teams[0].name} (ID: ${this.teamId})`.yellow);
                } else {
                    throw new Error('Не найдено ни одной команды');
                }
            }

            const response = await axios.get(url, {
                headers: this.headers,
                params
            });

            return response.data.data || [];
        } catch (error) {
            console.error('Ошибка получения записей времени:', error.response?.data || error.message);
            throw error;
        }
    }

    async getTaskDetails(taskId) {
        try {
            const response = await axios.get(`${this.baseURL}/task/${taskId}`, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            console.error(`Ошибка получения деталей задачи ${taskId}:`, error.response?.data || error.message);
            return null;
        }
    }

    formatDuration(milliseconds) {
        return this.userPrefs.formatTime(milliseconds);
    }

    // Группировка записей времени по дням
    groupTimeEntriesByDay(timeEntries) {
        const dayGroups = {};
        
        for (const entry of timeEntries) {
            const dayKey = moment(parseInt(entry.start)).format('YYYY-MM-DD');
            
            if (!dayGroups[dayKey]) {
                dayGroups[dayKey] = {
                    date: dayKey,
                    entries: [],
                    totalTime: 0,
                    tasks: new Set()
                };
            }
            
            dayGroups[dayKey].entries.push(entry);
            dayGroups[dayKey].totalTime += parseInt(entry.duration);
            dayGroups[dayKey].tasks.add(entry.task?.name || 'Неизвестная задача');
        }
        
        // Конвертируем Set в Array для JSON
        Object.values(dayGroups).forEach(day => {
            day.tasks = Array.from(day.tasks);
        });
        
        return dayGroups;
    }

    // Расчет статистики
    calculateStatistics(timeEntries, totalTime) {
        const stats = {
            totalEntries: timeEntries.length,
            totalTime: totalTime,
            cost: this.userPrefs.calculateCost(totalTime),
            avgSessionTime: timeEntries.length > 0 ? totalTime / timeEntries.length : 0,
            workingDays: 0,
            weekdayTime: 0,
            weekendTime: 0
        };

        const workingDays = new Set();
        
        for (const entry of timeEntries) {
            const entryMoment = moment(parseInt(entry.start));
            const dayKey = entryMoment.format('YYYY-MM-DD');
            workingDays.add(dayKey);
            
            if (entryMoment.day() === 0 || entryMoment.day() === 6) {
                stats.weekendTime += parseInt(entry.duration);
            } else {
                stats.weekdayTime += parseInt(entry.duration);
            }
        }
        
        stats.workingDays = workingDays.size;
        stats.avgDayTime = stats.workingDays > 0 ? totalTime / stats.workingDays : 0;
        
        return stats;
    }

    async generateMonthlyReport(year, month, options = {}) {
        try {
            console.log(`Генерация отчета за ${month}/${year}...`.blue);

            const user = await this.getUserInfo();
            console.log(`Пользователь: ${user.username} (${user.email})`.green);

            // Определяем начало и конец месяца
            const startOfMonth = moment().year(year).month(month - 1).startOf('month');
            const endOfMonth = moment().year(year).month(month - 1).endOf('month');

            console.log(`Период: ${startOfMonth.format('DD.MM.YYYY')} - ${endOfMonth.format('DD.MM.YYYY')}`.cyan);

            // Получаем записи времени
            const timeEntries = await this.getTimeEntries(
                user.id,
                startOfMonth.valueOf(),
                endOfMonth.valueOf()
            );

            if (timeEntries.length === 0) {
                console.log('Не найдено записей времени за указанный период'.yellow);
                return;
            }

            console.log(`Найдено ${timeEntries.length} записей времени`.green);

            // Группируем по задачам
            const taskGroups = {};
            let totalTime = 0;

            for (const entry of timeEntries) {
                const taskId = entry.task?.id;
                if (!taskId) continue;

                if (!taskGroups[taskId]) {
                    taskGroups[taskId] = {
                        task: entry.task,
                        entries: [],
                        totalTime: 0
                    };
                }

                taskGroups[taskId].entries.push(entry);
                taskGroups[taskId].totalTime += parseInt(entry.duration);
                totalTime += parseInt(entry.duration);
            }

            // Группировка по дням если нужно
            const dayGroups = this.groupTimeEntriesByDay(timeEntries);
            
            // Расчет статистики
            const statistics = this.calculateStatistics(timeEntries, totalTime);

            // Генерируем отчет
            const report = {
                user: {
                    username: user.username,
                    email: user.email
                },
                period: {
                    start: startOfMonth.format('DD.MM.YYYY'),
                    end: endOfMonth.format('DD.MM.YYYY'),
                    month: month,
                    year: year
                },
                summary: {
                    totalTasks: Object.keys(taskGroups).length,
                    totalTime: totalTime,
                    totalTimeFormatted: this.formatDuration(totalTime),
                    cost: statistics.cost
                },
                statistics: statistics,
                preferences: this.userPrefs.getAll(),
                tasks: [],
                days: Object.values(dayGroups).sort((a, b) => a.date.localeCompare(b.date))
            };

            // Сортируем задачи по времени (по убыванию)
            const sortedTasks = Object.values(taskGroups).sort((a, b) => {
                const sortBy = options.sortBy || this.userPrefs.get('sortBy');
                switch (sortBy) {
                    case 'time_asc': return a.totalTime - b.totalTime;
                    case 'name_asc': return a.task.name.localeCompare(b.task.name);
                    case 'name_desc': return b.task.name.localeCompare(a.task.name);
                    case 'cost_desc': 
                        const aCost = this.userPrefs.calculateCost(a.totalTime);
                        const bCost = this.userPrefs.calculateCost(b.totalTime);
                        return bCost.grossCost - aCost.grossCost;
                    case 'time_desc':
                    default: 
                        return b.totalTime - a.totalTime;
                }
            });

            for (const taskGroup of sortedTasks) {
                const task = taskGroup.task;
                const taskCost = this.userPrefs.calculateCost(taskGroup.totalTime);
                
                report.tasks.push({
                    id: task.id,
                    name: task.name,
                    url: task.url,
                    status: task.status?.status || 'Не указан',
                    list: task.list?.name || 'Не указан',
                    folder: task.folder?.name || 'Не указана',
                    space: task.space?.name || 'Не указано',
                    totalTime: taskGroup.totalTime,
                    totalTimeFormatted: this.formatDuration(taskGroup.totalTime),
                    cost: taskCost,
                    entriesCount: taskGroup.entries.length,
                    entries: taskGroup.entries.map(entry => ({
                        id: entry.id,
                        description: entry.description || 'Без описания',
                        duration: parseInt(entry.duration),
                        durationFormatted: this.formatDuration(parseInt(entry.duration)),
                        cost: this.userPrefs.calculateCost(parseInt(entry.duration)),
                        start: moment(parseInt(entry.start)).format('DD.MM.YYYY HH:mm'),
                        end: entry.end ? moment(parseInt(entry.end)).format('DD.MM.YYYY HH:mm') : 'В процессе'
                    }))
                });
            }

            // Обогащаем дни стоимостью
            report.days.forEach(day => {
                day.cost = this.userPrefs.calculateCost(day.totalTime);
                day.totalTimeFormatted = this.formatDuration(day.totalTime);
                day.dayOfWeek = moment(day.date).format('dddd');
                day.isWeekend = moment(day.date).day() === 0 || moment(day.date).day() === 6;
            });

            // Выводим отчет в консоль
            this.printReport(report, options);

            // Сохраняем отчет в файл
            await this.saveReport(report);

            return report;

        } catch (error) {
            console.error('Ошибка генерации отчета:', error.message);
            throw error;
        }
    }

    printReport(report, options = {}) {
        const showTasks = options.showTasks !== undefined ? options.showTasks : this.userPrefs.get('showTasks');
        const showDays = options.showDays !== undefined ? options.showDays : this.userPrefs.get('showDays');
        const showTimeEntries = options.showTimeEntries !== undefined ? options.showTimeEntries : this.userPrefs.get('showTimeEntries');
        const showCost = options.showCost !== undefined ? options.showCost : this.userPrefs.get('showCost');
        const showStatistics = options.showStatistics !== undefined ? options.showStatistics : this.userPrefs.get('showStatistics');

        console.log('\n' + '='.repeat(80).rainbow);
        console.log(`📊 ОТЧЕТ ПО ВРЕМЕНИ ЗА ${report.period.month}/${report.period.year}`.bold.white);
        console.log('='.repeat(80).rainbow);
        
        console.log(`👤 Пользователь: ${report.user.username} (${report.user.email})`.cyan);
        console.log(`📅 Период: ${report.period.start} - ${report.period.end}`.cyan);
        console.log(`⏱️  Общее время: ${report.summary.totalTimeFormatted}`.green.bold);
        
        if (showCost && report.summary.cost) {
            console.log(`� Стоимость: ${this.userPrefs.formatCost(report.summary.cost.grossCost)} (брутто)`.green.bold);
            console.log(`💸 К получению: ${this.userPrefs.formatCost(report.summary.cost.netCost)} (после налогов)`.green);
        }
        
        console.log(`�📋 Количество задач: ${report.summary.totalTasks}`.yellow);

        if (showStatistics && report.statistics) {
            const stats = report.statistics;
            console.log('\n' + '📈 СТАТИСТИКА:'.bold.white);
            console.log('-'.repeat(40).gray);
            console.log(`📊 Всего записей: ${stats.totalEntries}`.blue);
            console.log(`� Рабочих дней: ${stats.workingDays}`.blue);
            console.log(`⏱️  Среднее время в день: ${this.formatDuration(stats.avgDayTime)}`.blue);
            console.log(`⌚ Среднее время на сессию: ${this.formatDuration(stats.avgSessionTime)}`.blue);
            console.log(`🏢 Время в будни: ${this.formatDuration(stats.weekdayTime)}`.blue);
            console.log(`🏖️  Время в выходные: ${this.formatDuration(stats.weekendTime)}`.blue);
        }

        if (showDays) {
            console.log('\n' + '📅 РАБОТА ПО ДНЯМ:'.bold.white);
            console.log('-'.repeat(80).gray);

            for (const day of report.days) {
                const dayDisplay = moment(day.date).format('DD.MM.YYYY (dddd)');
                const weekendFlag = day.isWeekend ? '🏖️' : '🏢';
                
                console.log(`\n${weekendFlag} ${dayDisplay}`.bold.white);
                console.log(`   Время: ${day.totalTimeFormatted}`.green);
                
                if (showCost && day.cost) {
                    console.log(`   Стоимость: ${this.userPrefs.formatCost(day.cost.grossCost)}`.green);
                }
                
                console.log(`   Задач: ${day.tasks.length} (${day.tasks.join(', ')})`.blue);
            }
        }

        if (showTasks) {
            console.log('\n' + '�📝 ДЕТАЛИЗАЦИЯ ПО ЗАДАЧАМ:'.bold.white);
            console.log('-'.repeat(80).gray);

            for (let i = 0; i < report.tasks.length; i++) {
                const task = report.tasks[i];
                console.log(`\n${(i + 1)}. ${task.name}`.bold.white);
                console.log(`   ID: ${task.id}`.gray);
                console.log(`   Статус: ${task.status}`.blue);
                console.log(`   Список: ${task.list}`.blue);
                console.log(`   Время: ${task.totalTimeFormatted}`.green.bold);
                
                if (showCost && task.cost) {
                    console.log(`   Стоимость: ${this.userPrefs.formatCost(task.cost.grossCost)} (${this.userPrefs.formatCost(task.cost.netCost)} чистыми)`.green);
                }
                
                console.log(`   Записей: ${task.entriesCount}`.yellow);
                console.log(`   URL: ${task.url}`.gray);
                
                if (showTimeEntries && task.entries.length > 0) {
                    console.log(`   Записи времени:`.white);
                    task.entries.forEach((entry, idx) => {
                        let entryLine = `     ${idx + 1}. ${entry.durationFormatted} - ${entry.description}`.gray;
                        if (showCost && entry.cost) {
                            entryLine += ` (${this.userPrefs.formatCost(entry.cost.grossCost)})`.green;
                        }
                        console.log(entryLine);
                        console.log(`        ${entry.start} - ${entry.end}`.gray);
                    });
                }
            }
        }
        
        console.log('\n' + '='.repeat(80).rainbow);
    }

    async saveReport(report) {
        const fileName = `report_${report.period.year}_${report.period.month.toString().padStart(2, '0')}.json`;
        const filePath = path.join(this.reportsDir, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`💾 Отчет сохранен в файл: ${filePath}`.green);

        // Также создаем CSV версию
        await this.saveReportAsCSV(report);
    }

    async saveReportAsCSV(report) {
        const csvFileName = `report_${report.period.year}_${report.period.month.toString().padStart(2, '0')}.csv`;
        const csvFilePath = path.join(this.reportsDir, csvFileName);
        
        const showCost = this.userPrefs.get('showCost');
        
        let csvContent = 'Задача,ID,Статус,Список,Время (часы),Время (форматированное),Количество записей,URL';
        if (showCost) {
            csvContent += ',Стоимость (брутто),Стоимость (нетто),Валюта';
        }
        csvContent += '\n';
        
        for (const task of report.tasks) {
            const timeInHours = (task.totalTime / (1000 * 60 * 60)).toFixed(2);
            let row = `"${task.name}","${task.id}","${task.status}","${task.list}","${timeInHours}","${task.totalTimeFormatted}","${task.entriesCount}","${task.url}"`;
            
            if (showCost && task.cost) {
                row += `,"${task.cost.grossCost.toFixed(2)}","${task.cost.netCost.toFixed(2)}","${task.cost.currency}"`;
            }
            
            csvContent += row + '\n';
        }
        
        fs.writeFileSync(csvFilePath, csvContent, 'utf8');
        console.log(`📊 CSV отчет сохранен в файл: ${csvFilePath}`.green);

        // Также создаем CSV отчет по дням если включено
        if (this.userPrefs.get('showDays')) {
            await this.saveDailyReportAsCSV(report);
        }
    }

    async saveDailyReportAsCSV(report) {
        const csvFileName = `daily_report_${report.period.year}_${report.period.month.toString().padStart(2, '0')}.csv`;
        const csvFilePath = path.join(this.reportsDir, csvFileName);
        
        const showCost = this.userPrefs.get('showCost');
        
        let csvContent = 'Дата,День недели,Время (часы),Время (форматированное),Количество задач,Задачи';
        if (showCost) {
            csvContent += ',Стоимость (брутто),Стоимость (нетто),Валюта';
        }
        csvContent += '\n';
        
        for (const day of report.days) {
            const timeInHours = (day.totalTime / (1000 * 60 * 60)).toFixed(2);
            const tasks = day.tasks.join('; ');
            let row = `"${day.date}","${day.dayOfWeek}","${timeInHours}","${day.totalTimeFormatted}","${day.tasks.length}","${tasks}"`;
            
            if (showCost && day.cost) {
                row += `,"${day.cost.grossCost.toFixed(2)}","${day.cost.netCost.toFixed(2)}","${day.cost.currency}"`;
            }
            
            csvContent += row + '\n';
        }
        
        fs.writeFileSync(csvFilePath, csvContent, 'utf8');
        console.log(`� CSV отчет по дням сохранен в файл: ${csvFilePath}`.green);
    }

    async generateCurrentMonthReport() {
        const now = moment();
        return await this.generateMonthlyReport(now.year(), now.month() + 1);
    }

    async generatePreviousMonthReport() {
        const lastMonth = moment().subtract(1, 'month');
        return await this.generateMonthlyReport(lastMonth.year(), lastMonth.month() + 1);
    }

    // Новый метод для генерации отчета по дням
    async generateDailyReport(year, month) {
        const options = {
            showTasks: false,
            showDays: true,
            showTimeEntries: false,
            showStatistics: true
        };
        return await this.generateMonthlyReport(year, month, options);
    }

    // Метод для получения настроек пользователя
    getUserPreferences() {
        return this.userPrefs;
    }

    // Обновление настроек
    updatePreferences(updates) {
        this.userPrefs.updateMultiple(updates);
    }
}

// Основная функция
async function main() {
    try {
        const tracker = new ClickUpTimeTracker();
        
        // Получаем параметры из командной строки
        const args = process.argv.slice(2);
        
        if (args.length === 0) {
            // По умолчанию генерируем отчет за текущий месяц
            console.log('Генерация отчета за текущий месяц...'.blue);
            await tracker.generateCurrentMonthReport();
        } else if (args[0] === 'prev') {
            // Отчет за предыдущий месяц
            console.log('Генерация отчета за предыдущий месяц...'.blue);
            await tracker.generatePreviousMonthReport();
        } else if (args[0] === 'daily') {
            // Отчет по дням
            if (args.length === 3) {
                const year = parseInt(args[1]);
                const month = parseInt(args[2]);
                await tracker.generateDailyReport(year, month);
            } else {
                const now = moment();
                await tracker.generateDailyReport(now.year(), now.month() + 1);
            }
        } else if (args[0] === 'config') {
            // Показать текущие настройки
            const prefs = tracker.getUserPreferences();
            console.log('📊 Текущие настройки:'.blue);
            console.log(JSON.stringify(prefs.getAll(), null, 2));
        } else if (args.length === 2) {
            // Отчет за конкретный месяц и год
            const year = parseInt(args[0]);
            const month = parseInt(args[1]);
            
            if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
                console.error('Неверный формат. Использование: node index.js [год] [месяц]'.red);
                process.exit(1);
            }
            
            await tracker.generateMonthlyReport(year, month);
        } else {
            console.log('Использование:'.yellow);
            console.log('  node index.js              - отчет за текущий месяц');
            console.log('  node index.js prev         - отчет за предыдущий месяц');
            console.log('  node index.js daily        - отчет по дням за текущий месяц');
            console.log('  node index.js daily 2024 3 - отчет по дням за март 2024');
            console.log('  node index.js 2024 3       - отчет за март 2024');
            console.log('  node index.js config       - показать текущие настройки');
        }
        
    } catch (error) {
        console.error('Ошибка:', error.message.red);
        process.exit(1);
    }
}

// Экспорт для использования в других модулях
module.exports = ClickUpTimeTracker;

// Запуск если файл выполняется напрямую
if (require.main === module) {
    main();
}
