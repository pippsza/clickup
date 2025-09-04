#!/usr/bin/env node

/**
 * Быстрый запуск ClickUp Time Tracker
 * Использование:
 *   node run.js              - текущий месяц
 *   node run.js prev         - предыдущий месяц
 *   node run.js 2024 3       - март 2024
 *   node run.js interactive  - интерактивный режим
 */

const args = process.argv.slice(2);

if (args.length === 1 && args[0] === "interactive") {
  // Запуск интерактивного режима
  require("./interactive.js");
} else {
  // Запуск основного скрипта
  require("./index.js");
}
