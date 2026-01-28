// src/components/StaffDashboard/StaffDashboard.jsx
import React, { useState } from 'react';
import {
  Users,
  Search,
  Download,
} from 'lucide-react';

import useStaffData from '../../hooks/useStaffData';
import { EMPLOYEES } from '../../lib/employees';
import { MONTHS, YEARS } from '../../lib/constants';

import EmployeeSelect from './selectors/EmployeeSelect';
import MonthSelect from './selectors/MonthSelect';
import YearSelect from './selectors/YearSelect';
import EmployeeInfoCard from './entries/EmployeeInfoCard';
import StatGrid from './stats/StatGrid';
import TimeEntriesTable from './entries/TimeEntriesTable';

export default function StaffDashboard() {
  const {
    stats,
    timeEntries,
    error,
    loading,
    loadingMonthly,
    setError,
    calculateHours,
    downloadMonthlyReport,
    downloadPDFReport,
  } = useStaffData();

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');

  const selectedEmployeeObj = EMPLOYEES.find(
    e => String(e.id) === String(selectedEmployee)
  );

  const handleCalculate = () => {
    calculateHours({
      employeeId: selectedEmployee,
      month: selectedMonth,
      year: selectedYear,
    });
  };

  const handleMonthlyReport = () => {
    downloadMonthlyReport({
      month: selectedMonth,
      year: selectedYear,
    });
  };

  const handlePDFReport = () => {
    downloadPDFReport({
      employeeId: selectedEmployee,
      month: selectedMonth,
      year: selectedYear,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Staff Management</h1>
        </div>
        <p className="text-slate-600 text-sm md:text-base">
          Monitor employee hours and performance metrics
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Input section */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            Select Employee &amp; Period
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EmployeeSelect
              employees={EMPLOYEES}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
            />
            <MonthSelect
              months={MONTHS}
              value={selectedMonth}
              onChange={setSelectedMonth}
            />
            <YearSelect
              years={YEARS}
              value={selectedYear}
              onChange={setSelectedYear}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/50 rounded-lg p-3 flex items-center gap-2">
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Calculate Hours
                </>
              )}
            </button>

            <button
              onClick={handlePDFReport}
              disabled={timeEntries.length === 0 || !selectedEmployee}
              className="bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-700 font-semibold py-3 px-6 rounded-lg shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF Report
            </button>

            <button
              onClick={handleMonthlyReport}
              disabled={loadingMonthly || !selectedMonth || !selectedYear}
              className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loadingMonthly ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Monthly Report (All Staff)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Employee card */}
        {selectedEmployeeObj && (
          <EmployeeInfoCard employee={selectedEmployeeObj} />
        )}

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Table */}
        <TimeEntriesTable entries={timeEntries} loading={loading} />
      </div>
    </div>
  );
}
