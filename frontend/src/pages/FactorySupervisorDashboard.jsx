import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import {
  Factory, Package, Truck, TrendingUp,
  AlertCircle, Loader
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function FactorySupervisorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/logs/production-stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load production data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading production data...</p>
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

  const avgDailyProduction = stats.productionChart.length > 0
    ? Math.round(stats.monthly.production / stats.productionChart.length)
    : 0;
  const overallEfficiency = stats.monthly.production > 0
    ? (stats.monthly.dispatch / stats.monthly.production * 100).toFixed(1)
    : 0;

  return (
    <DashboardLayout>
      <PageHeader title="Factory Supervisor Dashboard" subtitle="Production monitoring and inventory management" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Weekly Production"
          value={`${stats.weekly.production} units`}
          icon={Factory}
          description="This week's output"
          color="blue"
        />
        <StatCard
          title="Weekly Dispatch"
          value={`${stats.weekly.dispatch} units`}
          icon={Truck}
          description="Shipped this week"
          color="green"
        />
        <StatCard
          title="Current Stock"
          value={`${stats.currentStock} units`}
          icon={Package}
          description="Available inventory"
          color="amber"
        />
        <StatCard
          title="Efficiency Rate"
          value={`${stats.efficiencyRate}%`}
          icon={TrendingUp}
          description="Dispatch / Production"
          trend={stats.efficiencyRate >= 70 ? 'Good' : 'Needs Attention'}
          trendType={stats.efficiencyRate >= 70 ? 'up' : 'down'}
          color="purple"
        />
      </div>

      {/* Monthly Stats Banner */}
      <div className="mb-8 bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 rounded-2xl shadow-lg shadow-emerald-900/20 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Monthly Production</p>
          <p className="text-2xl font-bold mt-1">{stats.monthly.production}</p>
          <p className="text-emerald-300 text-xs">units</p>
        </div>
        <div>
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Monthly Dispatch</p>
          <p className="text-2xl font-bold mt-1">{stats.monthly.dispatch}</p>
          <p className="text-emerald-300 text-xs">units</p>
        </div>
        <div>
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Avg Daily Production</p>
          <p className="text-2xl font-bold mt-1">{avgDailyProduction}</p>
          <p className="text-emerald-300 text-xs">units/day</p>
        </div>
        <div>
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Overall Efficiency</p>
          <p className="text-2xl font-bold mt-1">{overallEfficiency}%</p>
          <p className="text-emerald-300 text-xs">dispatch rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Production vs Dispatch Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Production vs Dispatch Trend</h3>
          {stats.productionChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.productionChart}>
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
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
              No production data available
            </div>
          )}
        </div>

        {/* Stock Level Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Stock Level Trend</h3>
          {stats.productionChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.productionChart}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="stock" stroke="#7c3aed" fill="url(#stockGrad)" strokeWidth={2} name="Stock Level" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
              No stock data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Recent Production Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Opening Stock</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Production</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Total</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Dispatch</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Remaining</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentLogs.length > 0 ? stats.recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-900 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 text-right">{log.openingStock}</td>
                  <td className="px-5 py-3 text-sm text-blue-600 font-semibold text-right">{log.production}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 text-right">{log.totalInStock}</td>
                  <td className="px-5 py-3 text-sm text-emerald-600 font-semibold text-right">{log.dispatch}</td>
                  <td className="px-5 py-3 text-sm font-bold text-slate-900 text-right">{log.remainingStock}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      log.isLocked ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {log.isLocked ? 'Locked' : 'Active'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400 text-sm">No production logs recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
