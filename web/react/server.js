const express = require("express");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

// Serve reports directory
app.use(
  "/reports",
  express.static(path.join(__dirname, "..", "..", "reports"))
);

// API endpoint для генерации отчета
app.post("/api/generate-report", (req, res) => {
  const { year, month, reportType } = req.body;

  // Путь к корневой папке проекта (из web/react назад на 2 уровня)
  const rootPath = path.join(__dirname, "..", "..");

  // Команда для запуска нашего CLI скрипта
  let command;
  if (reportType === "daily") {
    command = `cd "${rootPath}" && node index.js daily ${year} ${month}`;
  } else {
    command = `cd "${rootPath}" && node index.js ${year} ${month}`;
  }

  console.log("Выполняем команду:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Ошибка генерации отчета:", error);
      return res.status(500).json({
        error: "Ошибка генерации отчета",
        details: error.message,
        stdout: stdout,
        stderr: stderr,
      });
    }

    // Пытаемся загрузить сгенерированный отчет
    const fileName = `report_${year}_${month.toString().padStart(2, "0")}.json`;
    const filePath = path.join(rootPath, "reports", fileName);

    console.log("Ищем файл отчета:", filePath);

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Файл отчета не найден: ${filePath}`);
      }

      const reportData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      console.log("Отчет успешно загружен");
      res.json(reportData);
    } catch (readError) {
      console.error("Ошибка чтения отчета:", readError);
      res.status(500).json({
        error: "Ошибка чтения сгенерированного отчета",
        details: readError.message,
      });
    }
  });
});

// API endpoint для получения списка доступных отчетов
app.get("/api/reports", (req, res) => {
  const reportsDir = path.join(__dirname, "..", "..", "reports");

  try {
    const files = fs
      .readdirSync(reportsDir)
      .filter((file) => file.endsWith(".json") && file.startsWith("report_"))
      .map((file) => {
        const match = file.match(/report_(\d{4})_(\d{2})\.json/);
        if (match) {
          return {
            fileName: file,
            year: parseInt(match[1]),
            month: parseInt(match[2]),
            path: `/reports/${file}`,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    res.json(files);
  } catch (error) {
    res.status(500).json({
      error: "Ошибка получения списка отчетов",
      details: error.message,
    });
  }
});

// Fallback для React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 Веб-интерфейс: http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api`);
});
