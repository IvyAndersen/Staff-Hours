// src/hooks/useStaffData.js
import { useState } from 'react';
import { EMPLOYEES } from '../lib/employees';
import { WEBHOOKS, MONTHS } from '../lib/constants';
import { getMonthRange, formatTime, shortenDuration } from '../lib/helpers';
import { createMonthlyReportWindow } from '../reports/generateMonthlyReport';
import { createIndividualReportWindow } from '../reports/generateIndividualReport';

export default function useStaffData() {
  const [stats, setStats] = useState({
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

  const resetStats = () => {
    setStats({
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
      const empObj = EMPLOYEES.find(e => String(e.id) === String(employeeId));
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

      const response = await fetch(WEBHOOKS.CALCULATE_HOURS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const rawData = await response.json();
      let summary = Array.isArray(rawData) ? rawData[0] : rawData;

      if (summary && summary.entries && summary.entries.length > 0) {
        setStats({
          totalHoursFormatted: shortenDuration(summary.totalHoursFormatted),
          totalPlannedHours: summary.totalPlannedHours || 0,
          overtimeHours: summary.overtimeHours || 0,
          workDays: summary.workDays || 0,
          averageShiftDuration: summary.averageShiftDuration || 0,
          totalBreakHours: summary.totalBreakHours || 0,
        });

        const formattedEntries = summary.entries.map(item => ({
          date: item.date,
          clockIn: formatTime(item.clockIn),
          clockOut: formatTime(item.clockOut),
          shiftName: item.shiftName,
          breakHours: item.breakHours,
          plannedHours: item.plannedHours,
          actualHours: item.actualHours,
          difference: (item.actualHours - item.plannedHours).toFixed(2),
        }));

        formattedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTimeEntries(formattedEntries);
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

  const downloadMonthlyReport = async ({ month, year }) => {
    if (!month || !year) {
      setError('Please select a month and year for the monthly report');
      return;
    }

    setLoadingMonthly(true);
    setError('');

    try {
      const { startDate, endDate } = getMonthRange(year, month);
      const monthNumber = Number(month);
      const yearNumber = Number(year);
      const monthName = MONTHS[monthNumber - 1];

      const allEmployeeData = await Promise.all(
        EMPLOYEES.map(async (emp) => {
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

            const response = await fetch(WEBHOOKS.CALCULATE_HOURS, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            if (!response.ok) return null;

            const rawData = await response.json();
            const summary = Array.isArray(rawData) ? rawData[0] : rawData;

            if (summary && summary.entries && summary.entries.length > 0) {
              return {
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
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching data for ${emp.name}:`, err);
            return null;
          }
        })
      );

      const employeesWithData = allEmployeeData.filter(Boolean);

      if (!employeesWithData.length) {
        setError('No employee data found for this period');
        return;
      }

      const totals = employeesWithData.reduce(
        (acc, emp) => {
          const baseSalary = emp.stats.totalHours * emp.wage;
          const aga = baseSalary * 0.141;
          const otp = baseSalary * 0.02;
          const feriepenger = baseSalary * 0.102;
          const realCost = baseSalary + aga + otp + feriepenger;

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
    } catch (err) {
      console.error('Error generating monthly report:', err);
      setError('Failed to generate monthly report. Please try again.');
    } finally {
      setLoadingMonthly(false);
    }
  };

  const downloadPDFReport = ({ employeeId, month, year }) => {
    if (!employeeId || !month || !year || !stats.totalHoursFormatted) {
      setError('Please select employee, month, and year and make sure data is loaded');
      return;
    }

    const employee = EMPLOYEES.find(e => String(e.id) === String(employeeId));
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
    setError,
    calculateHours,
    downloadMonthlyReport,
    downloadPDFReport,
  };
}
