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
import { SecurityPage }  from './pages/SecurityPage';

function AdminSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner />
    </div>
  );
}

function AdminLogin() {
  // roleResolved: the server role lookup for the current session has finished.
  // Without this gate, `user` flips non-null while the role fetch is still in
  // flight and `!isAdmin` briefly evaluates true — bouncing a genuine
  // super_admin to /portal before their role arrives (observed live).
  const { user, isAdmin, loading, roleResolved, lastEvent } = useAuth();
  if (loading || (user && !roleResolved)) return <AdminSpinner />;
  if (user) {
    // Authenticated but NOT super_admin → this portal is not for them.
    // Send distributors/customers to their own experience cleanly.
    if (!isAdmin) return <Navigate to="/portal" replace />;
    // Arriving via a password-reset link → land on the security page so the
    // user can set their new password immediately.
    if (lastEvent === 'PASSWORD_RECOVERY') return <Navigate to="/admin/security" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <LoginPage />;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, roleResolved } = useAuth();
  if (loading || (user && !roleResolved)) return <AdminSpinner />;
  if (!user) return <Navigate to="/admin" replace />;
  // UI guard only — the database independently enforces super_admin via RLS.
  // A session without the server-side super_admin role is redirected.
  if (!isAdmin) return <Navigate to="/portal" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

/**
 * Full admin route tree — imported lazily from AppRouter so storefront
 * visitors never download admin code (Supabase queries, auth context, etc.).
 */
export default function AdminApp() {
  return (
    <AuthProvider>
      {/* Mounted at path="/admin/*" from AppRouter, so these child routes are
          RELATIVE to the /admin base (a nested <Routes> matches the remaining
          pathname only). Absolute paths like "/admin/dashboard" here would
          match "/admin/admin/dashboard" — i.e. nothing ever matches and the
          router renders null (blank page). */}
      <Routes>
        <Route path="/"              element={<AdminLogin />} />
        <Route path="dashboard"      element={<Protected><DashboardPage /></Protected>} />
        <Route path="products"       element={<Protected><ProductsPage /></Protected>} />
        <Route path="distributors"   element={<Protected><DistributorsPage /></Protected>} />
        <Route path="sales"          element={<Protected><SalesPage /></Protected>} />
        <Route path="loans"          element={<Protected><LoansPage /></Protected>} />
        <Route path="cashflow"       element={<Protected><CashFlowPage /></Protected>} />
        <Route path="testimonials"   element={<Protected><TestimonialsPage /></Protected>} />
        <Route path="settings"       element={<Protected><SettingsPage /></Protected>} />
        <Route path="security"       element={<Protected><SecurityPage /></Protected>} />
        <Route path="*"              element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
