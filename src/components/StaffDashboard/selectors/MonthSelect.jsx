// src/components/StaffDashboard/selectors/MonthSelect.jsx
export default function MonthSelect({ months, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
        Month
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 text-slate-900 rounded-lg px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
      >
        <option value="">Select Month...</option>
        {months.map((month, idx) => (
          <option key={idx} value={idx + 1}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
}
