const fs = require('fs');
const path = require('path');
const config = require('./config.js');

class UserPreferences {
    constructor() {
        this.preferencesFile = path.join(__dirname, config.interactive.preferencesFile);
        this.defaultPreferences = {
            hourlyRate: parseFloat(process.env.HOURLY_RATE) || config.billing.hourlyRate,
            currency: process.env.CURRENCY || config.billing.currency,
            taxRate: parseFloat(process.env.TAX_RATE) || config.billing.taxRate,
            showTimeEntries: process.env.SHOW_TIME_ENTRIES === 'true' || config.output.showTimeEntries,
            showDays: process.env.SHOW_DAILY_BREAKDOWN === 'true' || config.output.showDays,
            showCost: process.env.SHOW_COST === 'true' || config.output.showCost,
            showTasks: config.output.showTasks,
            showStatistics: config.output.showStatistics,
            groupBy: config.reports.groupBy,
            sortBy: config.reports.sortBy,
            roundToMinutes: config.billing.roundToMinutes
        };
        this.preferences = this.loadPreferences();
    }

    loadPreferences() {
        try {
            if (fs.existsSync(this.preferencesFile)) {
                const data = fs.readFileSync(this.preferencesFile, 'utf8');
                const saved = JSON.parse(data);
                return { ...this.defaultPreferences, ...saved };
            }
        } catch (error) {
            console.warn('Ошибка загрузки настроек пользователя:', error.message);
        }
        return { ...this.defaultPreferences };
    }

    savePreferences() {
        try {
            fs.writeFileSync(this.preferencesFile, JSON.stringify(this.preferences, null, 2));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error.message);
            return false;
        }
    }

    get(key) {
        return this.preferences[key];
    }

    set(key, value) {
        this.preferences[key] = value;
        if (config.interactive.saveUserPreferences) {
            this.savePreferences();
        }
    }

    getAll() {
        return { ...this.preferences };
    }

    updateMultiple(updates) {
        Object.assign(this.preferences, updates);
        if (config.interactive.saveUserPreferences) {
            this.savePreferences();
        }
    }

    reset() {
        this.preferences = { ...this.defaultPreferences };
        if (config.interactive.saveUserPreferences) {
            this.savePreferences();
        }
    }

    // Вычисление стоимости на основе времени
    calculateCost(timeInMilliseconds) {
        const hours = timeInMilliseconds / (1000 * 60 * 60);
        const roundedHours = this.roundTime(hours);
        const grossCost = roundedHours * this.preferences.hourlyRate;
        const netCost = grossCost * (1 - this.preferences.taxRate);
        
        return {
            hours: roundedHours,
            grossCost: grossCost,
            netCost: netCost,
            tax: grossCost - netCost,
            currency: this.preferences.currency
        };
    }

    // Округление времени до заданного количества минут
    roundTime(hours) {
        if (this.preferences.roundToMinutes === 0) {
            return hours;
        }
        
        const minutes = hours * 60;
        const roundTo = this.preferences.roundToMinutes;
        const roundedMinutes = Math.ceil(minutes / roundTo) * roundTo;
        return roundedMinutes / 60;
    }

    // Форматирование стоимости
    formatCost(cost) {
        const formatter = new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: this.preferences.currency,
            minimumFractionDigits: 2
        });
        return formatter.format(cost);
    }

    // Форматирование времени в зависимости от настроек
    formatTime(milliseconds) {
        const duration = require('moment').duration(milliseconds);
        
        switch (config.timeFormat.displayFormat) {
            case 'decimal_hours':
                const hours = milliseconds / (1000 * 60 * 60);
                return `${hours.toFixed(config.timeFormat.precision)}ч`;
                
            case 'minutes':
                const totalMinutes = Math.floor(milliseconds / (1000 * 60));
                return `${totalMinutes}мин`;
                
            case 'hours_minutes':
            default:
                const h = Math.floor(duration.asHours());
                const m = duration.minutes();
                return `${h}ч ${m}м`;
        }
    }
}

module.exports = UserPreferences;
