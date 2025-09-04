import axios from "axios";

// Функция для загрузки существующих отчетов
export const loadReportData = async (period) => {
  try {
    // Сначала пытаемся сгенерировать новый отчет через API
    const response = await axios.post("/api/generate-report", {
      year: period.year,
      month: period.month,
    });

    if (response.data && response.data.tasks) {
      return response.data;
    }

    // Если API не сработал, пытаемся загрузить существующий файл
    const fileName = `report_${period.year}_${period.month
      .toString()
      .padStart(2, "0")}.json`;
    const fileResponse = await axios.get(`/reports/${fileName}`);
    return fileResponse.data;
  } catch (error) {
    console.warn(`Не удалось загрузить реальные данные: ${error.message}`);
    // Возвращаем демо данные как fallback
    return loadDemoData(period);
  }
};

// Функция для генерации нового отчета через API
export const generateReport = async (period) => {
  try {
    // Вызываем API для генерации отчета
    const response = await axios.post("/api/generate-report", {
      year: period.year,
      month: period.month,
      reportType: period.reportType,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка генерации отчета: ${error.message}`);
  }
};

// Функция для загрузки демо данных (если нет реальных)
export const loadDemoData = (period = null) => {
  const currentDate = new Date();
  const year = period ? period.year : currentDate.getFullYear();
  const month = period ? period.month : currentDate.getMonth() + 1;

  // Генерируем динамические демо данные
  const generateRandomTime = (min, max) => {
    const hours = Math.random() * (max - min) + min;
    return Math.floor(hours * 60 * 60 * 1000); // в миллисекундах
  };

  const demoTasks = [
    {
      id: "123456",
      name: "Help & questions + support Ticket chat system",
      status: "testing",
      list: "Development",
      totalTime: generateRandomTime(4, 8), // 4-8 часов
      entriesCount: Math.floor(Math.random() * 15) + 5, // 5-20 записей
      url: "https://app.clickup.com/t/123456",
      entries: [],
    },
    {
      id: "123457",
      name: "Create Monthly Bot Usage History Page with Charts",
      status: "done",
      list: "Frontend",
      totalTime: generateRandomTime(2, 6), // 2-6 часов
      entriesCount: Math.floor(Math.random() * 10) + 3, // 3-13 записей
      url: "https://app.clickup.com/t/123457",
      entries: [],
    },
    {
      id: "123458",
      name: "Refactor Join Page for Organization Creation Workflow",
      status: "done",
      list: "Frontend",
      totalTime: generateRandomTime(1, 4), // 1-4 часа
      entriesCount: Math.floor(Math.random() * 8) + 2, // 2-10 записей
      url: "https://app.clickup.com/t/123458",
      entries: [],
    },
  ];

  const demoDays = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  let totalGeneratedTime = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (!isWeekend && Math.random() > 0.3) {
      // 70% шанс работать в будни
      const randomHours = Math.random() * 6 + 2; // 2-8 часов
      const dayTime = randomHours * 60 * 60 * 1000;
      totalGeneratedTime += dayTime;

      demoDays.push({
        date: `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`,
        totalTime: dayTime,
        tasks: [
          `Task ${Math.floor(Math.random() * 3) + 1}`,
          `Task ${Math.floor(Math.random() * 3) + 4}`,
        ],
        isWeekend: false,
      });
    }
  }

  const totalTime = demoTasks.reduce((sum, task) => sum + task.totalTime, 0);
  const workingDays = demoDays.length;

  return {
    user: {
      username: "demo_user",
      email: "demo@example.com",
    },
    period: {
      start: `01.${month.toString().padStart(2, "0")}.${year}`,
      end: `${daysInMonth}.${month.toString().padStart(2, "0")}.${year}`,
      month: month,
      year: year,
    },
    summary: {
      totalTasks: demoTasks.length,
      totalTime: totalTime,
      totalTimeFormatted: formatTime(totalTime),
    },
    statistics: {
      totalEntries: demoTasks.reduce((sum, task) => sum + task.entriesCount, 0),
      workingDays: workingDays,
      avgDayTime: totalTime / workingDays,
      weekdayTime: totalTime,
      weekendTime: 0,
    },
    tasks: demoTasks,
    days: demoDays,
  };
};

const formatTime = (milliseconds) => {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}ч ${minutes}м`;
};
