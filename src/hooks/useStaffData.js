// src/hooks/useStaffData.js
import { useState, useEffect, useRef } from 'react';
import { EMPLOYEES as STATIC_EMPLOYEES } from '../lib/employees';
import { WEBHOOKS, MONTHS } from '../lib/constants';
import { getMonthRange, formatTime, shortenDuration, mapWithConcurrency, fetchWithRetry, retryAsync, costBreakdown } from '../lib/helpers';
import { createMonthlyReportWindow } from '../reports/generateMonthlyReport';
import { createIndividualReportWindow } from '../reports/generateIndividualReport';

const MONTHLY_REPORT_CONCURRENCY = 1;

const formatEntries = (entries) =>
  entries
    .map(item => ({
      date: item.date,
      clockIn: formatTime(item.clockIn),
      clockOut: formatTime(item.clockOut),
      shiftName: item.shiftName,
      breakHours: item.breakHours,
      plannedHours: item.plannedHours,
      actualHours: item.actualHours,
      difference: (item.actualHours - item.plannedHours).toFixed(2),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

export default function useStaffData() {
  const [stats, setStats] = useState({
    totalHours: 0,
    totalHoursFormatted: '0 hrs 0 min',
    totalPlannedHours: 0,
    overtimeHours: 0,
    workDays: 0,
    averageShiftDuration: 0,
    totalBreakHours: 0,
  });

  const [timeEntries, setTimeEntries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [missingEmployees, setMissingEmployees] = useState([]);
  const [progress, setProgress] = useState(null); // { done, total } while a month report is fetching

  // Employees are fetched live from Airtable (via our own /api/employees
  // endpoint) so new hires show up automatically. If that fetch fails for
  // any reason, we fall back to the bundled static list.
  const [employees, setEmployees] = useState(STATIC_EMPLOYEES);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      setEmployeesLoading(true);
      setEmployeesError('');
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setEmployees(data);
        }
      } catch (err) {
        console.error('Falling back to static employee list:', err);
        if (!cancelled) {
          setEmployeesError('Could not load the live employee list from Airtable. Showing the last saved list.');
        }
      } finally {
        if (!cancelled) setEmployeesLoading(false);
      }
    };

    loadEmployees();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetStats = () => {
    setStats({
      totalHours: 0,
      totalHoursFormatted: '0 hrs 0 min',
      totalPlannedHours: 0,
      overtimeHours: 0,
      workDays: 0,
      averageShiftDuration: 0,
      totalBreakHours: 0,
    });
    setTimeEntries([]);
  };

  const calculateHours = async ({ employeeId, month, year }) => {
    if (!employeeId || !month || !year) {
      setError('Please select an employee, month, and year');
      return;
    }

    setLoading(true);
    setError('');
    resetStats();

    try {
      const empObj = employees.find(e => String(e.id) === String(employeeId));
      const { startDate, endDate } = getMonthRange(year, month);
      const monthNumber = Number(month);
      const yearNumber = Number(year);
      const monthName = MONTHS[monthNumber - 1];

      const body = {
        employeeId,
        employeeName: empObj ? empObj.name : '',
        startDate,
        endDate,
        month: monthNumber,
        year: yearNumber,
        monthName,
      };

      const response = await fetchWithRetry(WEBHOOKS.CALCULATE_HOURS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const rawData = await response.json();
      let summary = Array.isArray(rawData) ? rawData[0] : rawData;

      if (summary && summary.entries && summary.entries.length > 0) {
        setStats({
          totalHours: summary.totalHours || 0,
          totalHoursFormatted: shortenDuration(summary.totalHoursFormatted),
          totalPlannedHours: summary.totalPlannedHours || 0,
          overtimeHours: summary.overtimeHours || 0,
          workDays: summary.workDays || 0,
          averageShiftDuration: summary.averageShiftDuration || 0,
          totalBreakHours: summary.totalBreakHours || 0,
        });
        setTimeEntries(formatEntries(summary.entries));
      } else {
        setError('No time entries found for this period');
      }
    } catch (err) {
      console.error('Error calculating hours:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Every employee's summary for one month, fetched one at a time (n8n -> Airtable
  // rate limit). Kept per month so the second report button doesn't refetch.
  const monthCache = useRef({});

  const fetchMonthData = async ({ month, year }) => {
    const key = `${year}-${month}`;
    if (monthCache.current[key]) return monthCache.current[key];

    const { startDate, endDate } = getMonthRange(year, month);
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    const monthName = MONTHS[monthNumber - 1];

    setProgress({ done: 0, total: employees.length });
    let done = 0;

    const allEmployeeData = await mapWithConcurrency(
      employees,
      MONTHLY_REPORT_CONCURRENCY,
      async (emp) => {
        try {
          const body = {
            employeeId: emp.id,
            employeeName: emp.name,
            startDate,
            endDate,
            month: monthNumber,
            year: yearNumber,
            monthName,
          };

          // Retry the whole request + JSON parse: a rate-limited n8n run can
          // come back as a network error or an empty body, not just a 429.
          const summary = await retryAsync(async () => {
            const response = await fetch(WEBHOOKS.CALCULATE_HOURS, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (!response.ok) {
              throw Object.assign(new Error(`HTTP ${response.status}`), { httpStatus: response.status });
            }
            const rawData = await response.json();
            return Array.isArray(rawData) ? rawData[0] : rawData;
          });

          if (summary && summary.entries && summary.entries.length > 0) {
            return {
              emp,
              result: {
                ...emp,
                stats: {
                  totalHours: summary.totalHours || 0,
                  totalHoursFormatted: shortenDuration(summary.totalHoursFormatted),
                  totalPlannedHours: summary.totalPlannedHours || 0,
                  overtimeHours: summary.overtimeHours || 0,
                  workDays: summary.workDays || 0,
                  averageShiftDuration: summary.averageShiftDuration || 0,
                  totalBreakHours: summary.totalBreakHours || 0,
                },
                timeEntries: formatEntries(summary.entries),
              },
            };
          }
          return { emp, result: null, reason: 'No entries found', noData: true };
        } catch (err) {
          console.error(`Error fetching data for ${emp.name}:`, err);
          return { emp, result: null, reason: err.httpStatus ? `HTTP ${err.httpStatus}` : 'Fetch error' };
        } finally {
          setProgress({ done: ++done, total: employees.length });
        }
      }
    );

    const data = {
      monthName,
      employeesWithData: allEmployeeData.filter(item => item.result !== null).map(item => item.result),
      missing: allEmployeeData
        .filter(item => item.result === null)
        .map(item => ({ name: item.emp.name, reason: item.reason, noData: !!item.noData })),
    };
    // Only reuse a month when nothing failed, so a retry actually refetches.
    if (data.missing.every(m => m.noData)) monthCache.current[key] = data;
    return data;
  };

  const runMonthReport = async ({ month, year }, build) => {
    if (!month || !year) {
      setError('Please select a month and year for the monthly report');
      return;
    }

    setLoadingMonthly(true);
    setError('');
    setMissingEmployees([]);

    try {
      const { monthName, employeesWithData, missing } = await fetchMonthData({ month, year });
      setMissingEmployees(missing);

      if (!employeesWithData.length) {
        setError('No employee data found for this period');
        return;
      }
      await build({ employeesWithData, monthName, year });
    } catch (err) {
      console.error('Error generating monthly report:', err);
      setError('Failed to generate monthly report. Please try again.');
    } finally {
      setLoadingMonthly(false);
      setProgress(null);
    }
  };

  const downloadMonthlyReport = ({ month, year }) =>
    runMonthReport({ month, year }, ({ employeesWithData, monthName }) => {
      const totals = employeesWithData.reduce(
        (acc, emp) => {
          const { baseSalary, realCost } = costBreakdown(emp.stats.totalHours, emp.wage);
          return {
            totalHours: acc.totalHours + emp.stats.totalHours,
            totalPlannedHours: acc.totalPlannedHours + emp.stats.totalPlannedHours,
            overtimeHours: acc.overtimeHours + emp.stats.overtimeHours,
            workDays: acc.workDays + emp.stats.workDays,
            totalBreakHours: acc.totalBreakHours + emp.stats.totalBreakHours,
            totalBaseSalary: acc.totalBaseSalary + baseSalary,
            totalRealCost: acc.totalRealCost + realCost,
          };
        },
        {
          totalHours: 0,
          totalPlannedHours: 0,
          overtimeHours: 0,
          workDays: 0,
          totalBreakHours: 0,
          totalBaseSalary: 0,
          totalRealCost: 0,
        }
      );

      createMonthlyReportWindow({
        employeesWithData,
        totals,
        monthName,
        year,
      });
    });

  const downloadAllIndividualReports = ({ month, year }) =>
    runMonthReport({ month, year }, async (data) => {
      // Loaded on demand: jsPDF + JSZip would otherwise double the page's bundle.
      const { downloadAllIndividualPdfs } = await import('../reports/generateIndividualPdf');
      await downloadAllIndividualPdfs(data);
    });

  const downloadPDFReport = ({ employeeId, month, year }) => {
    if (!employeeId || !month || !year || !stats.totalHoursFormatted) {
      setError('Please select employee, month, and year and make sure data is loaded');
      return;
    }

    const employee = employees.find(e => String(e.id) === String(employeeId));
    const monthName = MONTHS[Number(month) - 1];

    createIndividualReportWindow({
      employee,
      monthName,
      year,
      stats,
      timeEntries,
    });
  };

  return {
    stats,
    timeEntries,
    error,
    loading,
    loadingMonthly,
    progress,
    missingEmployees,
    employees,
    employeesLoading,
    employeesError,
    setError,
    calculateHours,
    downloadMonthlyReport,
    downloadAllIndividualReports,
    downloadPDFReport,
  };
}
