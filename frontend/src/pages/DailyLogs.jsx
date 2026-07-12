import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { Lock, Unlock, Loader } from 'lucide-react';

export default function DailyLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    api.get('/logs')
      .then(res => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const toggleLock = async (id) => {
    try {
      await api.patch(`/logs/${id}/lock`);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle lock');
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <PageHeader title="Daily Logs" subtitle="View and manage all production logs" />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Staff</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Opening</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Production</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Total</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Dispatch</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Remaining</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-900 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{log.staff?.name || 'N/A'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 text-right">{log.openingStock}</td>
                  <td className="px-5 py-3 text-sm text-blue-600 font-semibold text-right">{log.production}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 text-right">{log.totalInStock}</td>
                  <td className="px-5 py-3 text-sm text-emerald-600 font-semibold text-right">{log.dispatch}</td>
                  <td className="px-5 py-3 text-sm font-bold text-slate-900 text-right">{log.remainingStock}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => toggleLock(log.id)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                        log.isLocked
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}>
                      {log.isLocked ? <><Lock className="w-3 h-3" /> Locked</> : <><Unlock className="w-3 h-3" /> Open</>}
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="8" className="px-5 py-8 text-center text-slate-400 text-sm">No logs recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
