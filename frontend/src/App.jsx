import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CEODashboard from './pages/CEODashboard';
import FactorySupervisorDashboard from './pages/FactorySupervisorDashboard';
import FieldManagerDashboard from './pages/FieldManagerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Transactions from './pages/Transactions';
import DailyLogs from './pages/DailyLogs';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';

const roleRoutes = {
  ADMIN: '/admin',
  CEO: '/ceo',
  FACTORY_SUPERVISOR: '/factory',
  FIELD_MANAGER: '/field',
  STAFF: '/staff',
};

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={roleRoutes[user.role] || '/login'} replace />;

  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={roleRoutes[user.role] || '/staff'} replace /> : <Login />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute roles={['ADMIN']}><Transactions /></ProtectedRoute>} />
      <Route path="/admin/logs" element={<ProtectedRoute roles={['ADMIN']}><DailyLogs /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute roles={['ADMIN']}><NotificationsPage /></ProtectedRoute>} />

      {/* CEO Routes */}
      <Route path="/ceo" element={<ProtectedRoute roles={['CEO']}><CEODashboard /></ProtectedRoute>} />
      <Route path="/ceo/reports" element={<ProtectedRoute roles={['CEO']}><Transactions /></ProtectedRoute>} />
      <Route path="/ceo/users" element={<ProtectedRoute roles={['CEO']}><UsersPage /></ProtectedRoute>} />

      {/* Factory Supervisor Routes */}
      <Route path="/factory" element={<ProtectedRoute roles={['FACTORY_SUPERVISOR']}><FactorySupervisorDashboard /></ProtectedRoute>} />
      <Route path="/factory/logs" element={<ProtectedRoute roles={['FACTORY_SUPERVISOR']}><DailyLogs /></ProtectedRoute>} />
      <Route path="/factory/production" element={<ProtectedRoute roles={['FACTORY_SUPERVISOR']}><FactorySupervisorDashboard /></ProtectedRoute>} />

      {/* Field Manager Routes */}
      <Route path="/field" element={<ProtectedRoute roles={['FIELD_MANAGER']}><FieldManagerDashboard /></ProtectedRoute>} />
      <Route path="/field/dispatch" element={<ProtectedRoute roles={['FIELD_MANAGER']}><FieldManagerDashboard /></ProtectedRoute>} />
      <Route path="/field/logs" element={<ProtectedRoute roles={['FIELD_MANAGER']}><DailyLogs /></ProtectedRoute>} />

      {/* Staff Routes */}
      <Route path="/staff" element={<ProtectedRoute roles={['STAFF']}><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/logs" element={<ProtectedRoute roles={['STAFF']}><StaffDashboard /></ProtectedRoute>} />

      {/* Default */}
      <Route path="*" element={<Navigate to={user ? roleRoutes[user.role] || '/staff' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
