// src/lib/helpers.js
export const pad = (n) => String(n).padStart(2, '0');

export const getMonthRange = (yearStr, monthStr) => {
  const year = Number(yearStr);
  const month = Number(monthStr);

  const isLeap =
    (year % 4 === 0 && year % 100 !== 0) ||
    (year % 400 === 0);

  const daysInMonth = [
    31,
    isLeap ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  const lastDay = daysInMonth[month - 1];

  return {
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
};

export const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
};

export const shortenDuration = (str) => {
  if (!str) return '0 hrs 0 min';
  return str.replace('hours', 'hrs').replace('minutes', 'min');
};
