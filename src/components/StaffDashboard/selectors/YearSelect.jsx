// src/components/StaffDashboard/selectors/YearSelect.jsx
export default function YearSelect({ years, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
        Year
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 text-slate-900 rounded-lg px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
