import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { Truck, Package, ClipboardList, Loader, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FieldManagerDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/logs')
      .then(res => setLogs(res.data))
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

  const recentLogs = logs.slice(0, 14);
  const totalDispatch = recentLogs.reduce((sum, l) => sum + l.dispatch, 0);
  const totalProduction = recentLogs.reduce((sum, l) => sum + l.production, 0);
  const currentStock = logs[0]?.remainingStock || 0;

  const chartData = recentLogs.map(l => ({
    date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dispatch: l.dispatch,
    stock: l.remainingStock
  })).reverse();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Field Manager Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Distribution and dispatch tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard title="Recent Dispatch" value={`${totalDispatch} units`} icon={Truck} color="green" description="Last 14 entries" />
        <StatCard title="Current Stock" value={`${currentStock} units`} icon={Package} color="amber" />
        <StatCard title="Total Logs" value={logs.length} icon={ClipboardList} color="blue" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
        <h3 className="font-bold text-slate-900 mb-4">Dispatch & Stock Trends</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="dispatch" fill="#059669" radius={[4, 4, 0, 0]} name="Dispatch" />
              <Bar dataKey="stock" fill="#d97706" radius={[4, 4, 0, 0]} name="Remaining Stock" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">No data available</div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Recent Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Staff</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Production</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Dispatch</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-900">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{log.staff?.name || 'N/A'}</td>
                  <td className="px-5 py-3 text-sm text-slate-900 text-right">{log.production}</td>
                  <td className="px-5 py-3 text-sm text-emerald-600 font-semibold text-right">{log.dispatch}</td>
                  <td className="px-5 py-3 text-sm font-bold text-slate-900 text-right">{log.remainingStock}</td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-400 text-sm">No logs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
