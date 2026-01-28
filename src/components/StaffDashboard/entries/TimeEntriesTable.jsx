// src/components/StaffDashboard/entries/TimeEntriesTable.jsx
import { Clock } from 'lucide-react';

export default function TimeEntriesTable({ entries, loading }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm">
      <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">
        Detailed Time Entries
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Date</th>
              <th className="py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Shift</th>
              <th className="py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Clock In</th>
              <th className="py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Clock Out</th>
              <th className="py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Break</th>
              <th className="py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Planned</th>
              <th className="py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Actual</th>
              <th className="py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold text-right">Diff</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? (
              entries.map((entry, idx) => {
                const diff = parseFloat(entry.difference);
                const diffColor =
                  diff > 0 ? 'text-emerald-600' :
                    diff < 0 ? 'text-red-600' :
                      'text-slate-500';

                return (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-900 font-medium">{entry.date}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-xs font-bold uppercase border border-emerald-100">
                        {entry.shiftName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-sm">{entry.clockIn}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-sm">{entry.clockOut}</td>
                    <td className="py-3 px-4 text-slate-600">{entry.breakHours}h</td>
                    <td className="py-3 px-4 text-slate-600">{entry.plannedHours}h</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{entry.actualHours}h</td>
                    <td className={`py-3 px-4 text-right font-bold ${diffColor}`}>
                      {diff > 0 ? '+' : ''}{entry.difference}h
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Clock className="w-12 h-12 text-slate-300" />
                    <p className="text-slate-400 text-lg font-medium">
                      {loading ? 'Loading data...' : 'No time entries found'}
                    </p>
                    {!loading && (
                      <p className="text-slate-500 text-sm">
                        Select an employee and period, then click &quot;Calculate Hours&quot;
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
