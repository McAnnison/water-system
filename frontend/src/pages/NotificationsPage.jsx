import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { Bell, Check, CheckCheck, Loader } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    </DashboardLayout>
  );

  const unread = notifications.filter(n => !n.isRead).length;

  const typeColors = {
    USER_REGISTERED: 'border-l-blue-500',
    USER_LOGIN: 'border-l-slate-400',
    TRANSACTION_CREATED: 'border-l-emerald-500',
    LOG_CREATED: 'border-l-purple-500',
    LOG_UPDATED: 'border-l-amber-500',
    LOG_LOCK_TOGGLED: 'border-l-red-500',
  };

  return (
    <DashboardLayout>
      <PageHeader title="Notifications" subtitle={unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}>
        {unread > 0 && (
          <button onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </PageHeader>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id}
            className={`bg-white rounded-2xl border shadow-sm p-5 border-l-4 transition-all hover:shadow-md ${
              typeColors[n.type] || 'border-l-slate-300'
            } ${!n.isRead ? 'border-slate-200 bg-blue-50/30' : 'border-slate-100'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 text-sm">{n.title}</h3>
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse-soft" />
                  )}
                </div>
                <p className="text-slate-600 text-sm">{n.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {!n.isRead && (
                <button onClick={() => markAsRead(n.id)}
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                  title="Mark as read">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
