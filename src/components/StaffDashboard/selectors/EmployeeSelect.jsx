// src/components/StaffDashboard/selectors/EmployeeSelect.jsx
export default function EmployeeSelect({ employees, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
        Employee
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 text-slate-900 rounded-lg px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
      >
        <option value="">Select Employee...</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.id}>
            {emp.name} ({emp.role})
          </option>
        ))}
      </select>
    </div>
  );
}
