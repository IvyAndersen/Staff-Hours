// src/components/StaffDashboard/stats/StatCard.jsx
export default function StatCard({ title, subtitle, value, icon, valueClassName = '', containerClassName = '' }) {
  return (
    <div className={`rounded-2xl p-6 shadow-sm border border-slate-200 transform hover:scale-[1.02] transition-transform ${containerClassName}`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className="text-slate-500 text-xs font-bold tracking-wider">
          {title}
        </span>
      </div>
      <p className={`text-3xl md:text-4xl font-bold mb-1 ${valueClassName}`}>{value}</p>
      {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
    </div>
  );
}
