/**
 * Демо версия ClickUp Time Tracker для тестирования
 * Использует моковые данные вместо реальных API запросов
 */

const moment = require('moment');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const UserPreferences = require('./user-preferences');

class ClickUpTimeTrackerDemo {
    constructor() {
        this.reportsDir = path.join(__dirname, 'reports');
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir);
        }
        // Создаем демо настройки
        this.userPrefs = new UserPreferences();
        this.userPrefs.set('hourlyRate', 30); // Демо ставка
        this.userPrefs.set('currency', 'USD');
        this.userPrefs.set('showCost', true);
    }

    // Генерируем моковые данные для демонстрации
    generateMockData(year, month) {
        const startOfMonth = moment().year(year).month(month - 1).startOf('month');
        const endOfMonth = moment().year(year).month(month - 1).endOf('month');

        const mockTasks = [
            {
                id: '123456',
                name: 'Разработка API для пользователей',
                status: 'В работе',
                list: 'Backend Development',
                folder: 'Web Project',
                space: 'Development',
                url: 'https://app.clickup.com/t/123456'
            },
            {
                id: '123457',
                name: 'Фикс багов в системе авторизации',
                status: 'На тестировании',
                list: 'Bug Fixes',
                folder: 'Web Project',
                space: 'Development',
                url: 'https://app.clickup.com/t/123457'
            },
            {
                id: '123458',
                name: 'Создание документации',
                status: 'Завершено',
                list: 'Documentation',
                folder: 'Admin Tasks',
                space: 'Management',
                url: 'https://app.clickup.com/t/123458'
            },
            {
                id: '123459',
                name: 'Оптимизация базы данных',
                status: 'В работе',
                list: 'Database Tasks',
                folder: 'Infrastructure',
                space: 'Development',
                url: 'https://app.clickup.com/t/123459'
            }
        ];

        const mockTimeEntries = [];
        let totalTime = 0;

        // Генерируем записи времени для каждой задачи
        mockTasks.forEach((task, taskIndex) => {
            const entriesCount = Math.floor(Math.random() * 10) + 5; // 5-15 записей
            let taskTotalTime = 0;

            for (let i = 0; i < entriesCount; i++) {
                const randomDay = Math.floor(Math.random() * endOfMonth.date()) + 1;
                const entryDate = moment().year(year).month(month - 1).date(randomDay);
                
                // Пропускаем выходные для реалистичности
                if (entryDate.day() === 0 || entryDate.day() === 6) continue;

                const startHour = Math.floor(Math.random() * 8) + 9; // 9-17 часов
                const duration = (Math.floor(Math.random() * 4) + 1) * 30 * 60 * 1000; // 30мин - 2часа
                
                const startTime = entryDate.hour(startHour).minute(0).valueOf();
                const endTime = startTime + duration;

                const descriptions = [
                    'Работа над основным функционалом',
                    'Исправление найденных проблем',
                    'Тестирование и отладка',
                    'Код ревью и рефакторинг',
                    'Планирование и анализ',
                    'Интеграция с внешними сервисами',
                    'Написание unit тестов',
                    'Оптимизация производительности'
                ];

                mockTimeEntries.push({
                    id: `entry_${taskIndex}_${i}`,
                    task: task,
                    description: descriptions[Math.floor(Math.random() * descriptions.length)],
                    duration: duration,
                    start: startTime,
                    end: endTime,
                    user: {
                        id: 'demo_user',
                        username: 'demo_user',
                        email: 'demo@example.com'
                    }
                });

                taskTotalTime += duration;
            }

            task.totalTime = taskTotalTime;
            totalTime += taskTotalTime;
        });

        return {
            user: {
                id: 'demo_user',
                username: 'demo_user',
                email: 'demo@example.com'
            },
            timeEntries: mockTimeEntries,
            tasks: mockTasks,
            totalTime: totalTime
        };
    }

    formatDuration(milliseconds) {
        return this.userPrefs.formatTime(milliseconds);
    }

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

    async generateDemoReport(year, month) {
        console.log(`🎭 ДЕМО РЕЖИМ - Генерация отчета за ${month}/${year}...`.magenta);
        console.log('ℹ️  Используются тестовые данные для демонстрации\n'.yellow);

        const mockData = this.generateMockData(year, month);
        
        // Группируем записи по задачам
        const taskGroups = {};
        
        for (const entry of mockData.timeEntries) {
            const taskId = entry.task.id;
            
            if (!taskGroups[taskId]) {
                taskGroups[taskId] = {
                    task: entry.task,
                    entries: [],
                    totalTime: 0
                };
            }
            
            taskGroups[taskId].entries.push(entry);
            taskGroups[taskId].totalTime += entry.duration;
        }

        // Формируем отчет
        const startOfMonth = moment().year(year).month(month - 1).startOf('month');
        const endOfMonth = moment().year(year).month(month - 1).endOf('month');

        const report = {
            user: mockData.user,
            period: {
                start: startOfMonth.format('DD.MM.YYYY'),
                end: endOfMonth.format('DD.MM.YYYY'),
                month: month,
                year: year
            },
            summary: {
                totalTasks: Object.keys(taskGroups).length,
                totalTime: mockData.totalTime,
                totalTimeFormatted: this.formatDuration(mockData.totalTime)
            },
            tasks: []
        };

        // Сортируем задачи по времени
        const sortedTasks = Object.values(taskGroups).sort((a, b) => b.totalTime - a.totalTime);

        for (const taskGroup of sortedTasks) {
            const task = taskGroup.task;
            
            report.tasks.push({
                id: task.id,
                name: task.name,
                url: task.url,
                status: task.status,
                list: task.list,
                folder: task.folder,
                space: task.space,
                totalTime: taskGroup.totalTime,
                totalTimeFormatted: this.formatDuration(taskGroup.totalTime),
                entriesCount: taskGroup.entries.length,
                entries: taskGroup.entries.map(entry => ({
                    id: entry.id,
                    description: entry.description,
                    duration: entry.duration,
                    durationFormatted: this.formatDuration(entry.duration),
                    start: moment(entry.start).format('DD.MM.YYYY HH:mm'),
                    end: moment(entry.end).format('DD.MM.YYYY HH:mm')
                }))
            });
        }

        // Выводим отчет
        this.printReport(report);
        
        // Сохраняем отчет
        await this.saveReport(report, 'demo');

        console.log('\n🎭 Это демо данные! Для реальных данных настройте .env файл с вашим ClickUp токеном.'.magenta);

        return report;
    }

    printReport(report) {
        console.log('\n' + '='.repeat(80).rainbow);
        console.log(`📊 ДЕМО ОТЧЕТ ПО ВРЕМЕНИ ЗА ${report.period.month}/${report.period.year}`.bold.white);
        console.log('='.repeat(80).rainbow);
        
        console.log(`👤 Пользователь: ${report.user.username} (${report.user.email})`.cyan);
        console.log(`📅 Период: ${report.period.start} - ${report.period.end}`.cyan);
        console.log(`⏱️  Общее время: ${report.summary.totalTimeFormatted}`.green.bold);
        console.log(`📋 Количество задач: ${report.summary.totalTasks}`.yellow);
        
        console.log('\n' + '📝 ДЕТАЛИЗАЦИЯ ПО ЗАДАЧАМ:'.bold.white);
        console.log('-'.repeat(80).gray);

        for (let i = 0; i < report.tasks.length; i++) {
            const task = report.tasks[i];
            console.log(`\n${(i + 1)}. ${task.name}`.bold.white);
            console.log(`   ID: ${task.id}`.gray);
            console.log(`   Статус: ${task.status}`.blue);
            console.log(`   Список: ${task.list}`.blue);
            console.log(`   Папка: ${task.folder}`.blue);
            console.log(`   Пространство: ${task.space}`.blue);
            console.log(`   Время: ${task.totalTimeFormatted}`.green.bold);
            console.log(`   Записей: ${task.entriesCount}`.yellow);
            console.log(`   URL: ${task.url}`.gray);
        }
        
        console.log('\n' + '='.repeat(80).rainbow);
    }

    async saveReport(report, prefix = '') {
        const fileName = `${prefix ? prefix + '_' : ''}report_${report.period.year}_${report.period.month.toString().padStart(2, '0')}.json`;
        const filePath = path.join(this.reportsDir, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`💾 Демо отчет сохранен в файл: ${filePath}`.green);
    }
}

// Основная функция для демо
async function runDemo() {
    try {
        const tracker = new ClickUpTimeTrackerDemo();
        
        const args = process.argv.slice(2);
        let year, month;
        
        if (args.length === 2) {
            year = parseInt(args[0]);
            month = parseInt(args[1]);
        } else {
            // По умолчанию текущий месяц
            const now = moment();
            year = now.year();
            month = now.month() + 1;
        }
        
        await tracker.generateDemoReport(year, month);
        
    } catch (error) {
        console.error('Ошибка демо:', error.message.red);
    }
}

module.exports = ClickUpTimeTrackerDemo;

// Запуск если файл выполняется напрямую
if (require.main === module) {
    runDemo();
}
