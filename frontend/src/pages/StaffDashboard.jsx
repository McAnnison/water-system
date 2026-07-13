import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { ClipboardList, Package, Loader, AlertCircle, Plus } from 'lucide-react';

export default function StaffDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ openingStock: '', production: '', dispatch: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchLogs = () => {
    api.get('/logs')
      .then(res => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/logs', {
        openingStock: parseInt(formData.openingStock) || 0,
        production: parseInt(formData.production) || 0,
        dispatch: parseInt(formData.dispatch) || 0
      });
      setMessage({ type: 'success', text: 'Daily log submitted successfully!' });
      setFormData({ openingStock: '', production: '', dispatch: '' });
      setShowForm(false);
      fetchLogs();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit log' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    </DashboardLayout>
  );

  const myLogs = logs.slice(0, 10);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Submit and view daily production logs</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus className="w-4 h-4" /> New Log Entry
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <Package className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
          <h3 className="font-bold text-slate-900 mb-4">New Daily Log</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Opening Stock</label>
              <input type="number" value={formData.openingStock}
                onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white"
                placeholder="0" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Production</label>
              <input type="number" value={formData.production}
                onChange={(e) => setFormData({ ...formData, production: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white"
                placeholder="0" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Dispatch</label>
              <input type="number" value={formData.dispatch}
                onChange={(e) => setFormData({ ...formData, dispatch: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white"
                placeholder="0" required />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-slate-600 bg-slate-100 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all disabled:opacity-60 shadow-lg shadow-primary-600/30">
                {submitting ? 'Submitting...' : 'Submit Log'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <StatCard title="Total Logs" value={logs.length} icon={ClipboardList} color="blue" />
        <StatCard title="Current Stock" value={`${logs[0]?.remainingStock || 0} units`} icon={Package} color="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Recent Log Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Opening</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Production</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Dispatch</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Remaining</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-900">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 text-right">{log.openingStock}</td>
                  <td className="px-5 py-3 text-sm text-blue-600 font-semibold text-right">{log.production}</td>
                  <td className="px-5 py-3 text-sm text-emerald-600 font-semibold text-right">{log.dispatch}</td>
                  <td className="px-5 py-3 text-sm font-bold text-slate-900 text-right">{log.remainingStock}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      log.isLocked ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {log.isLocked ? 'Locked' : 'Open'}
                    </span>
                  </td>
                </tr>
              ))}
              {myLogs.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-sm">No logs submitted yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
