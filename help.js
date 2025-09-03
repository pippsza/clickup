#!/usr/bin/env node

console.log(`
🕒 ClickUp Time Tracker Report Generator
======================================

📋 Возможности:
• Получение записей времени из ClickUp по API
• Группировка по задачам и месяцам  
• Красивые отчеты в консоли, JSON и CSV
• Интерактивный режим с меню
• Демо режим с тестовыми данными

🚀 Быстрый старт:
1. Получите API токен в ClickUp (Settings → Apps → API Token)
2. Скопируйте .env.example в .env и укажите токен
3. Запустите: npm start

📖 Команды:
npm start                    # Отчет за текущий месяц
npm run interactive          # Интерактивное меню  
npm run demo                 # Демо с тестовыми данными
node index.js prev           # Отчет за предыдущий месяц
node index.js 2024 3         # Отчет за март 2024

📁 Результат:
• Консольный отчет с цветами
• reports/report_YYYY_MM.json - детальные данные
• reports/report_YYYY_MM.csv - для Excel

❓ Помощь:
• README.md - подробная документация
• QUICKSTART.md - быстрое руководство  
• .env.example - пример настроек

🐛 Проблемы:
• Убедитесь что токен указан в .env файле
• Проверьте доступ к вашему ClickUp workspace
• Используйте npm run demo для тестирования

Удачной работы! 🎉
`);
