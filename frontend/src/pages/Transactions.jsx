import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { DollarSign, Plus, Loader, AlertCircle } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'INCOME', amount: '', category: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchTransactions = () => {
    api.get('/admin/transactions')
      .then(res => setTransactions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/admin/transactions', formData);
      setMessage({ type: 'success', text: 'Transaction recorded!' });
      setFormData({ type: 'INCOME', amount: '', category: '', description: '' });
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create transaction' });
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 text-sm mt-1">Manage income and expense records</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30">
          <Plus className="w-4 h-4" /> New Transaction
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <DollarSign className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
          <h3 className="font-bold text-slate-900 mb-4">New Transaction</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50">
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (GH₵)</label>
              <input type="number" step="0.01" value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white"
                placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <input type="text" value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white"
                placeholder="e.g. Water Sales, Raw Materials" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description (optional)</label>
              <input type="text" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white"
                placeholder="Brief description" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-slate-600 bg-slate-100 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all disabled:opacity-60 shadow-lg shadow-primary-600/30">
                {submitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-900">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>{t.type}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{t.category}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{t.description || '-'}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-right">
                    <span className={t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}>
                      {t.type === 'INCOME' ? '+' : '-'}GH₵{parseFloat(t.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{t.admin?.name || 'N/A'}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-sm">No transactions recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
