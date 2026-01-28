// src/components/StaffDashboard/stats/StatGrid.jsx
import { Clock, Target, CheckCircle, XCircle, Calendar, TrendingUp, Coffee } from 'lucide-react';
import StatCard from './StatCard';

export default function StatGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <StatCard
        title="TOTAL WORKED"
        subtitle="Actual time recorded"
        value={stats.totalHoursFormatted}
        icon={<Clock className="w-10 h-10 text-white/90" />}
        containerClassName="bg-emerald-700 shadow-md"
        valueClassName="text-white"
      />

      <StatCard
        title="PLANNED"
        subtitle="Expected hours"
        value={stats.totalPlannedHours}
        icon={<Target className="w-10 h-10 text-emerald-600" />}
        containerClassName="bg-white border border-slate-200"
        valueClassName="text-slate-900"
      />

      <StatCard
        title="DIFFERENCE"
        subtitle={stats.overtimeHours >= 0 ? 'Overtime' : 'Undertime'}
        value={`${stats.overtimeHours > 0 ? '+' : ''}${stats.overtimeHours} hrs`}
        icon={
          stats.overtimeHours >= 0 ? (
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )
        }
        containerClassName="bg-white border border-slate-200"
        valueClassName={stats.overtimeHours >= 0 ? 'text-emerald-600' : 'text-red-600'}
      />

      <StatCard
        title="WORK DAYS"
        subtitle="Shifts attended"
        value={stats.workDays}
        icon={<Calendar className="w-10 h-10 text-emerald-800" />}
        containerClassName="bg-white border border-slate-200"
        valueClassName="text-slate-900"
      />

      <StatCard
        title="AVG SHIFT"
        subtitle="Hours per shift"
        value={stats.averageShiftDuration}
        icon={<TrendingUp className="w-10 h-10 text-emerald-600" />}
        containerClassName="bg-white border border-slate-200"
        valueClassName="text-slate-900"
      />

      <StatCard
        title="BREAK TIME"
        subtitle="Unpaid breaks"
        value={stats.totalBreakHours}
        icon={<Coffee className="w-10 h-10 text-amber-600" />}
        containerClassName="bg-white border border-slate-200"
        valueClassName="text-slate-900"
      />
    </div>
  );
}
