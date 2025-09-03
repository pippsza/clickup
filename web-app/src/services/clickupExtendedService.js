import axios from 'axios';

class ClickUpExtendedService {
  constructor() {
    this.baseURL = 'https://api.clickup.com/api/v2';
    this.token = process.env.REACT_APP_CLICKUP_TOKEN;
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      }
    });
  }

  // ============== WORKSPACE & TEAMS ==============
  
  // Получить все доступные workspace
  async getWorkspaces() {
    try {
      const response = await this.api.get('/team');
      return response.data.teams;
    } catch (error) {
      throw new Error(`Ошибка получения workspace: ${error.message}`);
    }
  }

  // Получить информацию о конкретном workspace
  async getWorkspace(teamId) {
    try {
      const response = await this.api.get(`/team/${teamId}`);
      return response.data.team;
    } catch (error) {
      throw new Error(`Ошибка получения workspace: ${error.message}`);
    }
  }

  // ============== SPACES (ПРОСТРАНСТВА) ==============
  
  // Получить все пространства в workspace
  async getSpaces(teamId) {
    try {
      const response = await this.api.get(`/team/${teamId}/space`);
      return response.data.spaces;
    } catch (error) {
      throw new Error(`Ошибка получения пространств: ${error.message}`);
    }
  }

  // Создать новое пространство
  async createSpace(teamId, name, options = {}) {
    try {
      const data = {
        name,
        multiple_assignees: options.multipleAssignees || true,
        features: {
          due_dates: { enabled: options.dueDates || true },
          time_tracking: { enabled: options.timeTracking || true },
          tags: { enabled: options.tags || true },
          time_estimates: { enabled: options.timeEstimates || true },
          checklists: { enabled: options.checklists || true },
          custom_fields: { enabled: options.customFields || true },
          remap_dependencies: { enabled: options.remapDependencies || true },
          dependency_warning: { enabled: options.dependencyWarning || true },
          portfolios: { enabled: options.portfolios || true }
        }
      };
      
      const response = await this.api.post(`/team/${teamId}/space`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания пространства: ${error.message}`);
    }
  }

  // ============== FOLDERS (ПАПКИ) ==============
  
  // Получить папки в пространстве
  async getFolders(spaceId) {
    try {
      const response = await this.api.get(`/space/${spaceId}/folder`);
      return response.data.folders;
    } catch (error) {
      throw new Error(`Ошибка получения папок: ${error.message}`);
    }
  }

  // Создать новую папку
  async createFolder(spaceId, name) {
    try {
      const response = await this.api.post(`/space/${spaceId}/folder`, { name });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания папки: ${error.message}`);
    }
  }

  // ============== LISTS (СПИСКИ) ==============
  
  // Получить списки в папке
  async getListsInFolder(folderId) {
    try {
      const response = await this.api.get(`/folder/${folderId}/list`);
      return response.data.lists;
    } catch (error) {
      throw new Error(`Ошибка получения списков: ${error.message}`);
    }
  }

  // Получить списки без папки (в пространстве)
  async getListsInSpace(spaceId) {
    try {
      const response = await this.api.get(`/space/${spaceId}/list`);
      return response.data.lists;
    } catch (error) {
      throw new Error(`Ошибка получения списков: ${error.message}`);
    }
  }

  // Создать новый список
  async createList(parent, name, type = 'folder') {
    try {
      const endpoint = type === 'folder' ? `/folder/${parent}/list` : `/space/${parent}/list`;
      const response = await this.api.post(endpoint, { name });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания списка: ${error.message}`);
    }
  }

  // ============== TASKS (ЗАДАЧИ) ==============
  
  // Получить задачи из списка с фильтрами
  async getTasks(listId, options = {}) {
    try {
      const params = {
        archived: options.archived || false,
        include_closed: options.includeClosed || false,
        orderby: options.orderBy || 'created',
        reverse: options.reverse || false,
        subtasks: options.includeSubtasks || false,
        statuses: options.statuses || undefined,
        assignees: options.assignees || undefined,
        tags: options.tags || undefined,
        due_date_gt: options.dueDateGt || undefined,
        due_date_lt: options.dueDateLt || undefined,
        date_created_gt: options.dateCreatedGt || undefined,
        date_created_lt: options.dateCreatedLt || undefined,
        date_updated_gt: options.dateUpdatedGt || undefined,
        date_updated_lt: options.dateUpdatedLt || undefined
      };

      const response = await this.api.get(`/list/${listId}/task`, { params });
      return response.data.tasks;
    } catch (error) {
      throw new Error(`Ошибка получения задач: ${error.message}`);
    }
  }

  // Создать новую задачу
  async createTask(listId, taskData) {
    try {
      const data = {
        name: taskData.name,
        description: taskData.description || '',
        assignees: taskData.assignees || [],
        tags: taskData.tags || [],
        status: taskData.status || 'Open',
        priority: taskData.priority || null,
        due_date: taskData.dueDate || null,
        due_date_time: taskData.dueDateWithTime || false,
        time_estimate: taskData.timeEstimate || null,
        start_date: taskData.startDate || null,
        start_date_time: taskData.startDateWithTime || false,
        notify_all: taskData.notifyAll || true,
        parent: taskData.parent || null,
        links_to: taskData.linksTo || null,
        custom_fields: taskData.customFields || []
      };

      const response = await this.api.post(`/list/${listId}/task`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания задачи: ${error.message}`);
    }
  }

  // Обновить задачу
  async updateTask(taskId, updates) {
    try {
      const response = await this.api.put(`/task/${taskId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка обновления задачи: ${error.message}`);
    }
  }

  // Удалить задачу
  async deleteTask(taskId) {
    try {
      await this.api.delete(`/task/${taskId}`);
      return true;
    } catch (error) {
      throw new Error(`Ошибка удаления задачи: ${error.message}`);
    }
  }

  // ============== COMMENTS (КОММЕНТАРИИ) ==============
  
  // Получить комментарии к задаче
  async getTaskComments(taskId) {
    try {
      const response = await this.api.get(`/task/${taskId}/comment`);
      return response.data.comments;
    } catch (error) {
      throw new Error(`Ошибка получения комментариев: ${error.message}`);
    }
  }

  // Добавить комментарий к задаче
  async addComment(taskId, commentText, assignee = null, notifyAll = true) {
    try {
      const data = {
        comment_text: commentText,
        assignee: assignee,
        notify_all: notifyAll
      };

      const response = await this.api.post(`/task/${taskId}/comment`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка добавления комментария: ${error.message}`);
    }
  }

  // ============== TIME TRACKING (УЧЕТ ВРЕМЕНИ) ==============
  
  // Создать запись времени
  async createTimeEntry(taskId, timeData) {
    try {
      const data = {
        description: timeData.description || '',
        start: timeData.start, // timestamp в миллисекундах
        billable: timeData.billable || true,
        duration: timeData.duration || null, // в миллисекундах
        assignee: timeData.assignee || null,
        tid: timeData.tid || null
      };

      const response = await this.api.post(`/task/${taskId}/time`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания записи времени: ${error.message}`);
    }
  }

  // Начать отслеживание времени
  async startTimeTracking(taskId, description = '') {
    try {
      const data = {
        description,
        billable: true
      };

      const response = await this.api.post(`/task/${taskId}/time`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка начала отслеживания времени: ${error.message}`);
    }
  }

  // Остановить отслеживание времени
  async stopTimeTracking(teamId) {
    try {
      const response = await this.api.delete(`/team/${teamId}/time_entries/current`);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка остановки отслеживания времени: ${error.message}`);
    }
  }

  // Получить текущее отслеживание времени
  async getCurrentTimeTracking(teamId) {
    try {
      const response = await this.api.get(`/team/${teamId}/time_entries/current`);
      return response.data;
    } catch (error) {
      return null; // Если нет активного отслеживания
    }
  }

  // ============== GOALS (ЦЕЛИ) ==============
  
  // Получить цели
  async getGoals(teamId) {
    try {
      const response = await this.api.get(`/team/${teamId}/goal`);
      return response.data.goals;
    } catch (error) {
      throw new Error(`Ошибка получения целей: ${error.message}`);
    }
  }

  // Создать цель
  async createGoal(teamId, goalData) {
    try {
      const data = {
        name: goalData.name,
        description: goalData.description || '',
        due_date: goalData.dueDate || null,
        priority: goalData.priority || null,
        color: goalData.color || '#32a852'
      };

      const response = await this.api.post(`/team/${teamId}/goal`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания цели: ${error.message}`);
    }
  }

  // ============== MEMBERS (УЧАСТНИКИ) ==============
  
  // Получить участников workspace
  async getWorkspaceMembers(teamId) {
    try {
      const response = await this.api.get(`/team/${teamId}/member`);
      return response.data.members;
    } catch (error) {
      throw new Error(`Ошибка получения участников: ${error.message}`);
    }
  }

  // Пригласить участника
  async inviteMember(teamId, email, admin = false) {
    try {
      const data = {
        email,
        admin
      };

      const response = await this.api.post(`/team/${teamId}/member`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка приглашения участника: ${error.message}`);
    }
  }

  // ============== CUSTOM FIELDS (ПОЛЬЗОВАТЕЛЬСКИЕ ПОЛЯ) ==============
  
  // Получить доступные пользовательские поля
  async getCustomFields(listId) {
    try {
      const response = await this.api.get(`/list/${listId}/field`);
      return response.data.fields;
    } catch (error) {
      throw new Error(`Ошибка получения пользовательских полей: ${error.message}`);
    }
  }

  // Создать пользовательское поле
  async createCustomField(listId, fieldData) {
    try {
      const data = {
        name: fieldData.name,
        type: fieldData.type, // text, textarea, number, currency, date, phone, email, url, dropdown, labels
        type_config: fieldData.typeConfig || {}
      };

      const response = await this.api.post(`/list/${listId}/field`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания пользовательского поля: ${error.message}`);
    }
  }

  // ============== WEBHOOKS (ВЕБ-ХУКИ) ==============
  
  // Получить webhooks
  async getWebhooks(teamId) {
    try {
      const response = await this.api.get(`/team/${teamId}/webhook`);
      return response.data.webhooks;
    } catch (error) {
      throw new Error(`Ошибка получения webhooks: ${error.message}`);
    }
  }

  // Создать webhook
  async createWebhook(teamId, endpoint, events) {
    try {
      const data = {
        endpoint,
        events // массив событий: taskCreated, taskUpdated, taskDeleted, taskCommentPosted и др.
      };

      const response = await this.api.post(`/team/${teamId}/webhook`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания webhook: ${error.message}`);
    }
  }

  // ============== ATTACHMENTS (ВЛОЖЕНИЯ) ==============
  
  // Прикрепить файл к задаче
  async attachFile(taskId, file, filename) {
    try {
      const formData = new FormData();
      formData.append('attachment', file, filename);

      const response = await this.api.post(`/task/${taskId}/attachment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Ошибка прикрепления файла: ${error.message}`);
    }
  }

  // ============== DEPENDENCIES (ЗАВИСИМОСТИ) ==============
  
  // Создать зависимость между задачами
  async createDependency(taskId, dependsOn, dependencyType = 'waiting_on') {
    try {
      const data = {
        depends_on: dependsOn,
        dependency_of: taskId,
        type: dependencyType // waiting_on, blocking
      };

      const response = await this.api.post(`/task/${taskId}/dependency`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания зависимости: ${error.message}`);
    }
  }

  // ============== TAGS (ТЕГИ) ==============
  
  // Получить теги пространства
  async getSpaceTags(spaceId) {
    try {
      const response = await this.api.get(`/space/${spaceId}/tag`);
      return response.data.tags;
    } catch (error) {
      throw new Error(`Ошибка получения тегов: ${error.message}`);
    }
  }

  // Создать новый тег
  async createTag(spaceId, tagName, tagColor) {
    try {
      const data = {
        name: tagName,
        tag_fg: '#FFFFFF',
        tag_bg: tagColor || '#FF6900'
      };

      const response = await this.api.post(`/space/${spaceId}/tag`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания тега: ${error.message}`);
    }
  }

  // ============== CHECKLISTS (ЧЕКЛИСТЫ) ==============
  
  // Создать чеклист в задаче
  async createChecklist(taskId, name) {
    try {
      const data = { name };
      const response = await this.api.post(`/task/${taskId}/checklist`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка создания чеклиста: ${error.message}`);
    }
  }

  // Добавить элемент в чеклист
  async addChecklistItem(checklistId, name, assignee = null) {
    try {
      const data = {
        name,
        assignee
      };

      const response = await this.api.post(`/checklist/${checklistId}/checklist_item`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка добавления элемента чеклиста: ${error.message}`);
    }
  }

  // ============== REPORTING & ANALYTICS ==============
  
  // Получить расширенную аналитику времени
  async getAdvancedTimeAnalytics(teamId, startDate, endDate, userId = null) {
    try {
      const timeEntries = await this.getTimeEntries(teamId, startDate, endDate, userId);
      
      // Группировка по различным критериям
      const analytics = {
        byUser: {},
        byProject: {},
        byTag: {},
        byStatus: {},
        byHour: Array(24).fill(0),
        byDayOfWeek: Array(7).fill(0),
        productivity: {
          totalTime: 0,
          billableTime: 0,
          nonBillableTime: 0,
          averageSessionLength: 0,
          longestSession: 0,
          shortestSession: Infinity
        }
      };

      timeEntries.forEach(entry => {
        const duration = parseInt(entry.duration);
        const date = new Date(parseInt(entry.start));
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        
        // По пользователям
        const userId = entry.user?.id || 'unknown';
        if (!analytics.byUser[userId]) {
          analytics.byUser[userId] = {
            name: entry.user?.username || 'Unknown',
            totalTime: 0,
            sessions: 0
          };
        }
        analytics.byUser[userId].totalTime += duration;
        analytics.byUser[userId].sessions++;

        // По проектам/спискам
        const listName = entry.task?.list?.name || 'No List';
        if (!analytics.byProject[listName]) {
          analytics.byProject[listName] = { totalTime: 0, tasks: 0 };
        }
        analytics.byProject[listName].totalTime += duration;
        analytics.byProject[listName].tasks++;

        // По тегам
        if (entry.task?.tags) {
          entry.task.tags.forEach(tag => {
            if (!analytics.byTag[tag.name]) {
              analytics.byTag[tag.name] = { totalTime: 0, tasks: 0 };
            }
            analytics.byTag[tag.name].totalTime += duration;
            analytics.byTag[tag.name].tasks++;
          });
        }

        // По статусам
        const status = entry.task?.status?.status || 'unknown';
        if (!analytics.byStatus[status]) {
          analytics.byStatus[status] = { totalTime: 0, tasks: 0 };
        }
        analytics.byStatus[status].totalTime += duration;
        analytics.byStatus[status].tasks++;

        // По часам дня
        analytics.byHour[hour] += duration;

        // По дням недели
        analytics.byDayOfWeek[dayOfWeek] += duration;

        // Производительность
        analytics.productivity.totalTime += duration;
        if (entry.billable) {
          analytics.productivity.billableTime += duration;
        } else {
          analytics.productivity.nonBillableTime += duration;
        }

        // Длительность сессий
        if (duration > analytics.productivity.longestSession) {
          analytics.productivity.longestSession = duration;
        }
        if (duration < analytics.productivity.shortestSession) {
          analytics.productivity.shortestSession = duration;
        }
      });

      // Средняя длительность сессии
      if (timeEntries.length > 0) {
        analytics.productivity.averageSessionLength = 
          analytics.productivity.totalTime / timeEntries.length;
      }

      return analytics;
    } catch (error) {
      throw new Error(`Ошибка получения аналитики: ${error.message}`);
    }
  }

  // ============== UTILITY METHODS ==============
  
  // Форматирование времени
  formatTime(milliseconds) {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}ч ${minutes}м`;
  }

  // Получить все данные workspace (полная структура)
  async getWorkspaceStructure(teamId) {
    try {
      const workspace = await this.getWorkspace(teamId);
      const spaces = await this.getSpaces(teamId);
      const members = await this.getWorkspaceMembers(teamId);
      const goals = await this.getGoals(teamId);

      const structure = {
        workspace,
        members,
        goals,
        spaces: []
      };

      // Для каждого пространства получаем папки и списки
      for (const space of spaces) {
        const spaceData = {
          ...space,
          folders: [],
          lists: []
        };

        // Получаем папки
        const folders = await this.getFolders(space.id);
        for (const folder of folders) {
          const folderData = {
            ...folder,
            lists: await this.getListsInFolder(folder.id)
          };
          spaceData.folders.push(folderData);
        }

        // Получаем списки без папки
        spaceData.lists = await this.getListsInSpace(space.id);

        structure.spaces.push(spaceData);
      }

      return structure;
    } catch (error) {
      throw new Error(`Ошибка получения структуры workspace: ${error.message}`);
    }
  }
}

const clickupExtendedService = new ClickUpExtendedService();
export default clickupExtendedService;
