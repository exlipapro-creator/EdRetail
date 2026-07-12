import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage }    from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage }  from './pages/ProductsPage';
import { SalesPage }     from './pages/SalesPage';
import { LoansPage }     from './pages/LoansPage';
import { CashFlowPage }  from './pages/CashFlowPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/admin" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

export function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        {/* relative paths — this component is mounted at /admin/* */}
        <Route index element={<LoginRedirect />} />
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="products"  element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="sales"     element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
        <Route path="loans"     element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
        <Route path="cashflow"  element={<ProtectedRoute><CashFlowPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

function LoginRedirect() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return <LoginPage />;
}
