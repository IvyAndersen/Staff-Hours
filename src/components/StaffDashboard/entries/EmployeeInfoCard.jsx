// src/components/StaffDashboard/entries/EmployeeInfoCard.jsx
import { Banknote, BadgePercent } from 'lucide-react';

export default function EmployeeInfoCard({ employee }) {
  if (!employee) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-slate-700 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg shrink-0">
          {employee.name.charAt(0)}
        </div>

        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
            {employee.name}
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-slate-400 text-sm md:text-base flex items-center gap-2 border-r border-slate-600 pr-3 mr-1">
              {employee.role} • {employee.department}
            </p>

            <div className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-600/50">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 text-xs font-medium">
                {employee.wage} NOK/h
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-600/50">
              <BadgePercent className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-200 text-xs font-medium">
                {employee.percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
