import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Spinner } from '../components/ui';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage }    from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage }  from './pages/ProductsPage';
import { DistributorsPage } from './pages/DistributorsPage';
import { SalesPage }     from './pages/SalesPage';
import { LoansPage }     from './pages/LoansPage';
import { CashFlowPage }  from './pages/CashFlowPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { SettingsPage }  from './pages/SettingsPage';

function AdminSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner />
    </div>
  );
}

function AdminLogin() {
  const { user, loading } = useAuth();
  if (loading) return <AdminSpinner />;
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return <LoginPage />;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AdminSpinner />;
  if (!user) return <Navigate to="/admin" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

/**
 * Full admin route tree — imported lazily from AppRouter so storefront
 * visitors never download admin code (Supabase queries, auth context, etc.).
 */
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin"              element={<AdminLogin />} />
        <Route path="/admin/dashboard"    element={<Protected><DashboardPage /></Protected>} />
        <Route path="/admin/products"     element={<Protected><ProductsPage /></Protected>} />
        <Route path="/admin/distributors" element={<Protected><DistributorsPage /></Protected>} />
        <Route path="/admin/sales"        element={<Protected><SalesPage /></Protected>} />
        <Route path="/admin/loans"        element={<Protected><LoansPage /></Protected>} />
        <Route path="/admin/cashflow"     element={<Protected><CashFlowPage /></Protected>} />
        <Route path="/admin/testimonials" element={<Protected><TestimonialsPage /></Protected>} />
        <Route path="/admin/settings"     element={<Protected><SettingsPage /></Protected>} />
        <Route path="/admin/*"            element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
