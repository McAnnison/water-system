import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, LogOut, Users, FileText, Bell,
  DollarSign, Factory, Truck, ClipboardList, Settings, Droplets
} from 'lucide-react';

const roleMenus = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/transactions', label: 'Transactions', icon: DollarSign },
    { to: '/admin/logs', label: 'Daily Logs', icon: ClipboardList },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
  CEO: [
    { to: '/ceo', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ceo/reports', label: 'Reports', icon: FileText },
    { to: '/ceo/users', label: 'Manage Users', icon: Users },
  ],
  FACTORY_SUPERVISOR: [
    { to: '/factory', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/factory/logs', label: 'Daily Logs', icon: ClipboardList },
    { to: '/factory/production', label: 'Production', icon: Factory },
  ],
  FIELD_MANAGER: [
    { to: '/field', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/field/dispatch', label: 'Dispatch', icon: Truck },
    { to: '/field/logs', label: 'Logs', icon: ClipboardList },
  ],
  STAFF: [
    { to: '/staff', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/logs', label: 'Daily Logs', icon: ClipboardList },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menu = roleMenus[user?.role] || [];

  const roleLabels = {
    ADMIN: 'Administrator',
    CEO: 'Chief Executive',
    FACTORY_SUPERVISOR: 'Factory Supervisor',
    FIELD_MANAGER: 'Field Manager',
    STAFF: 'Staff',
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-950 text-white flex flex-col z-50">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">SDK Alkaline</h1>
            <p className="text-[11px] text-primary-300 leading-tight">Water System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${user?.role?.toLowerCase()}` || item.to === '/admin' || item.to === '/ceo' || item.to === '/factory' || item.to === '/field' || item.to === '/staff'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-primary-300 truncate">{roleLabels[user?.role] || user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
