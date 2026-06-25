import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import {
  DollarSign, TrendingDown, TrendingUp, Activity, Users,
  Package, Truck, Bell, Brain, AlertTriangle, CheckCircle,
  Info, AlertCircle, Loader
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CHART_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

function AIInsightsPanel() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/ai-insights')
      .then(res => setInsights(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const iconMap = {
    critical: <AlertTriangle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    positive: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgMap = {
    critical: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    positive: 'bg-emerald-50 border-emerald-200',
    info: 'bg-blue-50 border-blue-200',
  };

  if (loading) return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center gap-2 text-slate-500">
        <Loader className="w-5 h-5 animate-spin" />
        Generating AI insights...
      </div>
    </div>
  );

  if (!insights) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary-950 to-primary-800 p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary-300" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">AI Decision Assistant</h3>
          <p className="text-primary-300 text-xs">Automated analysis & recommendations</p>
        </div>
      </div>
      <div className="p-5 space-y-3 max-h-[500px] overflow-y-auto">
        {insights.insights.map((insight, i) => (
          <div key={i} className={`p-4 rounded-xl border ${bgMap[insight.type]} transition-all hover:shadow-sm`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{iconMap[insight.type]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 text-sm">{insight.title}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    insight.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    insight.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                    insight.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl m-8">
        <AlertCircle className="w-5 h-5" /> {error}
      </div>
    </DashboardLayout>
  );

  const categoryData = stats?.chartData?.length
    ? (() => {
        const categories = {};
        return Object.values(categories);
      })()
    : [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time overview of SDK Alkaline Water operations</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Income"
          value={`GH₵${stats.summary.totalIncome.toLocaleString()}`}
          icon={DollarSign}
          description="Last 30 days"
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value={`GH₵${stats.summary.totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          description="Operations & production"
          color="red"
        />
        <StatCard
          title="Net Profit"
          value={`GH₵${stats.summary.netProfit.toLocaleString()}`}
          icon={Activity}
          trend={stats.summary.netProfit >= 0 ? 'Profitable' : 'Deficit'}
          trendType={stats.summary.netProfit >= 0 ? 'up' : 'down'}
          color="blue"
        />
        <StatCard
          title="Daily Revenue Rate"
          value={`GH₵${stats.rates.dailyRevenueRate}`}
          icon={TrendingUp}
          description="Average daily income"
          color="cyan"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value={stats.summary.totalUsers}
          icon={Users}
          description={`${stats.summary.activeUsers} active`}
          color="purple"
        />
        <StatCard
          title="Weekly Production"
          value={`${stats.summary.totalProduction} units`}
          icon={Package}
          color="amber"
        />
        <StatCard
          title="Weekly Dispatch"
          value={`${stats.summary.totalDispatch} units`}
          icon={Truck}
          color="green"
        />
      </div>

      {/* Revenue Velocity Banner */}
      <div className="mb-8 bg-gradient-to-r from-primary-950 to-primary-800 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-primary-300 text-xs font-semibold uppercase tracking-wider">Revenue Velocity</p>
          <p className="text-3xl font-bold mt-1">GH₵{stats.rates.dailyRevenueRate} <span className="text-base font-normal text-primary-300">/ day</span></p>
        </div>
        <div className="text-right">
          <p className="text-primary-300 text-xs font-semibold uppercase tracking-wider">Daily Burn Rate</p>
          <p className="text-3xl font-bold mt-1">GH₵{stats.rates.dailyBurnRate} <span className="text-base font-normal text-primary-300">/ day</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Income vs Expenses (30 Days)</h3>
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="income" stroke="#059669" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#dc2626" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
              No transaction data yet
            </div>
          )}
        </div>

        {/* Production Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Production & Dispatch</h3>
          {stats.productionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.productionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="production" fill="#2563eb" radius={[4, 4, 0, 0]} name="Production" />
                <Bar dataKey="dispatch" fill="#059669" radius={[4, 4, 0, 0]} name="Dispatch" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
              No production data yet
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AIInsightsPanel />

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Recent Notifications</h3>
            </div>
            {stats.unreadNotifications > 0 && (
              <span className="bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {stats.unreadNotifications} new
              </span>
            )}
          </div>
          <div className="p-5 space-y-3 max-h-[500px] overflow-y-auto">
            {stats.notifications.length > 0 ? stats.notifications.map((n) => (
              <div key={n.id} className={`p-3 rounded-xl border transition-all ${n.isRead ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-900 text-sm">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{n.message}</p>
              </div>
            )) : (
              <p className="text-slate-400 text-sm text-center py-8">No notifications yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Recent Daily Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Staff</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Opening</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Production</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Dispatch</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Remaining</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentLogs.length > 0 ? stats.recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-900">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{log.staff?.name || 'N/A'}</td>
                  <td className="px-5 py-3 text-sm text-slate-900 text-right">{log.openingStock}</td>
                  <td className="px-5 py-3 text-sm text-slate-900 text-right">{log.production}</td>
                  <td className="px-5 py-3 text-sm text-slate-900 text-right">{log.dispatch}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">{log.remainingStock}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      log.isLocked ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {log.isLocked ? 'Locked' : 'Open'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-sm">No logs recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
