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
        icon={<Clock className="w-10 h-10 text-white/80" />}
        containerClassName="bg-gradient-to-br from-blue-600 to-blue-700"
        valueClassName="text-white"
      />

      <StatCard
        title="PLANNED"
        subtitle="Expected hours"
        value={stats.totalPlannedHours}
        icon={<Target className="w-10 h-10 text-purple-400" />}
        containerClassName="bg-slate-800 border border-slate-700"
        valueClassName="text-white"
      />

      <StatCard
        title="DIFFERENCE"
        subtitle={stats.overtimeHours >= 0 ? 'Overtime' : 'Undertime'}
        value={`${stats.overtimeHours > 0 ? '+' : ''}${stats.overtimeHours} hrs`}
        icon={
          stats.overtimeHours >= 0 ? (
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          ) : (
            <XCircle className="w-10 h-10 text-rose-400" />
          )
        }
        containerClassName="bg-slate-800 border border-slate-700"
        valueClassName={stats.overtimeHours >= 0 ? 'text-emerald-400' : 'text-rose-400'}
      />

      <StatCard
        title="WORK DAYS"
        subtitle="Shifts attended"
        value={stats.workDays}
        icon={<Calendar className="w-10 h-10 text-indigo-400" />}
        containerClassName="bg-slate-800 border border-slate-700"
        valueClassName="text-white"
      />

      <StatCard
        title="AVG SHIFT"
        subtitle="Hours per shift"
        value={stats.averageShiftDuration}
        icon={<TrendingUp className="w-10 h-10 text-cyan-400" />}
        containerClassName="bg-slate-800 border border-slate-700"
        valueClassName="text-white"
      />

      <StatCard
        title="BREAK TIME"
        subtitle="Unpaid breaks"
        value={stats.totalBreakHours}
        icon={<Coffee className="w-10 h-10 text-amber-400" />}
        containerClassName="bg-slate-800 border border-slate-700"
        valueClassName="text-white"
      />
    </div>
  );
}
