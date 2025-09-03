#!/usr/bin/env node

const ClickUpTimeTracker = require('./index.js');
const UserPreferences = require('./user-preferences.js');
const readline = require('readline');
const moment = require('moment');
const colors = require('colors');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupConfig() {
    console.log('🔧 Настройка ClickUp Time Tracker\n'.blue);
    
    const token = await question('Введите ваш ClickUp API Token: ');
    const teamId = await question('Введите Team ID (оставьте пустым для автоопределения): ');
    
    console.log('\n💰 Финансовые настройки:'.yellow);
    const hourlyRate = await question('Почасовая ставка (по умолчанию 25): ') || '25';
    const currency = await question('Валюта [USD/RUB/EUR] (по умолчанию USD): ') || 'USD';
    const taxRate = await question('Налоговая ставка в долях (например, 0.2 для 20%, по умолчанию 0.2): ') || '0.2';
    
    const fs = require('fs');
    const envContent = `# ClickUp API Token
CLICKUP_TOKEN=${token}

# Team ID (опционально)
TEAM_ID=${teamId}

# Финансовые настройки
HOURLY_RATE=${hourlyRate}
CURRENCY=${currency.toUpperCase()}
TAX_RATE=${taxRate}

# Настройки отображения
SHOW_TIME_ENTRIES=true
SHOW_DAILY_BREAKDOWN=false
SHOW_COST=true
`;
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ Конфигурация сохранена в .env файл\n'.green);
}

async function configureDisplaySettings() {
    try {
        const userPrefs = new UserPreferences();
        console.log('\n⚙️  Настройка отображения отчетов\n'.blue);
        
        console.log('Текущие настройки:'.yellow);
        const current = userPrefs.getAll();
        console.log(`💰 Почасовая ставка: ${current.hourlyRate} ${current.currency}`);
        console.log(`📊 Показывать стоимость: ${current.showCost ? 'Да' : 'Нет'}`);
        console.log(`📝 Показывать записи времени: ${current.showTimeEntries ? 'Да' : 'Нет'}`);
        console.log(`📅 Показывать дни: ${current.showDays ? 'Да' : 'Нет'}`);
        console.log(`📋 Показывать задачи: ${current.showTasks ? 'Да' : 'Нет'}`);
        console.log(`📈 Показывать статистику: ${current.showStatistics ? 'Да' : 'Нет'}`);
        console.log(`🔄 Сортировка: ${current.sortBy}`);
        
        const change = await question('\nХотите изменить настройки? (y/n): ');
        if (change.toLowerCase() !== 'y') return;
        
        console.log('\n💰 Финансовые настройки:'.yellow);
        const newRate = await question(`Почасовая ставка (текущая: ${current.hourlyRate}): `);
        if (newRate) userPrefs.set('hourlyRate', parseFloat(newRate));
        
        const newCurrency = await question(`Валюта (текущая: ${current.currency}): `);
        if (newCurrency) userPrefs.set('currency', newCurrency.toUpperCase());
        
        const newTaxRate = await question(`Налоговая ставка в долях (текущая: ${current.taxRate}): `);
        if (newTaxRate) userPrefs.set('taxRate', parseFloat(newTaxRate));
        
        console.log('\n📊 Настройки отображения:'.yellow);
        
        const showCost = await question(`Показывать стоимость? [y/n] (текущее: ${current.showCost ? 'y' : 'n'}): `);
        if (showCost) userPrefs.set('showCost', showCost.toLowerCase() === 'y');
        
        const showTimeEntries = await question(`Показывать отдельные записи времени? [y/n] (текущее: ${current.showTimeEntries ? 'y' : 'n'}): `);
        if (showTimeEntries) userPrefs.set('showTimeEntries', showTimeEntries.toLowerCase() === 'y');
        
        const showDays = await question(`Показывать разбивку по дням? [y/n] (текущее: ${current.showDays ? 'y' : 'n'}): `);
        if (showDays) userPrefs.set('showDays', showDays.toLowerCase() === 'y');
        
        const showTasks = await question(`Показывать задачи? [y/n] (текущее: ${current.showTasks ? 'y' : 'n'}): `);
        if (showTasks) userPrefs.set('showTasks', showTasks.toLowerCase() === 'y');
        
        const showStatistics = await question(`Показывать статистику? [y/n] (текущее: ${current.showStatistics ? 'y' : 'n'}): `);
        if (showStatistics) userPrefs.set('showStatistics', showStatistics.toLowerCase() === 'y');
        
        console.log('\n🔄 Сортировка:'.yellow);
        console.log('1. По времени (убыв.)');
        console.log('2. По времени (возр.)');
        console.log('3. По имени (А-Я)');
        console.log('4. По имени (Я-А)');
        console.log('5. По стоимости (убыв.)');
        
        const sortChoice = await question(`Выберите сортировку (1-5, текущая: ${current.sortBy}): `);
        const sortOptions = ['time_desc', 'time_asc', 'name_asc', 'name_desc', 'cost_desc'];
        if (sortChoice && sortChoice >= 1 && sortChoice <= 5) {
            userPrefs.set('sortBy', sortOptions[sortChoice - 1]);
        }
        
        console.log('\n✅ Настройки сохранены!'.green);
        
    } catch (error) {
        console.error('❌ Ошибка настройки:', error.message.red);
    }
}

