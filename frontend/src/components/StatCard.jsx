export default function StatCard({ title, value, icon: Icon, description, trend, trendType, color = 'slate' }) {
  const colorClasses = {
    slate: 'bg-slate-50 text-slate-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorClasses[color] || colorClasses.slate}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            trendType === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {description && <p className="text-xs text-slate-400 mt-1.5">{description}</p>}
    </div>
  );
}
