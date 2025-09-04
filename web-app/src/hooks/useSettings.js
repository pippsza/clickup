import { useState, useEffect } from "react";

const defaultSettings = {
  hourlyRate: 25,
  currency: "USD",
  taxRate: 0.2,
};

export const useSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem("clickup-settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (error) {
        console.error("Ошибка загрузки настроек:", error);
      }
    }
  }, []);

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("clickup-settings", JSON.stringify(updated));
  };

  const calculateEarnings = (timeInMs) => {
    const hours = timeInMs / (1000 * 60 * 60);
    const gross = hours * settings.hourlyRate;
    const net = gross * (1 - settings.taxRate);
    return { gross, net, hours };
  };

  const formatCurrency = (amount) => {
    const symbols = {
      USD: "$",
      EUR: "€",
      UAH: "₴",
      RUB: "₽",
    };
    return `${amount.toFixed(2)} ${
      symbols[settings.currency] || settings.currency
    }`;
  };

  return {
    settings,
    updateSettings,
    calculateEarnings,
    formatCurrency,
  };
};