async function interactiveMode() {
    try {
        console.log('📊 ClickUp Time Tracker - Интерактивный режим\n'.rainbow);
        
        const choice = await question(`Выберите действие:
1. Отчет за текущий месяц
2. Отчет за предыдущий месяц  
3. Отчет за конкретный месяц
4. Отчет по дням (без детализации задач)
5. Настроить отображение отчетов
6. Настроить ClickUp конфигурацию
7. Сброс настроек к значениям по умолчанию
8. Выход

Ваш выбор (1-8): `);

        switch (choice.trim()) {
            case '1':
                console.log('\n🔄 Генерация отчета за текущий месяц...\n'.blue);
                const tracker1 = new ClickUpTimeTracker();
                await tracker1.generateCurrentMonthReport();
                break;
                
            case '2':
                console.log('\n🔄 Генерация отчета за предыдущий месяц...\n'.blue);
                const tracker2 = new ClickUpTimeTracker();
                await tracker2.generatePreviousMonthReport();
                break;
                
            case '3':
                const year = await question('Введите год (например, 2024): ');
                const month = await question('Введите месяц (1-12): ');
                
                const yearNum = parseInt(year);
                const monthNum = parseInt(month);
                
                if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
                    console.log('❌ Неверный формат года или месяца'.red);
                    break;
                }
                
                console.log(`\n🔄 Генерация отчета за ${monthNum}/${yearNum}...\n`.blue);
                const tracker3 = new ClickUpTimeTracker();
                await tracker3.generateMonthlyReport(yearNum, monthNum);
                break;
                
            case '4':
                const yearDaily = await question('Введите год (по умолчанию текущий): ') || moment().year();
                const monthDaily = await question('Введите месяц (по умолчанию текущий): ') || (moment().month() + 1);
                
                const yearDailyNum = parseInt(yearDaily);
                const monthDailyNum = parseInt(monthDaily);
                
                if (isNaN(yearDailyNum) || isNaN(monthDailyNum) || monthDailyNum < 1 || monthDailyNum > 12) {
                    console.log('❌ Неверный формат года или месяца'.red);
                    break;
                }
                
                console.log(`\n📅 Генерация отчета по дням за ${monthDailyNum}/${yearDailyNum}...\n`.blue);
                const tracker4 = new ClickUpTimeTracker();
                await tracker4.generateDailyReport(yearDailyNum, monthDailyNum);
                break;
                
            case '5':
                await configureDisplaySettings();
                break;
                
            case '6':
                await setupConfig();
                break;
                
            case '7':
                const userPrefs = new UserPreferences();
                userPrefs.reset();
                console.log('✅ Настройки сброшены к значениям по умолчанию'.green);
                break;
                
            case '8':
                console.log('👋 До свидания!'.yellow);
                rl.close();
                return;
                
            default:
                console.log('❌ Неверный выбор'.red);
        }
        
        const continueChoice = await question('\nХотите продолжить? (y/n): ');
        if (continueChoice.toLowerCase() === 'y') {
            await interactiveMode();
        } else {
            console.log('👋 До свидания!'.yellow);
            rl.close();
        }
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message.red);
        rl.close();
    }
}

// Проверяем существование .env файла
const fs = require('fs');
if (!fs.existsSync('.env')) {
    console.log('⚠️  Файл .env не найден. Запуск настройки...\n'.yellow);
    setupConfig().then(() => {
        interactiveMode();
    });
} else {
    interactiveMode();
}
