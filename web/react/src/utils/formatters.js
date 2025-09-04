export const formatTime = (milliseconds) => {
  if (!milliseconds) return "0ч 0м";

  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}ч ${minutes}м`;
};

export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const parseTimeToMs = (timeString) => {
  // Парсит строки типа "1ч 30м" в миллисекунды
  const hourMatch = timeString.match(/(\d+)ч/);
  const minuteMatch = timeString.match(/(\d+)м/);

  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

  return (hours * 60 + minutes) * 60 * 1000;
};
