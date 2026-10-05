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

// Runs `fn` over `items` with at most `limit` in flight, preserving order.
// Used so the monthly report doesn't fire every employee's webhook at once
// (n8n -> Airtable is capped at ~5 requests/sec per base).
export const mapWithConcurrency = async (items, limit, fn) => {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

// Runs `fn`, retrying with exponential backoff whenever it throws. Gives
// the n8n webhook another chance when a run fails on Airtable's rate limit
// and the browser sees a network error or an empty/invalid JSON body.
export const retryAsync = async (fn, { retries = 4, baseDelayMs = 2000 } = {}) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
    }
  }
};

// fetch that backs off and retries on 429 / 5xx and on thrown network errors.
// Returns the last response once retries are exhausted so callers can still
// inspect the status; rethrows the last error if every attempt threw.
export const fetchWithRetry = async (
  url,
  options,
  { retries = 4, baseDelayMs = 2000, fetchImpl = fetch } = {}
) => {
  for (let attempt = 0; ; attempt++) {
    let response;
    try {
      response = await fetchImpl(url, options);
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
      continue;
    }
    const retryable = response.status === 429 || response.status >= 500;
    if (response.ok || !retryable || attempt >= retries) return response;
    await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
  }
};

// Employer cost on top of base pay: AGA 14.1%, OTP 2%, Feriepenger 10.2%.
export const costBreakdown = (totalHours, wage) => {
  const baseSalary = (Number(totalHours) || 0) * (Number(wage) || 0);
  const aga = baseSalary * 0.141;
  const otp = baseSalary * 0.02;
  const feriepenger = baseSalary * 0.102;
  return { baseSalary, aga, otp, feriepenger, realCost: baseSalary + aga + otp + feriepenger };
};

// 112.9 -> "112 hrs 54 min"
export const formatHoursMinutes = (decimalHours) => {
  const totalMin = Math.round((Number(decimalHours) || 0) * 60);
  return `${Math.floor(totalMin / 60)} hrs ${totalMin % 60} min`;
};
