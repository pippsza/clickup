import axios from 'axios';

class ClickUpService {
  constructor() {
    this.baseURL = 'https://api.clickup.com/api/v2';
    this.token = process.env.REACT_APP_CLICKUP_TOKEN;
    
    if (!this.token) {
      console.warn('REACT_APP_CLICKUP_TOKEN не найден в переменных окружения');
    }
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      }
    });
  }

  // Получить информацию о пользователе
  async getUserInfo() {
    try {
      const response = await this.api.get('/user');
      return response.data.user;
    } catch (error) {
      throw new Error(`Ошибка получения информации о пользователе: ${error.message}`);
    }
  }

  // Получить команды пользователя
  async getTeams() {
    try {
      const response = await this.api.get('/team');
      return response.data.teams;
    } catch (error) {
      throw new Error(`Ошибка получения команд: ${error.message}`);
    }
  }

  // Получить записи времени за период
  async getTimeEntries(teamId, startDate, endDate, userId = null) {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate
      };
      
      if (userId) {
        params.assignee = userId;
      }

      const response = await this.api.get(`/team/${teamId}/time_entries`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(`Ошибка получения записей времени: ${error.message}`);
    }
  }

  // Получить задачу по ID
  async getTask(taskId) {
    try {
      const response = await this.api.get(`/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.warn(`Ошибка получения задачи ${taskId}: ${error.message}`);
      return null;
    }
  }

  // Сгенерировать отчет за месяц
  async generateMonthlyReport(year, month, teamId = null) {
    try {
      // Получаем пользователя
      const user = await this.getUserInfo();
      
      // Если команда не указана, берем первую доступную
      let teams = [];
      if (!teamId) {
        teams = await this.getTeams();
        if (teams.length === 0) {
          throw new Error('У пользователя нет доступных команд');
        }
        teamId = teams[0].id;
      }

      // Определяем даты
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime() + (24 * 60 * 60 * 1000) - 1;

      // Получаем записи времени
      const timeEntries = await this.getTimeEntries(teamId, startTimestamp, endTimestamp, user.id);

      // Группируем по задачам
      const taskGroups = {};
      const dayGroups = {};
      
      for (const entry of timeEntries) {
        const taskId = entry.task?.id || 'no-task';
        const entryDate = new Date(parseInt(entry.start));
        const dateKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
        
        // Группировка по задачам
        if (!taskGroups[taskId]) {
          taskGroups[taskId] = {
            id: taskId,
            name: entry.task?.name || 'Без задачи',
            status: entry.task?.status?.status || 'unknown',
            list: entry.task?.list?.name || 'Не указан',
            totalTime: 0,
            entries: []
          };
        }
        
        taskGroups[taskId].totalTime += parseInt(entry.duration);
        taskGroups[taskId].entries.push(entry);

        // Группировка по дням
        if (!dayGroups[dateKey]) {
          dayGroups[dateKey] = {
            date: dateKey,
            totalTime: 0,
            tasks: new Set()
          };
        }
        
        dayGroups[dateKey].totalTime += parseInt(entry.duration);
        dayGroups[dateKey].tasks.add(entry.task?.name || 'Без задачи');
      }

      // Преобразуем в массивы
      const tasks = Object.values(taskGroups);
      const days = Object.values(dayGroups)
        .map(day => ({
          ...day,
          tasks: Array.from(day.tasks),
          dateObj: new Date(day.date) // Создаем Date из YYYY-MM-DD формата
        }))
        .sort((a, b) => a.dateObj - b.dateObj); // Сортируем по дате

      const totalTime = tasks.reduce((sum, task) => sum + task.totalTime, 0);

      return {
        user: {
          username: user.username,
          email: user.email
        },
        period: {
          start: startDate.toLocaleDateString('ru-RU'),
          end: endDate.toLocaleDateString('ru-RU'),
          month: month,
          year: year
        },
        summary: {
          totalTasks: tasks.length,
          totalTime: totalTime,
          totalTimeFormatted: this.formatTime(totalTime)
        },
        statistics: {
          totalEntries: timeEntries.length,
          workingDays: days.length,
          avgDayTime: days.length > 0 ? totalTime / days.length : 0,
          weekdayTime: totalTime,
          weekendTime: 0
        },
        tasks: tasks,
        days: days
      };
    } catch (error) {
      console.error('Ошибка генерации отчета:', error);
      throw error;
    }
  }

  // Форматирование времени из миллисекунд
  formatTime(milliseconds) {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}ч ${minutes}м`;
  }

  // Проверка подключения
  async testConnection() {
    try {
      await this.getUserInfo();
      return true;
    } catch (error) {
      return false;
    }
  }
}

const clickupService = new ClickUpService();
export default clickupService;
