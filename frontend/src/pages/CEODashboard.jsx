import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import {
  DollarSign, TrendingDown, TrendingUp, Activity, Users,
  Package, Truck, Loader, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function CEODashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    </DashboardLayout>
  );

  if (!stats) return (
    <DashboardLayout>
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
        <AlertCircle className="w-5 h-5" /> Failed to load dashboard
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">CEO Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Executive summary of SDK Alkaline Water operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Revenue" value={`GH₵${stats.summary.totalIncome.toLocaleString()}`} icon={DollarSign} color="green" description="Last 30 days" />
        <StatCard title="Total Expenses" value={`GH₵${stats.summary.totalExpenses.toLocaleString()}`} icon={TrendingDown} color="red" />
        <StatCard title="Net Profit" value={`GH₵${stats.summary.netProfit.toLocaleString()}`} icon={Activity} color="blue"
          trend={stats.summary.netProfit >= 0 ? 'Profitable' : 'Deficit'}
          trendType={stats.summary.netProfit >= 0 ? 'up' : 'down'}
        />
        <StatCard title="Team Size" value={stats.summary.totalUsers} icon={Users} color="purple" description={`${stats.summary.activeUsers} active`} />
      </div>

      <div className="mb-8 bg-gradient-to-r from-indigo-900 to-violet-800 text-white p-6 rounded-2xl shadow-lg grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Revenue Rate</p>
          <p className="text-2xl font-bold mt-1">GH₵{stats.rates.dailyRevenueRate}</p>
          <p className="text-indigo-300 text-xs">per day</p>
        </div>
        <div>
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Burn Rate</p>
          <p className="text-2xl font-bold mt-1">GH₵{stats.rates.dailyBurnRate}</p>
          <p className="text-indigo-300 text-xs">per day</p>
        </div>
        <div>
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Production</p>
          <p className="text-2xl font-bold mt-1">{stats.summary.totalProduction}</p>
          <p className="text-indigo-300 text-xs">units this week</p>
        </div>
        <div>
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Dispatched</p>
          <p className="text-2xl font-bold mt-1">{stats.summary.totalDispatch}</p>
          <p className="text-indigo-300 text-xs">units this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Financial Overview (30 Days)</h3>
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="ceoIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ceoExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="income" stroke="#059669" fill="url(#ceoIncome)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#dc2626" fill="url(#ceoExpense)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No data available</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4">Production & Dispatch</h3>
          {stats.productionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.productionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="production" fill="#2563eb" radius={[4, 4, 0, 0]} name="Production" />
                <Bar dataKey="dispatch" fill="#059669" radius={[4, 4, 0, 0]} name="Dispatch" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No data available</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
