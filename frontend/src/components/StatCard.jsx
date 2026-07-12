import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, description, trend, trendType, color = 'slate' }) {
  const colorStyles = {
    slate:  { iconBg: 'bg-gradient-to-br from-slate-100 to-slate-200', icon: 'text-slate-700' },
    blue:   { iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200', icon: 'text-blue-700' },
    green:  { iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200', icon: 'text-emerald-700' },
    red:    { iconBg: 'bg-gradient-to-br from-red-100 to-red-200', icon: 'text-red-700' },
    purple: { iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200', icon: 'text-purple-700' },
    amber:  { iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200', icon: 'text-amber-700' },
    cyan:   { iconBg: 'bg-gradient-to-br from-cyan-100 to-cyan-200', icon: 'text-cyan-700' },
  };

  const style = colorStyles[color] || colorStyles.slate;

  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${style.iconBg} shadow-sm`}>
          {Icon && <Icon className={`w-5 h-5 ${style.icon}`} />}
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            trendType === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
    </div>
  );
}
